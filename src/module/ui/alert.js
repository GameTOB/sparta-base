'use strict';

angular.module('module')

.controller('module.ui.alertCtrl', function ($scope , $modalInstance , data) {
	$scope.data = data;

	$scope.ok = function () {
	    $modalInstance.close();
	};

})

.factory('UIAlert', function($rootScope, $q, $location, $sce, $modal, $modalStack, $document) {

    var modals = [];
    var wrapData = function(data) {
        if (!angular.isObject(data)) {
            return {
                message: data
            }
        }
        return data;
    }
    var deleteModal = function(modalInstance) {
        var newModals = modals.filter(function(ins) {
            return modalInstance !== ins;
        });
        modals = newModals;
    };
    var isExistModal = function(modalInstance) {
        return modals.some(function(ins) {
            return modalInstance === ins;
        });
    };

    var Alert = function(data) {
        var resultReferred = $q.defer();
        data = wrapData(data);
        var modalInstance = $modal.open({
			windowClass : "ui-alert-modal",
            templateUrl: "module/ui/template/alert.tpl",
            controller: 'module.ui.alertCtrl',
            backdrop: 'static', //用户需要主动确定
            keyboard: false, //不支持Esc退出
            size: 'sm',
            resolve: {
                data: function() {
                    return {
                        stateClass: data.state || Alert.STATE.INFO,
                        message: data.message || "",
                        resolveText: data.resolveText || "确定"
                    };
                }
            }
        });
        modals.push(modalInstance);
        modalInstance.result.then(function(result) {
            deleteModal(modalInstance);
            resultReferred.resolve(result);
            if (data.direct) {
                $location.url(data.direct);
            }
        }, function(reason) {
            deleteModal(modalInstance);
            resultReferred.reject(reason);
        });

        return resultReferred.promise;
    };

    Alert.STATE = {
        "SUCCESS": "success",
        "ERROR": "danger",
        "INFO": "info",
        "WARNING": "warning",
        "DANGER": "danger"
    };

    //始终保持回车键的监听
    $document.on('keydown', function(evt) {
        var modalStack;
        if (evt.which === 13) {
            modalStack = $modalStack.getTop();
            //最上层一定要为modal实例才可以
            if (modalStack && isExistModal(modalStack.key)) {
                evt.preventDefault();
                $rootScope.$apply(function() {
                    modalStack.key.close();
                });
            }
        }
    });


    Object.keys(Alert.STATE).forEach(function(state) {
        state = state.toLowerCase();
        Alert[state] = function(message) {
            return Alert({
                state: state,
                message: message
            });
        };
    });

    return Alert;
});

/**
 * Usage : 
 * 
 * Function >
 * UIAlert({state: UIAlert.STATE.SUCCESS , message : "xxxx" , resolveText : "确定"});
 * UIAlert.success("xxxx");
 * UIAlert.info("xxx");
 * UIAlert.error("xxx");
 * UIAlert.warning("xxx");
 * UIAlert.danger("xxx");
 *
 * Constant >
 * UIAlert.STATE["SUCCESS","ERROR","WARNING","INFO","ERROR"]
 * 
 */