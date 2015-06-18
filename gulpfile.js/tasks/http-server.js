var gulp = require('gulp'),
    del  = require('del'),
    data = require('gulp-data'),
    rename  = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    swig    = require('gulp-swig'),
    browserSync = require('browser-sync'),
	modRewrite = require('connect-modrewrite'),
	logger = require('connect-logger'),
    shell  		= require('gulp-shell');

var config = require('../config'),
	appConf = require('../lib/app-conf'),
    appTask = require('../lib/app-task');

var browserSyncConf = {
	server: {
	    baseDir: [ config.destDirectory , config.destDirectory + "/apps"] ,
	    index: ["index.html"] ,
	    middleware: [
	    	modRewrite([
	    		"^/\\w+/vendor/ /vendor/ [L]",
	    		"^/\\w+/module/ /module/ [L]",
	    		"^/\\w+/framework/ /framework/ [L]"
	    		]),
	    	//logger()
	    ]
	},
	open : "local"
};

gulp.task('httpServer::ngxconf' , function(cb){

	if(process.env.HTTP_SERVER!="nginx"){
		return cb();
	}

	appTask.start();

	var ngxconfFile = config.confDirectory + '/options/tpl_sparta-module_ngx.conf' ;

	appTask.append("httpServer::ngxconf", function(appkey){

		return gulp.src(ngxconfFile)
		.pipe(data(function(){
			return { 
				DOMAIN_PREFIX : process.env.USER+"."+appkey+".",
				PRJROOT : process.env.PWD ,
				APPKEY : appkey
			}; 
		})) 
		.pipe(swig({ext : ".conf"})) 
		.pipe(rename(process.env.USER+"_"+appkey+"_sparta-module_ngx.conf"))
		.pipe(gulp.dest(config.confDirectory + '/used'))
		//如果已经有过link此时主动reload一下
		.pipe(shell("sudo service nginx reload"));

	});

	appTask.finish(cb);

});


gulp.task('httpServer', ['httpServer::ngxconf'] , function() {

	//开发机使用nginx方式建立调试环境
	if(process.env.HTTP_SERVER=="nginx"){

		var tmpStream = gulp.src(config.confDirectory).pipe(plumber());
		var ngxconfSrc , ngxconfDest;

		appConf.getAppkeys().forEach(function(appkey){

			ngxconfSrc  = process.env.PWD +"/"+config.confDirectory + "/used/"+process.env.USER+"_"+appkey+"_sparta-module_ngx.conf";
			ngxconfDest = "/usr/local/nginx/conf/include/"+process.env.USER+"_"+appkey+"_sparta-module_ngx.conf";
			console.log("sudo ln -s "+ngxconfSrc+" "+ngxconfDest);
			tmpStream = tmpStream.pipe(shell("sudo ln -s "+ngxconfSrc+" "+ngxconfDest));
		});
		//如果软链错误则不 reload nginx
		console.log("sudo service nginx reload");
		tmpStream = tmpStream.pipe(shell("sudo service nginx reload"));
		return tmpStream;

	}else if(process.env.HTTP_SERVER=="nodejs"){
		console.log("httpServer","nodejs");
		return browserSync(browserSyncConf);
	}else{
		console.log("httpServer","nothing to do");
		//nothing to do
	}
  
});