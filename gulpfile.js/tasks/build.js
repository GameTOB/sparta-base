var gulp = require('gulp');
var gulpSize = require('gulp-size');
var sequence = require('gulp-sequence');
var config = require('../config/index');
var fs = require('fs');

gulp.task('buildSetup' , function(cb){
	//可以被 default/deploy 中的定义覆盖
	
	//此处不存在 conf/user/app_conf.json
	var allAppkeys = Object.keys(JSON.parse(fs.readFileSync(config.confDirectory + '/options/app_conf/'+process.env.NODE_ENV+'.json')));
	appkeys = (process.env.APP!="" && allAppkeys.indexOf(process.env.APP)>-1) ? [process.env.APP] : allAppkeys ;

	console.log("PWD:" ,process.env.PWD);
	console.log("USER:" ,process.env.USER);
	console.log("APP:" , appkeys);
	console.log("NODE_ENV:" ,process.env.NODE_ENV);
	console.log("NEED_WATCH:" , process.env.NEED_WATCH);
	console.log("HTTP_SERVER:" , process.env.HTTP_SERVER);

	cb();
});
gulp.task('buildTeardown' , function(cb){
	//可以被 default/deploy 中的定义覆盖
	return gulp.src(config.destDirectory+'/**/*').pipe(gulpSize({title: 'build stat', gzip: true}));
});


gulp.task('build', function(cb) {

	var tasks = [];

	tasks.push('buildSetup' ,'buildInit' , 'buildAsset' ,'buildDist');

	if(process.env.HTTP_SERVER){
		//console.log("process.env.HTTP_SERVER", process.env.HTTP_SERVER);
		tasks.push('httpServer');
	}

	if(process.env.NEED_WATCH){
		//console.log("process.env.NEED_WATCH", process.env.NEED_WATCH);
		tasks.push('watch');
	}

	tasks.push('buildTeardown', cb);

	sequence.apply(this,tasks);
	
});