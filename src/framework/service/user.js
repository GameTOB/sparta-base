'use strict';

angular.module('framework')

.factory('User', function($q, Api, ApiErrno, APPCONF, $route, $timeout, $location, Debug) {

    //apiKey保证不会重名即可
    var userApi = Api("userApiCreateByManZhouyao", {
        url: APPCONF.PUBLIC_API_URL
    });

    var userError = null;
    userApi.bindError(function(error) {
        var deferred = $q.defer();

        if (userError == null) {
            userError = $timeout(function() {
                if (error.errno == ApiErrno.UNLOGIN) {
                    if ($location.path() != "/user/login") {
                        $location.url("/user/login");
                    }
                } else if (error.errno == ApiErrno.AUTHREQUIRED || error.errno == ApiErrno.FORBIDDEN) {
                    if ($location.path() != "/user/forbidden") {
                        $location.url("/user/forbidden");
                    }
                } else {
                    Debug.error("获取用户信息接口出错", error);
                }
                userError = null;
            });
        }

        //除了已在 /user/login 或 /user/forbidden 
        //其他一律不向上传递即到此为止，因上面的异步跳转会执行
        //
        if ($location.path() == "/user/login" || $location.path() == "/user/forbidden") {
            deferred.resolve(error);
        } else {
            //
            deferred.reject();
        }

        return deferred.promise;
    });

    var domain = document.domain,
        isCorp = document.domain.substr(-1 * ("corp.qihoo.net").length) == "corp.qihoo.net",
        isQuc = document.domain.substr(-1 * ("360.cn").length) == "360.cn";

    if (window.QHPass && angular.isFunction(QHPass.init)) {
        var _opts = {
            src: 'pcw_wan',
            headSize: '48_48',
            ignoreCookie: true,
            domainList: ['360.cn'],
            signIn: {
                types: ['quick', 'normal']
            },
            signUp: {
                types: ['username', 'email']
            },
            proxy: location.protocol + "//" + location.host + location.pathname + "psp_jump.html"
        };
        QHPass.init(_opts);
    }

    var User = {
        login: function() {
            if (isCorp) {
                $location.search('sid', null);
                location.replace("https://login.ops.qihoo.net:4430/sec/login?ref=" + encodeURIComponent(location.href));
                return;
            }else if (isQuc && window.QHPass) {
                window.QHPass && QHPass.signIn(function() {
                    location.reload();
                });
            }else {
                Debug.error('Please use 360.cn or copr.qihoo.net , or you could forget QUC JS-SDK');
            }
        },
        get: function() {
            var deferred = $q.defer();
            var params = {
                appkey: APPCONF.NAME
            };
            if (isCorp && $route.current && $route.current.params.sid) {
                params.sid = $route.current.params.sid;
            }
            userApi.get("user/get", params).then(function(data) {
                deferred.resolve(data);
            }, function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        logout: function() {
            var deferred = $q.defer();
            if (isCorp) {
                userApi.get("user/logout").then(function(data) {
                    deferred.resolve(data);
                }, function(error) {
                    deferred.reject(error);
                })
            }
            if (isQuc) {
                window.QHPass && QHPass.signOut(function() {
                    deferred.resolve();
                })
            }
            return deferred.promise;
        }

    };
    return User;
});