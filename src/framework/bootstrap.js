'use strict';

angular.module('framework', [
    'ng',
    'ngAnimate',
    'ngSanitize',
    'ngRoute',
    'ngMessages',
    'ui.bootstrap'
])

//http://stackoverflow.com/questions/16674279/how-to-nest-ng-view-inside-ng-include/20305370
//https://github.com/angular/angular.js/issues/1213
.run(['$route', angular.noop])

//初始化全局appApi
.run(function(APPCONF, APPENV, $q, $http, Api, ApiErrno, User, $location, $timeout) {

    var appApi = Api(APPCONF.APPKEY, {
        url: APPCONF.APP_API_URL
    });

    appApi.bindSetup(User.get);

    appApi.bindError(function(error) {
        var deferred = $q.defer();
        //api处理后必有 error.errno
        //deferred.reslove 则抛出给应用层处理
        //deferred.reject  则吃掉此错误 不抛给应用层
        if (error.errtype == "http") {
            //console.log("HTTP错误", error.errno, error.errmsg);
            deferred.resolve(error);
        } else {
            switch (error.errno) {
                case ApiErrno.DEVERROR:
                    error.errmsg = "[DevError!]"+error.errmsg;
                    deferred.resolve(error);
                    break;
                case ApiErrno.UNLOGIN:
                    $location.url("/user/login");
                    deferred.reject(error);
                    break;
                case ApiErrno.AUTHREQUIRED:
                    $location.url("/user/authrequired");
                    deferred.reject(error);
                    break;
                case ApiErrno.FORBIDDEN: 
                default:
                    deferred.resolve(error);
                    break;
            }
        }
        return deferred.promise;
    });
});