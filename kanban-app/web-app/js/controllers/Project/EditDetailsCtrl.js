app.controller('EditDetailsCtrl', ['$scope', '$modalInstance', 'data', function($scope, $modalInstance, data) {
	$scope.company = data;

	$scope.save = function(){
		$modalInstance.dismiss('canceled');
	};

	$scope.cancel = function(){
		$modalInstance.dismiss('canceled');
	};
}]);