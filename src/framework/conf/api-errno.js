'use strict';

angular.module('framework')

.constant('ApiErrno', {
    DEV_ERROR: 1100,
    UNLOGIN: 50401,
    FORBIDDEN: 50403,           //用户不具备某功能的权限
    NOT_FOUND: 50404,           
    AUTHREQUIRED: 50407,        //用户不被授予访问该应用
    PRECONDITION_FAILED: 50412,
    INPUT_EXT: 50413,
    INTERNAL_SERVER_ERROR: 50500,
    BAD_GATEWAY: 50502,
    GATEWAY_TIMEOUT: 50504
});