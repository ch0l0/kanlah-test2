app.directive('sortableTableRows', ['$timeout', 'CONFIG', function($timeout, CONFIG) {

	return {
		restrict: 'A',
		scope: true,
		require: '?ngModel',
		link: function (scope, element, attrs, ngModel) {

			var $element = $(element[0]);

			function init() {
				$element.sortable({
					cursor: "move",
					handle: ".handle",
					update: function onUpdate(event, ui) {
						var columns = [];
						$element.find("tr").each(function onEachTr(i, tr) {
							var column = $(tr).attr("data-column");
							columns.push(angular.extend(JSON.parse(column) || $.parseJSON(column), {pos: (i+1) * CONFIG.COLUMN_POSITION_INTERVAL}));
						});
						scope.updateColumns(columns)
					}
				});
			}

			$timeout(init,0);
		}
	}

}]);