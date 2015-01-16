app.controller('DashboardCtrl', ['$scope', '$rootScope', '$dialogs', '$filter', 'CONFIG', 'AccountService', 'CompanyService', 'BoardService', 'MemberService', 'BoardMemberService', 'userInfo', 'companies', 'growl', 
	function($scope, $rootScope, $dialogs, $filter, CONFIG, AccountService, CompanyService, BoardService, MemberService, BoardMemberService, userInfo, companies, growl) {

	var TPL_MANAGE_BOARD = '/partials/dashboard/board-manage.html';
	var TPL_PROJECT_SETTINGS = '/partials/dashboard/project-settings.html';

	$scope.userInfo = userInfo;
	$scope.projects = companies.data;
	$scope.maxProjects = CONFIG.SYS_PARAMS.maxProjects;
	$scope.maxBoardsPerProject = CONFIG.SYS_PARAMS.maxBoards;
	$scope.ownedProj = $filter('filter')($scope.projects,  {role:'OWNER'}) || [];


	function getCompanyMembers(accountId, callback) {
		CompanyService
			.members(accountId)
			.then(callback);
	}

	$scope.projectSettings = function onProjectSettings(accountId){
		getCompanyMembers(accountId, function onGetProjectMembers(projMembers) {
			CompanyService
				.labels(accountId)
				.then(function onGetLabels(labels) {
					AccountService
						.get(accountId)
						.then(function onGetAccountInfo(account) {
							var project = $scope.projects.match("accountId", accountId);
							userInfo.projectRole = project.role;
							dialog = $dialogs
								.create(TPL_PROJECT_SETTINGS, 'ManageProjectCtrl', {
									userInfo: userInfo,
									account: account.data, 
									labels: labels.data || [], 
									projMembers: projMembers.data || []
								});
						});
				});
		});
	};

	$scope.createBoard = function onCreateBoard(accountId) {
		getCompanyMembers(accountId, function onGetProjectMembers(projMembers) {
			dialog = $dialogs
				.create(TPL_MANAGE_BOARD, 'ManageBoardCtrl', {
					userInfo: userInfo,
					accountId: accountId,
					projMembers: projMembers.data || [], 
					isNew: true
				});
		});
	}

	$scope.manageBoard = function onManageBoard(accountId, boardId, boardIndex, aclByBoard) {
		getCompanyMembers(accountId, function onGetProjectMembers(projMembers) {
				BoardMemberService
					.get(boardId)
					.then(function onGetBoardMembers(boardMembers) {
						BoardService
								.settings(boardId)
								.then(function onGetBoard(boardInfo) {
									var params = {
										userInfo: userInfo,
										accountId: accountId,
										boardInfo: boardInfo.data,
										boardIndex: boardIndex,
										projMembers: projMembers.data || [],
										boardMembers: boardMembers.data || [],
										aclByBoard: aclByBoard
									};
									dialog = $dialogs
										.create(TPL_MANAGE_BOARD, 'ManageBoardCtrl', params);
								});
					});
			});
	}

	$rootScope.$on("project:deleted", function onProjectDeleted($event, id) {
		angular.forEach($scope.projects, function onEachProject(project, idx) {
			if(project.accountId === id) {
				$scope.projects.splice(idx, 1);
			}
		});
		
	});

}]);