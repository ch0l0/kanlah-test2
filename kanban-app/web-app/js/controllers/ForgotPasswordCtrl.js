app.controller('ForgotPasswordCtrl', ['$scope', '$modalInstance', 'data', '$dialogs', 'CONFIG', 'UserService', function($scope, $modalInstance, data, $dialogs, CONFIG, UserService) {

	$scope.user = {
		email: ""
	};

	$scope.save = function onSave() {
		UserService
			.passwordReset($scope.user)
			.then(function onResponse(resp) {
				if(resp.success){
					dialog = $dialogs.notify(CONFIG.APP_NAME, resp.message);
				}
				else {
					dialog = $dialogs.error(CONFIG.APP_NAME, resp.message);
				}
				$modalInstance.dismiss('canceled');
			});
	}

	$scope.cancel = function onCancel(){
		$modalInstance.dismiss('canceled');
	};

}]);