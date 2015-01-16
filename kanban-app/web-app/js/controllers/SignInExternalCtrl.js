
app.controller('SignInExternalCtrl', ['$scope', '$rootScope', '$location', '$dialogs', 'CONFIG', 'AuthenticationService', 'SessionStorageService', 'LocalStorageService', 'SystemParamsService', '$timeout', 'MESSAGES', 'scopeInfo',
	function($scope, $rootScope, $location, $dialogs, CONFIG, AuthenticationService, SessionStorageService, LocalStorageService, SystemParamsService, $timeout, MESSAGES, scopeInfo, $route) {
		$scope.errorMessage = "";
		$scope.sessionId = scopeInfo;

		//console.log("$scope.sessionId", scopeInfo);
		//console.log($scope.sessionId, $route);

		if($scope.sessionId!=""){
			AuthenticationService
				.signin({sessionId: $scope.sessionId, autoLogin: true})
				.then(function(resp){
					if(resp.success){
						signInSuccess(resp);
					}else
						LocalStorageService.clearLoginSession();
				});
		}

		function signInSuccess(resp){

			SessionStorageService.setUserInfo(resp.data);
			SessionStorageService.setReferrer({ref:'external'});

			SystemParamsService
				.all()
				.then(function onGetAllParams(params) {
					SessionStorageService.setSystemParams(params.data);
					CONFIG.refreshSystemParams();

					if($scope.autoLogin) {
						LocalStorageService.setLoginSession({id: resp.data.sessionId});
					}
					window.location.replace('#/dashboard');
					$rootScope.$broadcast("userInfo:updated", resp.data);
				});
		}
	}]);