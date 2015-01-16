app.controller('ManageProjectCtrl', ['$scope', '$rootScope', '$modalInstance', '$timeout', 'data', '$dialogs', '$location', 'CONFIG','SessionStorageService', 'BoardService', 'AccountService', 'CompanyService', 'MemberService', 'LabelService', 'growl', 
	function($scope, $rootScope, $modalInstance, $timeout, data, $dialogs, $location, CONFIG, SessionStorageService, BoardService, AccountService, CompanyService, MemberService, LabelService, growl) {

	
	$scope.toggleIcon = 'fa fa-plus-square';
	$scope.colors = CONFIG.DEFAULT_LABEL_COLOURS;
	$scope.labels = data.labels;
	$scope.members = data.projMembers;
	$scope.userInfo = data.userInfo;

	$scope.project = {
		accountId: data.account.accountId,
		userId: data.id,
		companyName: data.account.name,
		companyDescription: data.account.description
	}

	$scope.member = {
		accountId: data.account.accountId,
		displayName: "",
		email: "",
		password: ""
	};

	/* Project */
	$scope.updateProject = function onUpdate() {

		if(!$scope.project.companyName) return;

		AccountService
			.update(data.account.accountId, $scope.project)
			.then(function onCreateSuccess(resp) {


				if(!resp.success) {
					growl.addErrorMessage(resp.message);
					return;
				}

				growl.addSuccessMessage(resp.message);
				$scope.setProjectAlignment();
				$rootScope.$broadcast("project:updated", angular.extend(resp.data, {accountId:data.account.accountId}));
				$modalInstance.dismiss('canceled');
			});
	}

	$scope.cancel = function(){
		$modalInstance.dismiss('canceled');
	};

	$scope.toggleTab = function(view){
		$('#project, #label, #team').hide();
		$('#'+view).fadeIn();
	};

	$scope.toggleMember = function(view){
		if(view == 1){
			$scope.inviteExisting();
		}else{		
			$('#existingMember').hide();
			$('#newMember').fadeIn();
		}
	};

	$scope.inviteExisting = function(){
		$('#newMember').hide();
		$('#existingMember').fadeIn();
	};

	$scope.toggleAdvanced = function onToggleAdvanced() {
		$scope.advancedToggleShown = !$scope.advancedToggleShown;
		$scope.toggleIcon = !$scope.advancedToggleShown ? "fa fa-plus-square" : "fa fa-minus-square";
	}

	$scope.InviteMember = function(credentials){
		MemberService
			.invite(credentials)
			.then(function onSuccess(resp) {
				if(resp.success) {
					growl.addSuccessMessage(resp.message);
					$scope.appendAddedMember(resp);
					$scope.member.existingEmail = '';
					$("#existingMember form").parsley().reset();
					$("#existingMember form :input:not(:button)").val("")
					return;
				}else {
					//$scope.errorMessage = resp.message;
					growl.addErrorMessage(resp.message);
				}
			});
	};	

	$scope.appendAddedMember = function(resp){
		var newMember = {
			fullname: resp.data.fullname,
			userId: resp.data.id,
			role: 'MEMBER',
			status: 'PENDING'
		}
		$scope.members.push(newMember);
	};

	/* Label */

	$scope.onSelect = function onSelect(color) {
		$scope.$apply(function() {
			$scope.color = color;
		});
	};

	$scope.reset = function(){
		$scope.member = {};
	};

	$scope.setProjectAlignment = function(){
		var projectName = $("#projectName-"+data.account.accountId);
		var projectDesc = $("#projectDesc-"+data.account.accountId);

		if($scope.project.companyDescription != ''){
			projectName.removeClass('centered');
		}else{
			projectName.addClass('centered');
		}

		projectName.text($scope.project.companyName);
		projectDesc.text($scope.project.companyDescription);
	};

	$scope.deleteProject = function onDeleteProject($event) {
		function remove() {
			AccountService
				.delete($scope.project.accountId)
				.then(function onDelete() {
					$rootScope.$broadcast("project:deleted", $scope.project.accountId);
					$modalInstance.dismiss('canceled');
				});
		}

		confirmDialog = $dialogs
			.confirm(CONFIG.APP_NAME,'Are you sure you want to delete this project? All boards under this project will be removed as well.')
			.result.then(function(btn){
				if(btn === "yes") {
					remove()
				}
			});
	}

}]);