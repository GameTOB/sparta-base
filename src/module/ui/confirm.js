'use strict';

angular.module('module')

.controller('module.ui.confirmCtrl', function ($scope , $modalInstance , data) {
	$scope.data = data;

	$scope.ok = function () {
	    $modalInstance.close();
	};

	$scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	};
})

.factory('UIConfirm', function($rootScope, $q, $location, $sce, $modal, $modalStack, $document) {

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

    var Confirm = function(data) {
        var resultReferred = $q.defer();
        data = wrapData(data);
        var modalInstance = $modal.open({
        	windowClass : "ui-confirm-modal",
            templateUrl: "module/ui/template/confirm.tpl",
            controller: 'module.ui.confirmCtrl',
            backdrop: 'static', //用户需要主动确定或取消
            keyboard: true, //支持键盘Esc退出
            size: 'sm',
            resolve: {
                data: function() {
                    return {
                        stateClass: data.state || Confirm.STATE.INFO,
                        message: data.message || "",
                        resolveText: data.resolveText || "确定",
                        rejectText: data.rejectText || "取消"
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

    Confirm.STATE = {
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
            if (modalStack && isExistModal(modalStack.key)) {
                evt.preventDefault();
                $rootScope.$apply(function() {
                    modalStack.key.close();
                });
            }
        }
    });

    Object.keys(Confirm.STATE).forEach(function(state) {
        state = state.toLowerCase();
        Confirm[state] = function(message) {
            return Confirm({
                state: state,
                message: message
            });
        };
    });
    return Confirm;
});

/**
 * Usage : 
 * 
 * Function >
 * UIConfirm({state: UIConfirm.STATE.SUCCESS , message : "xxxx" , resolveText : "确定" , rejectText : "取消"});
 * UIConfirm.success("xxxx");
 * UIConfirm.info("xxx");
 * UIConfirm.error("xxx");
 * UIConfirm.warning("xxx");
 * UIConfirm.danger("xxx");
 *
 * Constant >
 * UIConfirm.STATE["SUCCESS","ERROR","WARNING","INFO","ERROR"]
 * 
 */