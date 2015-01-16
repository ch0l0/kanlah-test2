app.controller('MaxCardColumnCtrl', ['$scope', '$rootScope', '$modalInstance', 'data', 'ColumnService', function($scope, $rootScope, $modalInstance, data, ColumnService) {

	$scope.column = data;

	$scope.save = function onSave() {
			ColumnService
			.update($scope.column.id, {max: $scope.column.max})
			.then(function onUpdate(resp) {
				$rootScope.$broadcast("column:updated", angular.extend({}, $scope.column, {max: $scope.column.max}));
				$modalInstance.dismiss('canceled');
			});
	}

	$scope.cancel = function onCancel(){
		$modalInstance.dismiss('canceled');
	};

}]);
