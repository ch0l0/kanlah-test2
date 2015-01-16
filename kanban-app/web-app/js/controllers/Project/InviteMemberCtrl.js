app.controller('InviteMemberCtrl', ['$scope', '$dialogs', 'CONFIG', 'MemberService', 'growl', function($scope, $dialogs, CONFIG, MemberService, growl ) {
	//$scope.member = data.member;
	//$scope.account = data.account;

	$scope.credentials = {
		accountId: $scope.project.accountId,
		email: $scope.member.existingEmail
	};

	$scope.inviteMember = function onInviteMember() {
		$scope.credentials.email = $scope.member.existingEmail;

		$scope.InviteMember($scope.credentials);
		
	}

	/*$scope.cancel = function onCancel(){
		//$modalInstance.dismiss('canceled');
	};*/

}]);