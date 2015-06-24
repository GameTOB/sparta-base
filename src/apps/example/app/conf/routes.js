'use strict';

angular.module('app')

.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider
        .when('/', {
            redirectTo: '/master/dashboard'
        })
        //.simpleWhen('/readme');
        //.otherwise('/readme');
    }
])