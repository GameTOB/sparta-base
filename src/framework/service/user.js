'use strict';

angular.module('framework')

.factory('User', function($q, Api, ApiErrno, APPCONF, APPENV , $route, $timeout, $location, Debug) {

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
                } else if (error.errno == ApiErrno.AUTHREQUIRED) {
                    if ($location.path() != "/user/authrequired") {
                        $location.url("/user/authrequired");
                    }
                } else {
                    Debug.error("获取用户信息接口出错", error);
                }
                userError = null;
            });
        }

        //除了已在 /user/login 或 /user/authrequired 
        //其他一律不向上传递即到此为止，因上面的异步跳转会执行
        //
        if ($location.path() == "/user/login" || $location.path() == "/user/authrequired") {
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
                $timeout(function() {
                    location.replace("https://login.ops.qihoo.net:4430/sec/login?ref=" + encodeURIComponent(location.href));
                });
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
                appkey: APPCONF.APPKEY
            };
            if (isCorp && $route.current && $route.current.params.sid) {
                params.sid = $route.current.params.sid;
            }
            if (!APPENV.USER) {
                userApi.get("user/get", params).then(function(data) {
                    APPENV.USER = data;
                    deferred.resolve(data);
                }, function(error) {
                    deferred.reject(error);
                });
            } else {
                deferred.resolve(APPENV.USER);
            }

            return deferred.promise;
        },
        logout: function() {
            var deferred = $q.defer();
            if (isCorp) {
                userApi.get("user/logout").then(function(data) {
                    APPENV.USER = null;
                    deferred.resolve(data);
                }, function(error) {
                    APPENV.USER = null;
                    deferred.reject(error);
                });
            }
            if (isQuc) {
                window.QHPass && QHPass.signOut(function() {
                    APPENV.USER = null;
                    deferred.resolve();
                });
            }
            return deferred.promise;
        }
    };
    return User;
});