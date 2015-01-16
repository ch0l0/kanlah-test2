app.directive('labelPicker', ['$compile', '$timeout', function($compile, $timeout) {

	var templateNotEmpty = '<ul class="list-style-clear label-picker">' +
						'<li ng-repeat="label in projLabels">' +
							'<div ng-click="assignLabel(label.id)" class="btn btn-info ng-binding" ng-style="{backgroundColor: ' + "'#'" + ' + label.color}">' +
								'<i class="icon icon-ok"></i>{{label.name}}' +
							'</div>' +
						'</li>' +
					'</ul>';
	var templateEmpty = '<span class="no-members-popover">No labels were created for this project yet. Please go to project settings to manage labels.</span>';

	return {
		scope: true,
		restrict: 'A',
		link: function (scope, element, attrs) {
			function init(){
				$(element).parent().append( scope.projLabels.length == 0 ? templateEmpty : templateNotEmpty);
				$compile($(element).next())(scope);
				
				var options = {
					html: true,
					placement: "right",
					title: function() {
						return attrs.title;
					},
					content:$(element).next()
				};

				$(element).popover(options);
				$(element).next().remove();
			}
			$timeout(init, 100);
		}
	};
}]);