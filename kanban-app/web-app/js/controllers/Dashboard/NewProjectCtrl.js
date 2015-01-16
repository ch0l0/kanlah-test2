app.controller('NewProjectCtrl', ['$rootScope', '$scope', '$dialogs', '$filter', 'CONFIG', 'AccountService', 'growl', function($rootScope, $scope, $dialogs, $filter, CONFIG, AccountService, growl) {

	var RE_ALPHANUMERIC = /^[\w\d_\s\(\)\!]*$/;

	$scope.project = {
		companyName: ""
	};

	$scope.saveProject = function onSave() {

		if(!$scope.project.companyName || !RE_ALPHANUMERIC.test($scope.project.companyName)) {
			dialog = $dialogs.error(CONFIG.APP_NAME, "Please enter a valid name for the project.");
			return;
		}

		if($scope.ownedProj.length === $scope.maxProjects) {
			dialog = $dialogs.error(CONFIG.APP_NAME, "You have reach the maximum number of projects per account.");
			return;
		}

		//This is a callback when there is an httpinterceptor error
		httpInterceptorCallBack = function httpInterceptorCallBack(){
			$scope.newProject = !$scope.newProject;
		}

		AccountService
			.create(angular.extend($scope.project, {userId: $scope.userInfo.id}))
			.then(function onCreateSuccess(resp) {
				if(resp.success) {
					growl.addSuccessMessage(resp.message);
					$scope.projects.push(resp.data);
				} else {
					growl.addErrorMessage(resp.message);
				}
				$scope.project.companyName = "";
				$scope.newProject = !$scope.newProject;
				$scope.ownedProj = $filter('filter')($scope.projects,  {role:'OWNER'}) || [];
			});
	}
	$rootScope.$on("project:deleted", function onProjectDeleted($event, id) {
		$scope.ownedProj = $filter('filter')($scope.projects,  {role:'OWNER'}) || [];
	});
	

}]);