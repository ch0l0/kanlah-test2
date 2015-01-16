app.controller('ViewBoardCtrl', ['$scope', '$rootScope', '$location', '$filter', 'CONFIG','SessionStorageService','UserService', 'ColumnService', 'boardInfo', 'boardListing', 'accountInfo', 'getMaxPos', 'coyMembers', 'boardMembers', 'showAll', 'activities', 'growl',
	function($scope, $rootScope, $location, $filter, CONFIG, SessionStorageService, UserService, ColumnService, boardInfo, boardListing, accountInfo, getMaxPos, coyMembers, boardMembers, showAll, activities, growl) {

	var DEFAULT_COLUMN_TITLE = "Untitled";
	var ACTIVE = "ACTIVE";

	$scope.userInfo = SessionStorageService.getUserInfo();
	$scope.accountInfo = accountInfo.data;
	$scope.boardMemberData = boardMembers.data;
	$scope.members = mergeBoardMemberRole(coyMembers.data, boardMembers.data);

	var boardData = boardInfo.data;
	$scope.boardInfo = boardData;
	$scope.columns = boardData.columns;
	$scope.showAll = showAll;

	$scope.systemParams = CONFIG.SYS_PARAMS;
	$scope.staticServer = $scope.systemParams.url;

	//Dummy data
	$scope.activities = [];
	if(activities.data) {
		$scope.activityData = activities;
		$scope.activities = activities.data;
	}

	$scope.isSelected = function isSelected(columnId) {
		return (boardData.id === columnId) ? true : false;
	}

	$scope.switchBoard = function onSwitchBoard() {
		if($scope.boardInfo.id != $scope.selectedBoard.id) {
			$location.path("board/" + $scope.accountInfo.accountId + "/" + $scope.selectedBoard.id + ( $scope.showAll ? "/all" : "" ) );
		}
	}

	$scope.initBoard = function onInitBoard() {
		angular.forEach($scope.boardListing, function onEach(board, i){
			if(board.id === boardData.id) {
				$scope.selectedBoard = $scope.boardListing[i];
			}
		});
		
	}

	$scope.showAllToggle = function onShowAllToggle($event) {
		$scope.showAll = $event.target.checked;
		$scope.boardListing = $scope.listBoards($scope.showAll ? true : false);
	}

	$scope.isSuspended = function onSuspended(status) {
		//console.log(status);
		return status === "SUSPENDED";
	}

	$scope.listBoards = function onListBoards(showAll) {
		if(showAll) {
			return boardListing.data;
		} else {
			var lists = [];
			angular.forEach(boardListing.data, function onEachBoard(board) {
				if(board.status === ACTIVE) {
					lists.push(board);
				}
			});
			return lists;
		}
	}

	$scope.boardListing = $scope.listBoards(showAll ? true : false);

	// NEW COLUMN: TODO, separate controller???
	$scope.createNewColumn = function onNewColumn() {

		if( $scope.columns.length >= $scope.systemParams.maxColumns ) {
			growl.addErrorMessage("Only maximum of "+ $scope.systemParams.maxColumns +" columns is allowed on this board.");
			return;
		}

		//Get the max position and assign with higher one
		var maxPos = getMaxPos($scope.columns, 'pos');
		var position =  maxPos + CONFIG.COLUMN_POSITION_INTERVAL;

		ColumnService
			.create({
				title: DEFAULT_COLUMN_TITLE,
				boardId: $scope.boardInfo.id,
				pos: position
			})
			.then(function onCreateSuccess(resp) {
				if(resp.success) {
					$scope.columns.push(resp.data); // Just array push and UI will be updated automagically
					$scope.$broadcast('updateSortableAreaWidth'); //recalculate width
				} else {
					console.warn("Something went wrong in creating the column.");
				}
			});
	}


	$scope.boardClicked = function onBoardClicked($event) {
		var $target = $($event.target);
		if(!$target.is("[data-open='context']")) {
			$scope.$broadcast('hideAllColumnContextMenu');
			$scope.$broadcast('hideAllEditTitleForm');
		}
	}

	$scope.getAccessMatrix = function onGetAccessMatrix(projectRole, boardRole){
		return UserService.getAccessMatrix($scope.userInfo, projectRole, boardRole);
	}

	$rootScope.$on("column:updated", function($event, columnInfo) {
		if(!columnInfo) {
			return;
		}
		$event.preventDefault();
		angular.forEach($scope.columns, function onEachCard(column, i) {
			if(column.id === columnInfo.id) {
				$scope.columns[i] = columnInfo;
			}
		});
	});

	function mergeBoardMemberRole(cm, bm){
		$.each(cm, function(i, e){
			var match = bm.match("id",e.userId);
			e.boardRole = match ? match.role : null;
			//Map Current User Roles
			if(e.userId === $scope.userInfo.id){
				$scope.userInfo.boardRole = e.boardRole;
				$scope.userInfo.projectRole = e.role;
				$scope.userInfo.acl = UserService.getAccessMatrix($scope.userInfo);
			}
		});
		return cm;
	}

	// $rootScope.$on("column:added", $scope.refreshActivities);
	// $rootScope.$on("newCardCreated", $scope.refreshActivities);
	// $rootScope.$on("column:updated", $scope.refreshActivities);
	// $rootScope.$on("card:updated", $scope.refreshActivities);

}]);