var gulp = require('gulp');
var minimist = require('minimist');
var config = require('../config/index');
var fs = require('fs');


gulp.task('default::initUserDefine' , function(cb){
		/* 
		  --env dev/demo/online 
		  --user zhouyao/默认留空为系统当前用户 
		  --watch  false/默认留空启用
		  --app    [appkey]/默认留空全部app
		  --httServer  nginx/nodejs/默认有ssh链路则为nginx，否则为nodejs/""(传入空值 则不启用)
		*/
		var options = minimist(process.argv.slice(2), {
		  string: ['env' , 'user' , 'watch' , 'app' , 'httpServer'],
		  default: { env: "dev" , user: "" , watch: "true" , app : "" , httpServer : process.env.SSH_CONNECTION ? "nginx" : "nodejs"}
		});
		process.env.NODE_ENV = ["dev","demo","online"].indexOf(options.env)==-1 ? "dev" : options.env;
		process.env.USER = options.user ? options.user : process.env.USER;
		//process.env.* 不存在BOOL类型
		process.env.NEED_WATCH = options.watch=="false" || options.watch=="" ? "" : "true";
		process.env.HTTP_SERVER = options.httpServer=="nodejs"||options.httpServer=="nginx" ? options.httpServer : "";
		//指定单个APP
		process.env.APP = options.app ;
		cb();
});

gulp.task('default', ['default::initUserDefine'],function(){
	gulp.start("build");
});