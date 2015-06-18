'use strict';

angular.module("framework")

.service('ApiMock', function($httpBackend){

	var whitelist = [];
	var wrapData = function(data) {
        return {
            errno: 0,
            errmsg: '',
            data: data
        }
    };

	this.reg = function(restr,data){
		if(restr[0]!="/"){
			restr = "\\/"+restr;
		}
		if(angular.isUndefined(data.errno)){
			data = wrapData(data);
		}
		whitelist.push([restr , data]);
	};

	this.start = function(){

		var re;
		whitelist.forEach(function(item){
			re = new RegExp(item[0]+"\\?"); 
			$httpBackend.whenJSONP(re).respond(item[1]);
		});
		var restr= whitelist.join('|');
		re = new RegExp(restr);
		$httpBackend.whenJSONP(function(url){
			return !re.test(url);
		}).passThrough();
		$httpBackend.whenGET(function(url){
			return !re.test(url);
		}).passThrough();
		$httpBackend.whenPOST(function(url){
			return !re.test(url);
		}).passThrough();

		$httpBackend.whenPUT().passThrough();
		$httpBackend.whenDELETE().passThrough();
		$httpBackend.whenHEAD().passThrough();
		$httpBackend.whenPATCH().passThrough();
	};
});