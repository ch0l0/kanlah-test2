app.directive('responseMessage', ['$timeout', function($timeout) {
	return {
		restrict: 'A',
		scope: {
			data:"=data"
		},
		link: function (scope, element, attrs) {
			var $element = $(element[0]);

			function init(){
				$element.attr("class", "alert alert-{0} error-msg".format(scope.data.success ? "success" : "danger"));
				$element.html(scope.data.message);
				scope.data.show ? $element.show() : $element.hide();

				var $close = $element.find(".close-message");
				if($close.length === 0){
					$close = $("<i class='close-message pointer pull-right fa fa-times-circle'></i>").on("click", function(event){
						$(event.target).parent().hide();
						scope.data.show = false;
						scope.data.message = "";
					}).appendTo($element);
				}
			}

			scope.$watch("data", function(newVal, oldVal){
				init();
			}, true);

			$timeout(init, 10);
		}
	}

}]);