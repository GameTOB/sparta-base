'use strict';

angular.module("framework")

.config(function($routeProvider, APPCONF) {
    var SPECIAL_CHARS_REGEXP = /([\:\-\_\/]+(.))/g;

    function dashCase(name) {
        return name.
        replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
            return offset ? "-" + letter : letter;
        });
    }

    function camelCase(name) {
        return name.
        replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
            return offset ? letter.toUpperCase() : letter;
        });
    }

    /**
     * [simpleWhen]
     * @param  {[String]} path /xxx/:yyy/zzz => ["xxx","zzz"]
     * @param  {[Object]} opts
     * @return $routeProvider
     */
    $routeProvider.simpleWhen = function(path, opts) {
        if (path) {
            opts = opts || {};

            if (opts.redirectTo) {
                $routeProvider.when(path, opts);
            } else {
                var routeKey = path && path[0] == "/" ? path.substr(1) : path;
                var groupKey = "";
                if (routeKey.indexOf("/") > 0) {
                    var routeKeyArr = routeKey.split("/");
                    var newRouteKeyArr = [];
                    angular.forEach(routeKeyArr, function(val, index) {
                        if (val[0] != ":") {
                            newRouteKeyArr.push(val);
                        }
                    });
                    if (newRouteKeyArr.length > 1) {
                        groupKey = newRouteKeyArr.shift();
                    }
                    routeKey = newRouteKeyArr.join("/");
                }
                //console.log(groupKey,routeKeyArr);
                var mixOpts = {
                    templateUrl: APPCONF.TPLROOT + '/' + (groupKey ? dashCase(groupKey) + '/' : '') + dashCase(routeKey) + '.tpl',
                    controller: 'app.'+ (groupKey ? camelCase(groupKey) + '.' : '') + camelCase(routeKey) + 'Ctrl'
                };
                angular.extend(mixOpts, opts);
                $routeProvider.when(path, mixOpts);
            }

        }
        return $routeProvider;
    };
});