var vendorGlobs = {};
var regVendorGlob = function(vendor , globs){
	if(typeof globs == "string"){
		globs = [globs];
	}
	vendorGlobs[vendor] = globs;
}
regVendorGlob("angular",["/*.{js,css}",]);
regVendorGlob("angular-animate",["/*.js"]);
regVendorGlob("angular-bootstrap",["/+(dist)/*.js"]);
regVendorGlob("angular-mocks",["/*.js"]);
regVendorGlob("angular-route",["/*.js"]);
regVendorGlob("angular-sanitize",["/*.js"]);
regVendorGlob("animate.css",["/*.css"]);
regVendorGlob("bootstrap",["/+(dist)/**/*"]);
regVendorGlob("es5-shim",["/*.js"]);
regVendorGlob("font-awesome",["/+(css|fonts)/**/*"]);
regVendorGlob("jquery",["/+(dist)/**/*"]);
regVendorGlob("json3",["/+(lib)/*.js"]);
regVendorGlob("normalize.css",["/*.css"]);


//清洗vendor
var globFolders = {};
var regGlobFolders = function(folder,globs){
	if(typeof globs == "string"){
		globs = [globs];
	}
	globs.forEach(function(glob){
		if(!globFolders[glob]){
			globFolders[glob] = [];
		}
		globFolders[glob].push(folder);
	});
}
var packages = require('../../package.json'),
	depends = packages.dependencies ? (Object.keys(packages.dependencies)) : [];
var globs;
	depends.forEach(function(vendor){
		globs = vendorGlobs[vendor] || ["/+(dist)/**/*","/*.{js,css}"];
		regGlobFolders(vendor , globs);
	});

module.exports = {
	getSrc : function(root){
		var res = [] ,
			globs = Object.keys(globFolders);
		//这种做法存在NODE文件缓存 但这里可以用

		globs.forEach(function(glob){
			res.push(root + '/+('+globFolders[glob].join("|")+')'+glob);
		});
		return res;
	}
}