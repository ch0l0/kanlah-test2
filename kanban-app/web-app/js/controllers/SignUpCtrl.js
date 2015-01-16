app.controller('SignUpCtrl', ['$scope', '$location', 'AccountService', function($scope, $location, AccountService) {

	$scope.account = {
		// companyName: "",
		// companyDescription: "-",
		displayName: "",
		email: "",
		password: ""
	};

	$scope.errorMessage = "";

	$scope.signup = function onSignUp() {
		//Workaround for auto-complete selected values
		$scope.account.password = $("#password").val();

		AccountService
			.create($scope.account)
			.then(function onCreateSuccess(resp) {
				
				if(!resp.success) {
					$scope.errorMessage = resp.message;
					return;
				}

				// Acount has been created, redirect to a confirmation page
				var account = resp.data;

				$location.path("signupSucces");

			});

	}

}]);