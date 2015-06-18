var gulp = require('gulp'),
    sequence = require('gulp-sequence'),
    appConf = require('./app-conf.js');

var tasks = [];

/**
 * 考虑 是否有必要用 process.nextTick 来做自动 finish 呢？
 */

var control = {
	start : function(){
		tasks = [];
	},
	append : function(name,task){
		var appkeys = appConf.getAppkeys();
		appkeys.forEach(function(appkey) {
			gulp.task(name+'[' + appkey + ']', function() {
				return task(appkey);
	        });
		    tasks.push(name+'[' + appkey + ']');
		});
	},
	finish : function(cb){
		tasks.push(cb);
		sequence.apply(this, tasks);
		tasks = [];
	}
};

module.exports = control;