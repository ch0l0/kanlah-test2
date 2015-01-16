app.controller('AddMemberCtrl', ['$scope', '$dialogs', '$timeout', 'CONFIG', 'MemberService', 'CompanyService', 'growl', function($scope, $dialogs, $timeout, CONFIG, MemberService, CompanyService, growl) {
	var TPL_INVITE_MEMBER = '/partials/dashboard/invite-member.html';

	$scope.addMember = function onAddMember() {
		MemberService
			.create($.extend($scope.member, {accountId: $scope.project.accountId}))
			.then(function onCreate(resp) {
				// Everything is smooth, new user
				if(resp.success){
					growl.addSuccessMessage(resp.message);
					$scope.reset();
					$scope.appendAddedMember(resp);

					$("#newMember form").parsley().reset();
					$("#newMember form :input:not(:button)").val("")

				}
				// User is an existing member, show the invite form
				else if(parseInt(resp.code) === 1102) {	
					confirmDialog = $dialogs
						.confirm('Please Confirm', resp.message)
						.result.then(function(btn){
							var credentials = {
								accountId: $scope.project.accountId,
								email: $scope.member.email
							};						
							$scope.InviteMember(credentials);
							//$scope.inviteExisting();
							$scope.reset();
							//$scope.member.existingEmail = $scope.member.email;
						});
				}
				else {
					//$scope.errorMessage = resp.message;
					growl.addErrorMessage(resp.message);
				}
			});
	};

	$timeout(function(){
		$scope.member = {
			confirmEmail: "",
			email: "",
			password: ""
		}
	}, 800);
}]);