'use strict';

angular.module('app')

.service('AppMenu', function(Api , APPCONF , $q) {
	
	var appApi = Api(APPCONF.APPKEY);
	var menuData = [];

	this.getData = function(){
		var deferred = $q.defer();

		if(menuData.length>0){
			deferred.resolve(menuData);
		}else{
			appApi.get("/menu/get").then(function(data){
				menuData = data;
				deferred.resolve(menuData);
			});
		}

		return deferred.promise;
	}

});