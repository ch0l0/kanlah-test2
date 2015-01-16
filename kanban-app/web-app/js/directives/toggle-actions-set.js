app.directive('toggleActionsSet', ['$timeout', '$rootScope', 'throttle', function($timeout, $rootScope, throttle) {

	return {
		restrict: 'A',
		link: function (scope, element, attrs) {

			function init() {
				$(element).find('.board-row').off('mouseover').mouseover(function() {
					$(this).addClass('over');
					$(this).find('.board').removeClass('hide');
				})
				$(element).find('.board-row').off('mouseout').mouseout(function() {
					$(this).removeClass('over');
					$(this).find('.board').addClass('hide');
				})
			}
			$timeout(init,0);

			var fn = throttle(0, function() { $timeout(init,500); });
			$rootScope.$on("board:created", fn);
			$rootScope.$on("board:updated", fn);
			$rootScope.$on("board:deleted", fn);
		}
	}
}]);