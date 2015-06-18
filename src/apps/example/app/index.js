'use strict';

angular.module('app', [
    'framework',
    'module'
])

//APP统一的错误处理切面
.run(function(APPCONF, $q, Api, Debug , $rootScope) {

    var appApi = Api(APPCONF.APPKEY);

    appApi.bindError(function(error) {
        var deferred = $q.defer();
        if (error.errtype == "http") {
            Debug.error("HTTP错误", error.errno, error.errmsg);
        } else {
            Debug.warn("APP:" + APPCONF.APPKEY, "有一个业务错误可能需要处理", error);
        }
        deferred.resolve(error);
        return deferred.promise;
    }); 

})


.controller('app.indexCtrl', function($scope, Menu) {
  
    $scope.menu = [];

    Menu.getTreeData().then(function(data){
        $scope.menu.data = data;
        return Menu.getNodeSvc();
    }).then(function(svc){
        $scope.menu.nodeSvc = svc;
        //console.log($scope.menu);
    });

});
