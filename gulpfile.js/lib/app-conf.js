var fs = require('fs');
var config = require('../config');

var appkeys = [];

var conf = {
	read : function(){
		var devApp = {} ,
			allApp = JSON.parse(fs.readFileSync(config.confDirectory + '/used/app_conf.json')),
			appkeys = conf.getAppkeys();

		appkeys.forEach(function(appkey){
			devApp[appkey] = allApp[appkey];
		});
		return devApp;
	},
	getAppkeys : function(){
		if(appkeys.length==0){
			var allAppkeys = Object.keys(JSON.parse(fs.readFileSync(config.confDirectory + '/used/app_conf.json')));
			//cached
			appkeys = (process.env.APP!="" && allAppkeys.indexOf(process.env.APP)>-1) ? [process.env.APP] : allAppkeys ;
		}
		return appkeys;
	}
}

module.exports = conf;