app.directive('resizeableListing', ['$timeout', 'CONFIG', function($timeout, CONFIG) {

	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			var $element = $(element[0]);

			var resize = function onResize() {
				var bodyHeight = $(window).height();
				var footerHeight = $(".footer").height();
				var subHeaderHeight = (attrs.resizeableListing==="projects") ? 55 : 125;
				var navBarHeight = 55;
				var computedHeight  = bodyHeight - (footerHeight + subHeaderHeight + navBarHeight);

				$element.css("max-height",computedHeight);
			}

			$(window).resize(function() {
				$timeout(resize,0);
			});

			resize();

		}
	}

}]);