app.controller('AccountInfoCtrl', ['$scope', '$timeout', '$dialogs', 'AccountService', 'MemberService', 'BoardService', 'CompanyService', 'CONFIG', 'growl', function($scope, $timeout, $dialogs, AccountService, MemberService, BoardService, CompanyService, CONFIG, growl) {

	//$scope.members = members.data || [];
	//$scope.boards = boards.data || [];
	//$scope.account = account.data;

	var TPL_ADD_MEMBER = '/partials/dashboard/add-member.html';

	$scope.addMember = function onAddMember() {

		dialog = $dialogs
			.create(TPL_ADD_MEMBER,'AddMemberCtrl', account.data, {});
	}

	$scope.deleteMember = function onDeleteMember(userId) {
		function remove() {
			MemberService
				.delete({
					accountId: $scope.project.accountId, 
					userId: userId
				})
				.then(function onSuccess(resp) {
					// Everything is smooth, delete/decline of invitation successful
					if(resp.success){
						//$dialogs.notify(CONFIG.APP_NAME, resp.message);
						$("#member-"+userId).fadeOut();
						growl.addSuccessMessage(resp.message);
						$timeout(function(){
							$scope.members.findAndRemove("userId", userId);
						}, 500);
					}
					else {
						dialog = $dialogs.error(CONFIG.APP_NAME, resp.message);
					}
				});
		}

		confirmDialog = $dialogs
			.confirm(CONFIG.APP_NAME,'Removing this member will also removed him/her from the assigned boards and cards. Would you like to continue?')
			.result.then(function(btn){
				if(btn === "yes") {
					remove()
				}
			});
	}


	$scope.setMemberRole = function onSetMemberRole(member) {
		var newRole = $scope.toggleRole(member.role);
		confirmDialog = $dialogs
			.confirm(CONFIG.APP_NAME,'Are you sure you want to set {0} as {1}?'.format(member.fullname, newRole))
			.result.then(function(btn){
				if(btn === "yes") {
					MemberService
					.setRole({
						accountId: $scope.project.accountId, 
						memberId: member.userId,
						memberRole: newRole.toUpperCase()
					})
					.then(function onSuccess(resp) {
						if(resp.success){
							//Refresh Member list
							CompanyService.members($scope.project.accountId)
							.then(function(response){
								$scope.members = response.data || [];
							})
							dialog = $dialogs.notify(CONFIG.APP_NAME, resp.message);
						}
						else {
							dialog = $dialogs.error(CONFIG.APP_NAME, resp.message);
						}
					});
				}
			});
	}

	$scope.resendInvite = function onResendInvite(member) {
		function resendInvitation() {
			MemberService
				.reInvite({
					accountId: $scope.project.accountId, 
					userId: member.userId,
					email: member.email
				})
				.then(function onSuccess(resp) {
					// Everything is smooth, delete/decline of invitation successful
					if(resp.success){
						//$dialogs.notify(CONFIG.APP_NAME, resp.message);
						//$("#member-"+userId).fadeOut();
						growl.addSuccessMessage(resp.message);
					}
					else {
						dialog = $dialogs.error(CONFIG.APP_NAME, resp.message);
					}
				});
		}

		confirmDialog = $dialogs
			.confirm(CONFIG.APP_NAME,'Are you sure you want to re-send invite to ' + member.fullname + ' ?' )
			.result.then(function(btn){
				if(btn === "yes") {
					resendInvitation()
				}
			});
	};


	$scope.deleteBoard = function onDeleteBoard(boardId) {
		function remove() {
			BoardService
				.delete(boardId)
				.then(function onSuccess(resp) {
					if(resp.success){
						dialog = $dialogs.notify(CONFIG.APP_NAME, resp.message);
					}
					else {
						dialog = $dialogs.error(CONFIG.APP_NAME, resp.message);
					}
				});
		}

		confirmDialog = $dialogs
			.confirm(CONFIG.APP_NAME,'Deleting this board could affect the Project, Are you sure you want to delete this board?')
			.result.then(function(btn){
				if(btn === "yes") {
					remove()
				}
			});
	}

	$scope.isAccountOwner = function onIsAdmin() {
		return userInfo.id === account.data.ownerId;
	}

	$scope.isOwnerRow = function onIsOwnerRow(memberId) {
		return account.data.ownerId === memberId;
	}

	$scope.toggleRole = function onToggleRole(role){
		var result, USERROLE = {
			ADMIN: "ADMIN",
			MEMBER: "MEMBER"
		}
		switch(role.toUpperCase()){
			case USERROLE.ADMIN:
				result = USERROLE.MEMBER;
				break;
			case USERROLE.MEMBER:
				result = USERROLE.ADMIN;
				break;
			default:
				result = role;
				break;
		}
		return result.toPascalCase();
	};

}]);