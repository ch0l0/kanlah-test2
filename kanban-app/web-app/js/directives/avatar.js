app.directive('avatar', ['$timeout', '$rootScope', 'CONFIG', 'AuthenticationService', 'SessionStorageService',  function($timeout, $rootScope, CONFIG, AuthenticationService, SessionStorageService){
	return {
		restrict: 'A',
		scope: {
			user: "=data"
		},
		link: function(scope, element, attrs) {
			
			var noavatar = 'images/avatar-blank.jpg';
			function init(){

				// Only logged-in user should have access to the avatars
				if(!AuthenticationService.isLoggedIn()){
					return;
				}

				if(!scope.user) {
					$(element).attr("src", noavatar);
					return;
				}

				var src = scope.user.useAvatar ?  scope.user.avatar : noavatar;
				var ts = new Date();
				$(element).attr("src",  CONFIG.SYS_PARAMS.url + src + "?" + ts.getTime());

				if($(element).attr('nopopover') == 'true') {
					return false;
				}

				$(element).parent().attr("data-title", scope.user.fullname);
				$(element).parent().popover();
			}

			scope.$watch("user", function(newVal, oldVal) {
				if ((newVal && oldVal && newVal.avatar != oldVal.avatar) || (newVal && !oldVal) ) {
					init();
				}
			}, true);

			$rootScope.$on("userInfo:updated", function(events, userInfo) {
				//systemParams = SessionStorageService.getSystemParams();
				init();
			});

			$timeout(init, 10);
		}
	}
}]);