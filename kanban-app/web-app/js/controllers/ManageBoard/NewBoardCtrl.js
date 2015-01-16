app.controller('NewBoardCtrl', ['$scope', '$rootScope', '$dialogs', 'CONFIG', 'BoardService', 'BoardMemberService', 'getMaxPos', 'growl', 
	function($scope, $rootScope, $dialogs, CONFIG, BoardService, BoardMemberService, getMaxPos, growl) {
	var columnIndex = 0;
	var systemParams = CONFIG.SYS_PARAMS;

	$scope.columns = !$scope.isNew ? $scope.boardInfo.columns : $scope.DEFAULT_COLUMNS;

	$scope.board = {
		title: !$scope.isNew ? $scope.boardInfo.title : "",
		description: !$scope.isNew ? $scope.boardInfo.description : "",
		accountId: $scope.accountId,
		status: !$scope.isNew ? $scope.boardInfo.status : 'ACTIVE',
		columns: $scope.columns
	};

	$scope.board.description = ($scope.board.description && $scope.board.description !== "null")
								? $scope.board.description
								: "";


	$scope.boardStatusList= ['ACTIVE','COMPLETED'];

	$scope.saveBoard = function onSaveBoard() {

		$scope.isNew
			? $scope.addBoard() 
			: $scope.updateBoard();
	}

	$scope.addBoard = function onAddBoard() {
		BoardService
			.create($scope.board)
			.then(function onCreateSuccess(resp) {

				if(!resp.success) {
					growl.addErrorMessage(resp.message);
					return;
				}

				// Reset
				$scope.board.title = "";
				$scope.board.description = "";

				// Publish for new board
				$rootScope.$broadcast("board:created", angular.extend(resp.data, {accountId:$scope.accountId}));
				// Alert the user
				growl.addSuccessMessage(resp.message);

				BoardMemberService
					.get($scope.boardInfo.id)
					.then(function onGetBoardMembers(boardMembers) {
						$scope.members = $scope.mergeBoardMemberRole($scope.projMembers, boardMembers.data || []);
						//Toggle tabs
						$scope.toggleTabs($scope.TAB_MEMBERS_INDEX, false, true);
					});

			});
	}

	$scope.updateBoard = function onSaveBoard() {
		BoardService
			.update($scope.boardInfo.id, angular.extend($scope.board))
			.then(function onUpdate(resp) {
				if(!resp.success) {
					//$scope.errorMessage = resp.message;
					growl.addErrorMessage(resp.message);
					return;
				}
				$rootScope.$broadcast("board:updated", angular.extend(resp.data, {accountId:$scope.accountId}));
				$scope.toggleTabs($scope.TAB_MEMBERS_INDEX);
				growl.addSuccessMessage(resp.message);
			});
	}

	$scope.updateColumns = function onSortColumns(columns) {
		$scope.$apply(function() {
			$scope.board.columns = $scope.columns = columns;
		});
		
	}

	$scope.addColumn = function onAddColumn() {
		var activeColumnsLength = 0;
		$.each($scope.board.columns, function(i,e){
			if(e.status === 'ACTIVE') activeColumnsLength ++;
		});
		//if( $scope.board.columns.length === systemParams.maxColumns ) {
		if(activeColumnsLength >= systemParams.maxColumns){
			growl.addErrorMessage("Only maximum of "+systemParams.maxColumns+" columns is allowed on this board.");
			return;
		}

		var maxPos = getMaxPos($scope.board.columns);
		$scope.columns.push({
			_id: (new Date()).getTime(),
			title: "Column " + ++columnIndex,
			pos: maxPos + CONFIG.COLUMN_POSITION_INTERVAL,
			max: systemParams.maxCardsPerColumn,
			status: 'ACTIVE'
		});
		//Refresh for validation
		$rootScope.$broadcast("parsleyValidation:refresh");
	}

	$scope.removeColumn = function onRemoveColumn(index) {
		$scope.columns.splice(index, 1);
	}

	$scope.updateColumn = function onUpdate(column, attr, val) {
		var searchField = (column.id ? {name:'id', val:column.id } : {name:'_id', val:column._id});
		$scope.columns = $scope.columns.findAndSet(searchField.name,searchField.val, attr, val);
	}

	$scope.toggleAdvanced = function onToggleAdvanced() {
		$scope.advancedToggleShown = !$scope.advancedToggleShown;
		$scope.advancedToggleIcon = !$scope.advancedToggleShown ? "glyphicon-expand" : "glyphicon-collapse-down";
	}

}]);