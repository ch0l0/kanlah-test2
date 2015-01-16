app.directive('toggleSlideMenu', ['$location', function($location) {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			var $sp = $('.slide-panel'),
				 $membersPane = $('.side-manage-members'),
				 $activityPane = $('.side-activity-stream');

			if($location.path().match(/board/g) == null) {
				$(element).addClass('hide');
				return false;
			}

			$(element).removeClass('hide');

			function resetPanes() {
				$sp.toggleClass('on');
				$membersPane.addClass('hide');
				$activityPane.addClass('hide');
			}
			
			element.bind('click', function() {
				if(attrs.toggleSlideMenu == 'close')  {
					resetPanes();
					return false;
				}
				
				if ($membersPane.hasClass('hide') && $activityPane.hasClass('hide')) {
					resetPanes();
				}
				
				if($sp.hasClass('on')) {
					$membersPane.addClass('hide');
					$activityPane.addClass('hide');
				
					if(attrs.toggleSlideMenu == 'members')  {
						$membersPane.removeClass('hide');
					} else if(attrs.toggleSlideMenu == 'activity')  {
						$activityPane.removeClass('hide');
					}
				}

			})
			
			$(element).tooltip();
		}
	}
}]);