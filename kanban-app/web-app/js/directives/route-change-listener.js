app.directive('routeChangeListener', ['$timeout', 'CONFIG', function($timeout, CONFIG) {

	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			var $element = $(element[0]);

			function routeChanged(event, route) { 
				if(route.params.accountId && route.params.boardId) {
					$element.addClass("board");
				} else {
					$element.removeClass("board");
				}
			}

			scope.$on("$routeChangeSuccess", routeChanged);

		}
	}

}]);