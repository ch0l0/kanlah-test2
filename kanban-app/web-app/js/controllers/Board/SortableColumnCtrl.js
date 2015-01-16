app.controller('SortableColumnCtrl', ['$scope', 'ColumnService', function($scope, ColumnService) {

	$scope.updatePosition = function onUpdatePosition(id, newPos) {
		ColumnService
			.update(id, {pos: newPos})
			.then(function onUpdate(resp) {

				angular.forEach($scope.columns, function onEachColumn(column, i) {
					if(column.id === id) {
						angular.extend(column, resp.data);
					}
				});

				$scope.$emit("column:updated");

			});
	}

}]);