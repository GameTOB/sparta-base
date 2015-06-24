var gulp     = require('gulp'),
	plumber  = require('gulp-plumber'),
	ghPages = require('gulp-gh-pages'),
	sequence = require('gulp-sequence');

var config  = require('../config/deploy'),
	appConf = require('../lib/app-conf'),
	appTask = require('../lib/app-task');

//实现较挫 需要重构为 before + after 模式
process.env.NODE_ENV = "dev";
process.env.NEED_WATCH  = "";
process.env.HTTP_SERVER = "";

gulp.task('deploy',['build'], function() {
  return gulp.src(config.destDirectory+'/**/*')
  	.pipe(plumber())
    .pipe(ghPages());
});