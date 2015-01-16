app.directive('postCardsLoop', [function() {
	return  function(scope, element, attrs) {
		if (scope.$last){
			scope.$emit('adjustColumnHeight');
		}
	}
}]);