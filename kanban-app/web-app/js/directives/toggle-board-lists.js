app.directive('toggleBoardLists', ['$timeout', '$rootScope', 'CONFIG', function($timeout, $rootScope, CONFIG) {

	var currTarget = null;

	return {
		restrict: 'A',
		scope: true,
		link: function (scope, element, attrs) {

			var $element = $(element[0]);

			function click($event) {
				var $target = $($event.target);
				if(!$target.is(".trigger")) {
					return;
				}
				var	$li = $target.closest("li"),
					$group = $li.find('.board-group'),
					height = scope.activeBoardsLen * 28,
					currentSetHeight = $group.height(),
					opacity = 1;

				if(currentSetHeight > 0) {
					height = 0;
					opacity = 0;
				} else {
					//$('.company-list').find('.board-group').css({height:0, opacity: 0});
					if(height == 0) {
						height =  28;
						opacity = 1;
					}
				}
				$group.css({height: height, opacity: opacity});
			}

			function init() {
				$element.click(click);
			}


			function adjustHeight(event, board) {
				if(board.accountId !== scope.project.accountId) {
					return;
				}
				var len = board.id ? ++scope.activeBoardsLen : --scope.activeBoardsLen;

				var $li = $("[data-id='"+board.accountId+"']"),
					height = len * 28,
					$group = $li.find('.board-group'),
					currentSetHeight = $group.height();
				if(currentSetHeight > 0) {
					$group.css({height: height});
				}
			}

			$timeout(init,0);
			$rootScope.$on("board:created", adjustHeight);
			$rootScope.$on("board:deleted", adjustHeight);
		}
	}

}]);