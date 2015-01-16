app.directive('toggleActionButton', [function() {
	return {
		link: function (scope, element, attrs) {
			$( element ).hover(
				function() {
					$(this).find('.manageMember').fadeIn('fast');
				}, function() {
					$(this).find('.manageMember').fadeOut('fast');
				}
			);	
		}
	};
}]);

