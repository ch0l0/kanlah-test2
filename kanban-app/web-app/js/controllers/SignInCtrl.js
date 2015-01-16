app.controller('SignInCtrl', ['$scope', '$rootScope', '$location', '$dialogs', 'CONFIG', 'AuthenticationService', 'SessionStorageService', 'LocalStorageService', 'SystemParamsService', '$timeout', 'MESSAGES', 
	function($scope, $rootScope, $location, $dialogs, CONFIG, AuthenticationService, SessionStorageService, LocalStorageService, SystemParamsService, $timeout, MESSAGES) {

	var INVALID_ACCOUNT_CODE = "0102";

	$scope.account = { email: "", password:"" };
	$scope.errorMessage = "";

	var TPL_FORGOT_PASSWORD = '/partials/signin/forgot-password.html';
	var TPL_RESEND_EMAIL = '/partials/signin/resend-email.html';

	//Check for auto-login
	var autoLogin = LocalStorageService.getLoginSession();
	if(autoLogin){
		AuthenticationService
		.signin({sessionId: autoLogin.id, autoLogin: true})
		.then(function(resp){
			if(resp.success){
				signinSuccess(resp);
			}else
				LocalStorageService.clearLoginSession();
		});
	}

	$scope.signin = function onSignIn() {
		//Workaround for auto-complete selected values
		$scope.account = {
			email: $("#email").val(),
			password: $("#password").val()
		};

		AuthenticationService
			.signin($scope.account)
			.then(function onSuccess(resp) {
				if(resp.success) {
					signinSuccess(resp);
				} else {
					if(INVALID_ACCOUNT_CODE === resp.code) {
						$scope.showResendEmailForm();
						return;
					}
					$scope.errorMessage = resp.message;
				}
			},
			function onError(res) {
				$scope.errorMessage = MESSAGES.SYSERROR;
				//console.log("Error Status:" + res.status);
			});
	}

	$scope.showResendEmailForm = function onShowResendEmailForm() {
		resetForm();
		dialog = $dialogs
			.create(TPL_RESEND_EMAIL,'ResendEmailCtrl', {email: $scope.account.email});
	}

	$scope.forgotPassword = function onForgotPassword() {
		dialog = $dialogs
			.create(TPL_FORGOT_PASSWORD,'ForgotPasswordCtrl', {});
	}

	$scope.signup = function onSignUp() {
		$location.path('signup');
	}

	function resetForm() {
		$("form:first").parsley().reset();
	}

	function signinSuccess(resp){
		SessionStorageService.setUserInfo(resp.data);
		SystemParamsService
			.all()
			.then(function onGetAllParams(params) {
				SessionStorageService.setSystemParams(params.data);
				CONFIG.refreshSystemParams();

				if($scope.autoLogin) {
					LocalStorageService.setLoginSession({id: resp.data.sessionId});
				}
				$location.path('dashboard');
				$rootScope.$broadcast("userInfo:updated", resp.data);
			});
	}
}]);