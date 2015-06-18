var gulp = require('gulp'),
    del  = require('del'),
    data = require('gulp-data'),
    rename  = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    swig    = require('gulp-swig'),
    browserSync = require('browser-sync');

var config = require('../config');

gulp.task('watch' , function(){

	var appkeys = require('../lib/app-conf').getAppkeys();

	gulp.watch(config.srcDirectory +'/apps/guide.html', ['init::apps']);
	gulp.watch(config.srcDirectory +'/apps/+('+ appkeys.join("|") +')/*.html', ['buildDist']);
	gulp.watch(config.srcDirectory +'/apps/+('+ appkeys.join("|") +')/app/**/*', ['asset::apps','buildDist']);
	gulp.watch(config.srcDirectory +'/apps/+('+ appkeys.join("|") +')/view/**/*', ['asset::apps','buildDist']);
	gulp.watch(config.srcDirectory +'/module/**/*', ['asset::module','buildDist']);
	gulp.watch(config.srcDirectory +'/framework/**/*', ['asset::framework','buildDist']);

});