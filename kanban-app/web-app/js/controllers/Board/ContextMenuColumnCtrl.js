app.controller('ContextMenuColumnCtrl', ['$scope', '$dialogs', 'CONFIG', 'ColumnService', function($scope, $dialogs, CONFIG, ColumnService) {

	var TPL_COLUMN_MAXCARDS = '/partials/boards/column-max-cards.html';

	$scope.deleteColumn = function onDeleteColumn() {
		function remove() {
			ColumnService
				.delete($scope.column.id)
				.then(function onResponse(resp) {

					if(!resp.success) {
						console.warn("Something went wrong deleting a column.");
						return;
					}

					var col = resp.data;
					angular.forEach($scope.columns, function onEachColumn(column, i) {
						if(col.id == column.id) {
							$scope.columns.splice(i, 1);
						}
					})
				});
		}

		confirmDialog = $dialogs
			.confirm(CONFIG.APP_NAME,'Are you sure you want to delete this column?')
			.result.then(function(btn){
				if(btn === "yes") {
					remove();
				}
			});
	}

	$scope.updateMaxCards = function onUpdateMaxCards($event) {
		dialog = $dialogs
			.create(TPL_COLUMN_MAXCARDS, 'MaxCardColumnCtrl', $scope.column);
	}

	$scope.subcribeColumn = function onSubscribeColumn($event) {
		ColumnService
			.subscribe($scope.column.id)
			.then(function onSubscribe(resp) {
				$scope.column.subscribed = true;
			});
	}

	$scope.unSubcribeColumn = function onUnSubscribeColumn($event) {
		ColumnService
			.unsubscribe($scope.column.id)
			.then(function onSubscribe(resp) {
				$scope.column.subscribed = false;
			});
	}

}]);
