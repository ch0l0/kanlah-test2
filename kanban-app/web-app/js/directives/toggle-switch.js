app.directive('toggleSwitch', ['$location', function($location) {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			//console.log(element)
			$(element).bootstrapSwitch();
		}
	}
}]);