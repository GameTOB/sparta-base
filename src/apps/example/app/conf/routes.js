'use strict';

angular.module('app')

.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider
        .when('/', {
            redirectTo: '/readme'
        })
        .simpleWhen('/readme')
        .otherwise('/readme');
    }
])