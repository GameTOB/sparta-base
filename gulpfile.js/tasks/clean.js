var gulp = require('gulp'),
	sequence = require('gulp-sequence');
	
var config = require('../config');

gulp.task('clean', function (cb) {
	sequence('init::clean','deploy::cleanTmp','deploy::cleanOutput' ,cb);
});