app.directive('toggleOnAuthenticated', ['$rootScope', 'AuthenticationService', function($rootScope, AuthenticationService) {

	return {
		restrict: 'A',
		link: function (scope, element, attrs) {

			var $element = $(element[0]);

			function toggleIfAuthenticated() {
				if( (AuthenticationService.isLoggedIn() && attrs.toggleOnAuthenticated === "true") 
					|| (!AuthenticationService.isLoggedIn() && attrs.toggleOnAuthenticated === "false") ) {
					$element.removeClass('hide');
					$rootScope.$broadcast('header.authenticated', AuthenticationService.isLoggedIn());
				} else {
					$element.addClass('hide');
				}
			}

			scope.$on('$routeChangeSuccess', toggleIfAuthenticated);
			toggleIfAuthenticated();
		}
	}

}]);