'use strict';

angular.module('framework')

.factory('Api', function($http, $q, ApiErrno) {

    function isPromiseLike(obj) {
        return obj && angular.isFunction(obj.then);
    };

    function errorResult(type, error) {
        //TODO: BaseLog
        error = error || {};
        return {
            errtype: type || "app",
            errno: error.errno || "Nonexistent errno",
            errmsg: error.errmsg || "Nonexistent errmsg"
        }
    }

    function getSeriesPromise(funcs, outRes) {
        var outDeferred = $q.defer();

        if (funcs.length == 0) {
            outDeferred.resolve(outRes);
        } else {
            var getIteratorPromise = function(index, inData) {
                var inDeferred = $q.defer();

                if (!funcs[index]) {
                    inDeferred.resolve(inData);
                } else {
                    var resPromise = funcs[index].call(null, inData);
                    if (!isPromiseLike(resPromise)) {
                        resPromise = $q.when(null);
                    }
                    resPromise.then(function(inRes) {
                        getIteratorPromise(+index + 1, inRes).then(function(data) {
                            inDeferred.resolve(data);
                        }, function(error) {
                            inDeferred.reject(error);
                        });
                    }, function(inError) {
                        inDeferred.reject(inError);
                    });
                }
                return inDeferred.promise;
            };

            getIteratorPromise(0, outRes).then(function(data) {
                outDeferred.resolve(data);
            }, function(error) {
                outDeferred.reject(error);
            })
        }

        return outDeferred.promise;
    }

    var _instances = {};
    var _runnings = {};

    var Api = function(option) {
        this.url = option.url || "/";
        this.setups = [];
        this.successes = [];
        this.errors = [];
    }

    var createIns = function(name, option) {
        var ins = null;
        if (angular.isUndefined(option)) {
            if (_instances[name]) {
                ins = _instances[name];
            }
        } else {
            ins = new Api(option);
            _instances[name] = ins;
        }
        return ins;
    }

    Api.prototype.reset = function() {
        this.setups = [];
        this.successes = [];
        this.errors = [];
    }

    Api.prototype.bindSetup = function(callback) {
        if (!callback || !angular.isFunction(callback)) {
            return;
        }
        this.setups.push(callback);
    };
    Api.prototype.bindSuccess = function(callback) {
        if (!callback || !angular.isFunction(callback)) {
            return;
        }
        this.successes.push(callback);
    };
    Api.prototype.bindError = function(callback) {
        if (!callback || !angular.isFunction(callback)) {
            return;
        }
        this.errors.push(callback);
    };

    var realGet = function(ins, behavior, params , options) {
        var deferred = $q.defer();
        var url = ins.url;
        var _self = ins;

        var runningCallback = function(httpKey, callback) {
            if (angular.isDefined(_runnings[httpKey]) && angular.isFunction(callback)) {
                angular.forEach(_runnings[httpKey].deferred, function(deferred) {
                    callback(deferred);
                })
                delete _runnings[httpKey];
            }
        };

        getSeriesPromise(_self.setups).then(function(data) {
            params = params || {};
            params.callback = "JSON_CALLBACK";
            if (url[url.length - 1] != "/") {
                url += "/";
            }
            if(behavior.charAt(0)=="/"){
                behavior = behavior.substr(1);
            }
            var httpOptions = {
                url: url + behavior,
                method: "jsonp",
                params: params || {},
                paramSerializer : '$httpParamSerializerJQLike'
            };
            angular.extend(httpOptions, options);
            //如果method被更改 须修正
            if(httpOptions.method=="post"){
                delete httpOptions['params'];
                httpOptions['data'] = $.param(params);
                httpOptions['headers'] = {"Content-Type": "application/x-www-form-urlencoded"};
            }
            var httpKey = JSON.stringify(httpOptions);
            if (angular.isUndefined(_runnings[httpKey])) {
                _runnings[httpKey] = {
                    deferred: []
                };
                _runnings[httpKey].deferred.push(deferred);
                $http(httpOptions).then(function(result) {

                    var appRes = result.data;

                    if (appRes && appRes.errno === 0) {
                        runningCallback(httpKey, function(deferred) {
                            deferred.resolve(appRes.data);
                        });
                    } else {
                        runningCallback(httpKey, function(deferred) {
                            deferred.reject(errorResult("app", appRes));
                        });
                    }
                }, function(result) {
                    //http错误
                    var error = {
                        errno: result.status,
                        errmsg: result.statusText
                    };
                    runningCallback(httpKey, function(deferred) {
                        deferred.reject(errorResult("http", error));;
                    });
                });
            } else {
                //重复正在运行中的请求时 则将deferred存储用于结果
                _runnings[httpKey].deferred.push(deferred);
            }

        }, function(error) {
            deferred.reject(errorResult("app", error));
        });

        return deferred.promise;
    };

    Api.prototype.get = function(behavior, params , options) {
        var _self = this;
        options = options || {};
        if (_self.successes.length == 0 && _self.errors.length == 0) {
            return realGet(this, behavior, params , options);
        }

        var deferred = $q.defer();
        realGet(this, behavior, params , options).then(function(data) {

            getSeriesPromise(_self.successes, data).then(function(data) {
                deferred.resolve(data);
            }, function(error) {
                deferred.reject(error);
            });

            // var successRes = _self.success.call(_self,data);
            // if (!isPromiseLike(successRes)) {
            //              successRes = $q.when(data);
            //          }
            //          successRes.then(function(data){
            //              deferred.resolve(data);
            //          },function(){
            //              //Do nothing 
            //          })

        }, function(error) {
            getSeriesPromise(_self.errors, error).then(function(errData) {
                deferred.reject(errData);
            }, function() {
                //Do nothing 
            });

            // var errorRes = _self.error.call(_self,error);
            // if (!isPromiseLike(errorRes)) {
            //              errorRes = $q.when(error);
            //          }
            //          errorRes.then(function(error){
            //              deferred.reject(error);
            //          },function(){
            //              //Do nothing 
            //          });

        });

        return deferred.promise;
    };

    return createIns;
});