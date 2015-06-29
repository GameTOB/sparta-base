var gulp     = require('gulp'),
	plumber  = require('gulp-plumber'),
	ghPages  = require('gulp-gh-pages'),
	del      = require('del'),
	sequence = require('gulp-sequence');

var config  = require('../config/deploy'),
	appConf = require('../lib/app-conf'),
	appTask = require('../lib/app-task');



var appkey = "example"

gulp.task('deploy::clean' , function(cb){
	del([
    	config.tmpDirectory
  	], cb);
});	

gulp.task('deploy::ready' , function(cb){
	return gulp.src([config.destDirectory+'/apps/'+appkey+'/**/*' , config.destDirectory+'/+(framework|module)/**/*' ])
  		.pipe(plumber())
    	.pipe(gulp.dest(config.tmpDirectory));
});

gulp.task('deploy::push' , function(cb){
	return gulp.src(config.tmpDirectory+'/**/*')
  		.pipe(plumber())
    	.pipe(ghPages());
});


gulp.task('deploy', function(cb) {
 
	process.env.NODE_ENV = "dev";
	process.env.NEED_WATCH  = "";
	process.env.HTTP_SERVER = "";
  	sequence('build','deploy::clean' ,'deploy::ready' , 'deploy::push' , cb);

});