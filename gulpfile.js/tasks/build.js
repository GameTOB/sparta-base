var gulp = require('gulp');
var sequence = require('gulp-sequence');

gulp.task('build', function(cb) {

	var tasks = [];

	tasks.push('buildInit' , 'buildAsset' ,'buildDist');

	if(process.env.HTTP_SERVER){
		//console.log("process.env.HTTP_SERVER", process.env.HTTP_SERVER);
		tasks.push('httpServer');
	}

	if(process.env.NEED_WATCH){
		//console.log("process.env.NEED_WATCH", process.env.NEED_WATCH);
		tasks.push('watch');
	}

	tasks.push(cb);

	sequence.apply(this,tasks);
	
});