app.directive('autoFill', ['$timeout', function($timeout) {
	//This directive to sync auto-fill values with the angular model
	return {
	require: 'ngModel',
	link: function(scope, elem, attrs, ngModel) {
		var origVal = elem.val();
		$timeout(function () {
			var newVal = elem.val();
			if(ngModel.$pristine && origVal !== newVal) {
					ngModel.$setViewValue(newVal);
				}
			}, 500);
		}
	}
}]);