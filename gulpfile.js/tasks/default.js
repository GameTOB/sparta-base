var gulp = require('gulp');
var minimist = require('minimist');
var gulpSize = require('gulp-size');
var config = require('../config/index');
var fs = require('fs');

/* 
  取得当前环境  --env dev/demo/online 
  指定当前用户  --user zhouyao 
*/
var options = minimist(process.argv.slice(2), {
  string: ['env' , 'user' , 'watch' , 'app' , 'httpServer'],
  default: { env: "dev" , user: "" , watch: "true" , app : "" , httpServer : process.env.SSH_CONNECTION ? "nginx" : "nodejs"}
});
process.env.NODE_ENV = ["dev"].indexOf(options.env)==-1 ? "dev" : options.env;
process.env.USER = options.user ? options.user : process.env.USER;
//process.env.* 不存在BOOL类型
process.env.NEED_WATCH = options.watch=="false" || options.watch=="" ? "" : "true";
process.env.HTTP_SERVER = options.httpServer=="nodejs"||options.httpServer=="nginx" ? options.httpServer : "";
//指定单个APP
process.env.APP = options.app ;

//此处不存在 conf/user/app_conf.json
var allAppkeys = Object.keys(JSON.parse(fs.readFileSync(config.confDirectory + '/options/app_conf/'+process.env.NODE_ENV+'.json')));
appkeys = (process.env.APP!="" && allAppkeys.indexOf(process.env.APP)>-1) ? [process.env.APP] : allAppkeys ;

gulp.task('printEnv' , function(){
	console.log("PWD:" ,process.env.PWD);
	console.log("USER:" ,process.env.USER);
	console.log("APP:" , appkeys);
	console.log("NODE_ENV:" ,process.env.NODE_ENV);
	console.log("NEED_WATCH:" , process.env.NEED_WATCH);
	console.log("HTTP_SERVER:" , process.env.HTTP_SERVER);
});

gulp.task('default', ['printEnv' ,'build'],function(){
	return gulp.src(config.destDirectory+'/**/*').pipe(gulpSize({title: 'build', gzip: true}));
});