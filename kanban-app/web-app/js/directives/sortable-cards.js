app.directive('sortableCards', ['CONFIG', '$timeout', function(CONFIG, $timeout) {
	return {
		restrict: 'A',
		require: '?ngModel',
		link: function (scope, element, attrs, ngModel) {
			var $element = $(element[0]);

			var timeout;
			function getColumnPosition(id) {
				var pos = 0;
				angular.forEach(scope.column.cards, function onEachColumn(card) {
					if(card.id === id) {
						pos = card.pos;
					}
				});
				return pos;
			}


			$(element).sortable({
				connectWith: ".cards",
				opacity: 0.9,
				placeholder: "highlight",
				start: function (event, ui) {
					$('.highlight', $element).css({
						'height':  $(ui.item).outerHeight(),
						'margin-bottom': 10
					})

					ui.item.toggleClass("highlight");

					scope.$emit('hideAllColumnContextMenu');
					scope.$emit('hideAllEditTitleForm');
				},
				stop: function (event, ui) {
					ui.item.toggleClass("highlight");
				},
				update: function(event, ui) {
					var $target = $(ui.item);

					var $prev = $target.prev();
					var $next = $target.next();
					var $last = $target.siblings(".card:last"); // In case moving to the last, needed the last element
					var prevPos = +getColumnPosition( $prev.attr("data-id") );
					var nextPos = +getColumnPosition( $next.attr("data-id") );
					var lastPos = +getColumnPosition( $last.attr("data-id") );
					var prevVal = ($prev.length && prevPos) || 0;
					var nextVal = ($next.length && nextPos) || (lastPos + CONFIG.CARD_POSITION_INTERVAL);
					var newPos = Math.ceil((prevVal + nextVal) / 2);
					var columnId = $target.closest("li.list").attr("data-id");
					scope.updateCardPosition($target.attr("data-id"), {pos: newPos, columnId: columnId});

				}
			}).disableSelection();
			
			$(element).bind('click.sortable mousedown.sortable',function(ev){
				ev.target.focus();
			});
		}
	}
}]);