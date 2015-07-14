'use strict';

angular.module('framework')

.controller('framework.user.loginCtrl', 
	function ($scope , $location , $timeout , User , ApiErrno , Debug) {
	//由于可能误进此场景，所以先进行判定
	$scope.isUnlogin = false;

	//此场景再次判定，不以内存记录为依据
	User.get().then(function(data){
		$timeout(function(){
			$location.url("/");
		});
	},function(error){
		if(error.errno == ApiErrno.UNLOGIN){
			$scope.isUnlogin = true;
			//User.login是否需要封入?可商议
			User.login();
		}else if(error.errno == ApiErrno.AUTHREQUIRED){
			$location.url("/user/authrequired");
		}else{
			Debug.error("获取用户信息接口出错",error);
		}
	});

})

.controller('framework.user.authrequiredCtrl', 
	function ($scope , $location , $timeout , User , ApiErrno , Debug) {
	//由于可能误进此场景，所以先进行判定
	$scope.isAuthrequired = false;

	//此场景再次判定，不以内存记录为依据
	User.get().then(function(data){
		$timeout(function(){
			$location.url("/");
		});
	},function(error){
		if(error.errno == ApiErrno.UNLOGIN){
			$location.url("/user/login");
		}else if(error.errno == ApiErrno.AUTHREQUIRED){
			$scope.isAuthrequired = true; 
		}else{
			Debug.error("获取用户信息接口出错",error);
		}
	});
	
})

.controller('framework.user.logoutCtrl', function ($location , User ) {
	User.logout().finally(function(){
		$location.url("/");
	});
});