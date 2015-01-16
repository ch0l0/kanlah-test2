app.controller('ManageBoardCtrl', ['$scope', '$rootScope', 'CONFIG', '$modalInstance', 'data', '$dialogs', 'SessionStorageService', 'BoardService', 'growl', function($scope, $rootScope, CONFIG, $modalInstance, data, $dialogs, SessionStorageService, BoardService, growl) {

	$scope.mergeBoardMemberRole = function onMerge(cm, bm){
		$.each(cm, function(i, e){
			var match = bm.match("id",e.userId);
			e.boardRole = match ? match.role : null;
			//Map Current User Roles
			if(e.userId === $scope.userInfo.id){
				$scope.userInfo.boardRole = e.boardRole;
				$scope.userInfo.projectRole = e.role;
			}
		});
		return cm;
	}

	$scope.TAB_SETTINGS_INDEX = 1;
	$scope.TAB_MEMBERS_INDEX = 2;

	$scope.userInfo = SessionStorageService.getUserInfo();
	$scope.members = $scope.mergeBoardMemberRole(data.projMembers, data.boardMembers || []);
	$scope.projMembers = data.projMembers;

	$scope.accountId = data.accountId;
	$scope.boardIndex = angular.isDefined(data.boardIndex)  ? data.boardIndex : null;
	$scope.boardInfo = data.boardInfo || null;
	$scope.isNew = data.isNew || false;
	$scope.aclByBoard = data.aclByBoard;

	$scope.tabSettings = true;

	$scope.boardMemberTabEnabled = data.isNew ? false : true;
	$scope.boardSettingsTabEnabled = true;

	$scope.toggleTabs = function onToggleTabs(index, enableBoardSettingsTab, enableBoardMemberTab) {
		$scope.boardSettingsTabEnabled = angular.isDefined(enableBoardSettingsTab) ? enableBoardSettingsTab : $scope.boardSettingsTabEnabled;
		$scope.boardMemberTabEnabled = angular.isDefined(enableBoardMemberTab) ? enableBoardMemberTab : $scope.boardMemberTabEnabled;
		$scope.tabSettings = (index === $scope.TAB_SETTINGS_INDEX) ? true : false;
	}

	$scope.DEFAULT_COLUMNS = [];
	var systemParams = CONFIG.SYS_PARAMS;
	angular.forEach(CONFIG.DEFAULT_COLUMN_NAMES, function onEachName(colName, i) {
		$scope.DEFAULT_COLUMNS.push({
			title: colName,
			pos: (i+1) * CONFIG.COLUMN_POSITION_INTERVAL,
			max: systemParams.maxCardsPerColumn, 
			status:'ACTIVE'
		});
	});

	$scope.deleteBoard = function onDeleteBoard($event) {
		$event.preventDefault();
		function remove() {
			BoardService
				.delete($scope.boardInfo.id)
				.then(function onRemove(resp) {
					$rootScope.$broadcast("board:deleted", {accountId:$scope.accountId});
					growl.addSuccessMessage("The board has been successfully deleted.");
					$scope.cancel();
				});
		}
		confirmDialog = $dialogs
			.confirm(CONFIG.APP_NAME,'Are you sure you want to delete this board? This action cannot be undone.')
			.result.then(function(btn){
				if(btn === "yes") {
					remove();
				}
			});
	}

	$scope.cancel = function onCancel(){
		$scope.columns = !$scope.isNew ? $scope.boardInfo.columns : $scope.DEFAULT_COLUMNS;
		$modalInstance.dismiss('canceled');
	};

	$rootScope.$on("board:created", function onBoardCreated(events, board) {
		$scope.boardInfo = board;
		$scope.$broadcast("refreshMemberList");
	});

}]);