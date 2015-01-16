app.directive('sortableColumns', ['CONFIG', function(CONFIG) {

	var COLUMN_WIDTH = 320;

	return {
		restrict: 'A',
		scope: true,
		link: function (scope, element, attrs) {
			var $element = $(element[0]);

			function updateSortableAreaWidth() {
				if(!scope.columns) return;
				var newWidth = (scope.columns.length + 1) * COLUMN_WIDTH; // +1 For create column button
				var windowWidth = $(window).width();

				if(newWidth > windowWidth) {
					$element.css({width:newWidth});
				} else {
					$element.css({width:windowWidth});
				}
			}

			function hideAllColumnContextMenu() {
				$('#sortable-columns .list').find('.dropdown-menu').removeClass('show');
			}

			function hideAllEditTitleForm() {
				var paneHeader = $('#sortable-columns .list').find('.pane-header');

				$(paneHeader).find('a, h2').removeClass('hide');
				$(paneHeader).find('.edit-title-group').addClass('hide');
			}

			function getColumnPosition(id) {
				var pos = 0;
				angular.forEach(scope.columns, function onEachColumn(column) {
					if(column.id === id) {
						pos = column.pos;
					}
				});
				return pos;
			}

			function adjustColumnHeight() {
				var boardArea = $('.board-area').height(),
					navBar = $('.board-area .navbar').height(),
					maxColumnHeight = boardArea - (navBar + 185) ;

				$('.cards').css({'max-height':maxColumnHeight});
				$("[data-scroll='activities']").css({'max-height':maxColumnHeight-30});
			}

			scope.$on('updateSortableAreaWidth', updateSortableAreaWidth);
			scope.$on('hideAllColumnContextMenu', hideAllColumnContextMenu);
			scope.$on('hideAllEditTitleForm', hideAllEditTitleForm);
			scope.$on('adjustColumnHeight', adjustColumnHeight);

			updateSortableAreaWidth();
			adjustColumnHeight();

			$(window).resize(function() {
				adjustColumnHeight();
			});

			$element.sortable({
				handle: '.pane-header',
				placeholder: 'highlight',
				opacity: 0.9,
				start: function onStart(event, ui) { //Mousedown
					$('.highlight', $element).css({
						height: $(ui.item).height()
					})
					ui.item.toggleClass("highlight");

					hideAllColumnContextMenu();
					hideAllEditTitleForm();
					
					$element.find('.create-column-action').hide();
				},
				stop: function onStop(event, ui) { //Mouseupdate
					ui.item.toggleClass("highlight");
					$element.find('.create-column-action').show();
				},
				change: function onOver(event, ui) {},
				update: function onUpdate(event, ui) { //Update within the same sortable
					scope.$apply();
					var $target = $(ui.item);

					if(typeof scope.updatePosition === 'function') {
						
						var $prev = $target.prev();
						var $next = $target.next();
						var $last = $target.siblings(".list:last"); // In case moving to the last, needed the last element

						var prevPos =  +getColumnPosition( $prev.attr("data-id") );
						var nextPos =  +getColumnPosition( $next.attr("data-id") );
						var lastPos = +getColumnPosition( $last.attr("data-id") );

						var prevVal = ($prev.length && prevPos) || 0;
						var nextVal = ($next.length && nextPos) || (lastPos + CONFIG.COLUMN_POSITION_INTERVAL);
						var newPos = Math.ceil((prevVal + nextVal) / 2);

						scope.updatePosition($target.attr("data-id"), newPos);
					}
				}
			});
		}
	}
}]);