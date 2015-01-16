app.controller('ResendEmailCtrl', ['$scope', '$modalInstance', 'data', '$dialogs', 'CONFIG', 'UserService', function($scope, $modalInstance, data, $dialogs, CONFIG, UserService) {

	$scope.user = {
		email: data.email
	};

	$scope.resend = function onResendConfirmation() {
		UserService
			.resendEmail($scope.user)
			.then(function onResponse(resp) {
				if(resp.success){
					dialog = $dialogs.notify(CONFIG.APP_NAME, "Resend email successful.");
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