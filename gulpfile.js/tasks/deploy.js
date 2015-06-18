var gulp     = require('gulp'),
	through  = require('through2');
    gutil    = require('gulp-util'),
	shell    = require('gulp-shell'),
	del      = require('del'),
	rename   = require('gulp-rename'),
	sequence = require('gulp-sequence');

var config  = require('../config/deploy'),
	appConf = require('../lib/app-conf'),
	appTask = require('../lib/app-task');

config.outputDirectory = "output";

var userStcConf = "stc_conf.php",
	tplStcConf = "tpl_stc_conf.php";


var prefixAssestsForSTC = function (prefix) {

    function findJavascriptResources(htmlStr) {
        var JS_REGEX = /<script.*?src=(?:'|")(.*?)(?:'|")/g,
            resultsArray = [],
            matchArray;

        while (matchArray = JS_REGEX.exec(htmlStr)) {
            resultsArray.push(matchArray[1]);
        }

        return resultsArray;
    }

    function findCSSResources(htmlStr) {
        var CSS_REGEX = /<link.*?href=(?:'|")(.*?\.css)(?:'|")/gi,
            resultsArray = [],
            matchArray;

        while (matchArray = CSS_REGEX.exec(htmlStr)) {
            resultsArray.push(matchArray[1]);
        }

        return resultsArray;
    }

    return through.obj(function (file , enc ,cb ) {
    	if (file.isNull()) {
	      this.push(file);
	      return cb();
	    }

        if (file.isStream()) {
	      this.emit('error', new gutil.PluginError('gulp-prefixAssestsForSTC', 'Streaming not supported'));
	      return cb();
	    }

        if(!prefix){
        	return cb();
        }
        var stream = this;
        var htmlContent = String(file.contents),
            currentStream = this,
            filesSrc = [];
        filesSrc = filesSrc.concat(findJavascriptResources(htmlContent));
        filesSrc = filesSrc.concat(findCSSResources(htmlContent));

        //暴力
        filesSrc.forEach(function (fileSrc) {
            htmlContent = htmlContent.split(fileSrc).join(prefix+"/"+fileSrc); 
        });

        file.contents = new Buffer(htmlContent);
        stream.push(file);
        cb();
    });
};


gulp.task('deploy::cleanTmp', function (cb) {

  del([
    config.tmpDirectory
  ], cb);

});

gulp.task('deploy::cleanOutput', function (cb) {

  del([
    config.outputDirectory
  ], cb);

});


gulp.task('deploy::createTmp' , function(cb){

	appTask.start();
	appTask.append("deploy::mktmp::prefixAssests" , function(appkey){

		return gulp.src(config.destDirectory + '/apps/'+ appkey +'/*.html')
			.pipe(prefixAssestsForSTC('static/module'))
			.pipe(rename(process.env.NODE_ENV  + ".html"))
	    	.pipe(gulp.dest(config.tmpDirectory+'/'+appkey));

	});

	appTask.append("deploy::mktmp::copyBaseAssets" , function(appkey){
		return gulp.src(config.destDirectory + '/+(framework|module|vendor)/**/*')
	    	.pipe(gulp.dest(config.tmpDirectory+'/'+appkey+'/static/module'));
	});

	appTask.append("deploy::mktmp::copyAppAssets" , function(appkey){
		return gulp.src(config.destDirectory + '/apps/'+ appkey +'/+(app)/**/*')
	    	.pipe(gulp.dest(config.tmpDirectory+'/'+appkey+'/static/module'));
	});

	appTask.finish(cb);
});

gulp.task('deploy::buildStcConfig' , function(cb){
	var stcConfFile = config.confDirectory + '/options/' + tplStcConf ;
	return gulp.src(stcConfFile)
		.pipe(rename(userStcConf))
		.pipe(gulp.dest(config.confDirectory + '/used'));
});


gulp.task('deploy::applyStcConfig' , function(cb){
	appTask.start();

	appTask.append("deploy::applyStcConfig" , function(appkey){
		return gulp.src(config.confDirectory + '/used/'+ userStcConf)
				.pipe(rename('config.php'))
	    		.pipe(gulp.dest(config.tmpDirectory+'/'+appkey));
	});

	appTask.finish(cb);
});

gulp.task('deploy::compile' , function(cb){

	appTask.start();

	appTask.append("deploy::compile" , function(appkey){
		var cmd = 'php /home/q/php/STC/index.php '+config.tmpDirectory+'/'+appkey+'/ sparta online';
			console.log(cmd);
		return gulp.src(config.tmpDirectory)
    		.pipe(shell([cmd]));
	});

	appTask.finish(cb);
});

gulp.task('deploy::place' , function(cb){

	appTask.start();

	appTask.append("deploy::place" , function(appkey){
		return gulp.src(config.tmpDirectory +'/' +appkey+'/output/*.html')	
	    	.pipe(gulp.dest(config.outputDirectory+'/'+appkey));
	});

	appTask.finish(cb);

});

['dev','demo','online'].forEach(function(env){
	gulp.task('deploy::'+env , function(cb){
		process.env.NODE_ENV = env;
		sequence('build','deploy::cleanTmp' ,'deploy::createTmp' , 'deploy::buildStcConfig', 'deploy::applyStcConfig'  , 'deploy::compile' ,'deploy::place', /*'deploy::cleanTmp' ,*/cb);
	});
})

gulp.task('deploy', function(cb){
	process.env.NEED_WATCH  = "";
	process.env.HTTP_SERVER = "";

	sequence('deploy::cleanOutput','deploy::dev', 'deploy::demo' , 'deploy::online', cb);

});