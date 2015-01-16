app.controller('ProjectCtrl', ['$scope', '$rootScope', '$dialogs', '$filter', 'CONFIG','UserService', 'MemberService', 'BoardService', 'growl', 
	function($scope, $rootScope, $dialogs, $filter, CONFIG, UserService, MemberService, BoardService, growl) {

	$scope.acceptInvite = function onAcceptInvite(projectId) {
		MemberService
			.accept(projectId)
			.then(function onAcceptInvite(resp) {
				$scope.project.status = "ACTIVE";
				 growl.addSuccessMessage("You have accepted the invitation to the project.");
			});
	}

	$scope.declineInvite = function onDeclineInvite(projectId) {
		function decline() {
			MemberService
				.decline({accountId: projectId, userId: $scope.userInfo.id })
				.then(function onDeclineInvite() {
					angular.forEach($scope.projects, function onEach(proj, i) {
						if(projectId === proj.accountId) {
							growl.addSuccessMessage("You have declined the invitation to the project.");
							$scope.projects.splice(i, 1);
						}
					});
				});
		}

		confirmDialog = $dialogs
			.confirm(CONFIG.APP_NAME,'Are you sure you want to decline this invitation?')
			.result.then(function(btn){
				if(btn === "yes") {
					decline()
				}
			});
	}

	$scope.filterActiveBoards = function onFilterActiveBoards() {
		var active = $filter('filter')($scope.project.boards,  {status:'ACTIVE'}) || [];
		var completed =  $filter('filter')($scope.project.boards,  {status:'COMPLETED'}) || [];
		return active.concat(completed);
	}

	$scope.numOfActiveBoard = function onNumOfActiveBoards() {
		var activeBoards = $scope.filterActiveBoards();
		return activeBoards.length;
	}

	$scope.activeBoardsLen = $scope.numOfActiveBoard();

	$scope.deleteBoard = function onDeleteBoard(projectId, boardId, index) {
		function remove() {
			BoardService
				.delete(boardId)
				.then(function onRemove(resp) {
					//$scope.project.boards[index].status = resp.data.status;
					$scope.project.boards = $scope.project.boards.findAndSet('id', boardId, 'status', resp.data.status);
					$rootScope.$broadcast("board:deleted", {accountId:projectId});
					growl.addSuccessMessage("The board has been successfully deleted.");
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

	$scope.getAccessMatrix = function onGetAccessMatrix(userProjectRole, userBoardRole){
		$scope.userInfo.projectRole = userProjectRole;
		$scope.userInfo.boardRole = userBoardRole;
		return UserService.getAccessMatrix($scope.userInfo);
	}

	// Listening to new board creation then add to the list
	var onBoardCreated = function onBoardCreated(event, params) {
		if(params.accountId === $scope.project.accountId) {
			$scope.project.boards = angular.isArray($scope.project.boards) ? $scope.project.boards : [];
			$scope.project.boards.push(params);
		}
	}

	// Listening to new board updates
	var onBoardUpdated = function onBoardUpdated(event, params) {
		if(params.accountId === $scope.project.accountId) {
			angular.forEach($scope.project.boards, function onEachBoard(board, i) {
				if(board.id === params.id) {
					$.extend($scope.project.boards[i],params);
				}
			});
		}
	}

	$rootScope.$on("board:created", onBoardCreated);
	$rootScope.$on("board:updated", onBoardUpdated);

}]);