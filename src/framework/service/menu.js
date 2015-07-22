'use strict';

angular.module('framework')

.factory('Menu', function (Api, APPCONF, User, $q) {
	
	var MenuSvc = {},
		cache = null,
		menuApi  = Api("menuApiCreateByManZhouyao", {
		    url: APPCONF.PUBLIC_API_URL
		});

    menuApi.bindSetup(User.get);

	MenuSvc.getAll = function(force) {
		var deferred = $q.defer();

		if(cache && cache.length>0 && !force){
			deferred.resolve(cache);
		}else{
			menuApi.get("menu/get_tree", {appkey: APPCONF.APPKEY}).then(function(data){
				cache = data;
				deferred.resolve(cache);
			});
		}
		return deferred.promise;
    };

    return MenuSvc;
});