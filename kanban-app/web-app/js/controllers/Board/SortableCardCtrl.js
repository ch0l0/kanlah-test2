app.controller('SortableCardCtrl', ['$scope', 'CardService', function($scope, CardService) {

	$scope.updateCardPosition = function onUpdateCardPosition(id, params) {
		// Card was added
		if(params.columnId === $scope.column.id) {
			CardService
				.update(id, params)
				.then(function onUpdate(resp) {
					$scope.$emit("card:updated");
				});
		}
		// Card item was removed from the lists, remove from the columns array
		else {}

	}

}]);