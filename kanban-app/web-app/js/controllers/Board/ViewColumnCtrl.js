app.controller('ViewColumnCtrl', ['$scope', '$rootScope', 'ColumnService', '$dialogs', 'CONFIG', function($scope, $rootScope, ColumnService, $dialogs, CONFIG) {
	$scope.newCard = false;

	var originalColumn  = angular.extend({}, $scope.column);

	$scope.hideCreateCardForm = function onHideCreateCardForm($event) {
		$scope.newCard = !$scope.newCard;
		$event.preventDefault();
	}

	$scope.toggleContextMenu = function onToggleContextMenu($event) {
		var target = $event.target,
			ddMenu = $(target).parents('li').find('.dropdown-menu');

		$('#sortable-columns .list').find('.dropdown-menu').not(ddMenu).removeClass('show');
		$(ddMenu).toggleClass('show');
	}

	$scope.editTitle = function onEditTitle($event) {
		var target = $event.target,
			paneHeader = $(target).parents('.pane-header');

		// $scope.$emit('hideAllColumnContextMenu');
		// $scope.$emit('hideAllEditTitleForm');

		$(paneHeader).find('a, h2').addClass('hide');
		$(paneHeader).find('.edit-title-group').removeClass('hide');

		$('input').focus();
	}

	$scope.cancelEditTitle = function onCancelEditTitle($event) {
		var target = $event.target,
			paneHeader = $(target).parents('.pane-header');

		$(paneHeader).find('a, h2').removeClass('hide');
		$(paneHeader).find('.edit-title-group').addClass('hide');

		$scope.column.title = originalColumn.title;
	}

	$scope.editColumnTitle = function onEditColumnTitle() {

		if(!$scope.column.title) {
			dialog = $dialogs.error(CONFIG.APP_NAME, "Invalid column title.");
			return;
		}

		ColumnService
			.update($scope.column.id, {title: $scope.column.title})
			.then(function onUpdate(resp) {
				originalColumn  = angular.extend({}, resp.data, $scope.column);
				$scope.$emit('hideAllEditTitleForm');
			});
	}

	$scope.contextNewCard = function onContextNewCard($event) {
		$scope.newCard = true;
		$scope.toggleContextMenu($event);
	}
	
	$scope.newCardTrigger = function onNewCard($event) {
		var pane = $($event.target).parents('.pane'),
			 cards = $(pane).find('.cards');

		$scope.newCard = !$scope.newCard;
		$(cards).animate({scrollTop: $(cards).height()}, {
			duration: 500,
			complete: function() {
				$("textarea", pane).focus();
			}
		});
		
	}

	// LISTENER FOR EVENTS
	// TODO: Alternative for $rootScope???
	$rootScope.$on("card:updated", function($event, cardInfo) {
		if(!cardInfo) {
			return;
		}
		$event.preventDefault();
		angular.forEach($scope.column.cards, function onEachCard(card, i) {
			if(card.id === cardInfo.id) {
				$.extend($scope.column.cards[i],cardInfo);
				//$scope.column.cards[i] = cardInfo;
			}
		});
	});

	$rootScope.$on("card:deleted", function($event, id) {
		if(!id) {
			return;
		}
		$event.preventDefault();
		angular.forEach($scope.column.cards, function onEachCard(card, i) {
			if(card.id === id) {
				$scope.column.cards.splice(i,1);
			}
		});
	});

}]);