var gulp = require('gulp'),
	del = require('del'),
	sequence = require('gulp-sequence'),
	data 	 = require('gulp-data'),
	rename   = require('gulp-rename'),
	gulpif   = require('gulp-if'),
	swig     = require('gulp-swig'),
	browserSync = require('browser-sync');

var config = require('../config/build'),
	appConf = require('../lib/app-conf'),
	appTask = require('../lib/app-task');

gulp.task('init::clean', function (cb) {

  del([
    config.destDirectory ,
    config.confDirectory + '/used'
  ], cb);

});

gulp.task('init::conf', function (cb) {
  
  return gulp.src(config.confDirectory + '/options/app_conf/'+ process.env.NODE_ENV +'.json')
		.pipe(data(function(){
			return { 
				DOMAIN_PREFIX : process.env.USER+"."
			}; 
		})) 
		.pipe(swig({ext : ".json"})) 
		.pipe(rename("app_conf.json"))
		.pipe(gulp.dest(config.confDirectory + '/used'));

});

gulp.task('init::vendor', function (cb) {

    //这种做法存在NODE文件缓存 但这里可以用
    var packages = require('../../package.json');
    var depends = packages.dependencies ? (Object.keys(packages.dependencies)) : [],
        src = 'node_modules/+(' + depends.join("|") + ')/**/*';
    return gulp.src(src)
  		.pipe(gulp.dest(config.destDirectory+'/vendor'));
});


gulp.task("buildInit" , function(cb){

	sequence("init::clean" , "init::conf" , "init::vendor" , cb);

});