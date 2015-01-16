app.controller('NewCardCtrl', ['$scope', 'CardService', '$dialogs', 'CONFIG', 'getMaxPos', 'growl', function($scope, CardService, $dialogs, CONFIG, getMaxPos, growl) {

	$scope.card = {
		name: "",
		boardId: $scope.boardInfo.id, //Injected thru ng-repeat
		columnId: $scope.column.id //Injected thru ng-repeat
	};

	$scope.createNewCard = function onCreateNewCard($event) {

		if(!$scope.card.name) {
			dialog = $dialogs.error(CONFIG.APP_NAME, "Invalid card name.");
			return;
		}

		//Get the max position and assign with higher one
		$scope.column.cards = $scope.column.cards || [];
		var maxPos = getMaxPos($scope.column.cards, 'pos');
		var position =  maxPos + CONFIG.CARD_POSITION_INTERVAL;

		CardService
			.create(angular.extend($scope.card, {pos: position}))
			.then(function onSuccess(resp) {
				if(resp.success) {
					$scope.column.cards.push(resp.data);

					// Reset form
					$scope.card.name = "";
					$scope.hideCreateCardForm($event);
					$scope.$emit("newCardCreated");
					growl.addSuccessMessage(resp.message);
				} else {
					console.warn("Someting went wrong in creating card.");
				}
			});
	}

	$scope.cancelCreateCard = function onCancelCreateCard(){
		$scope.card.name='';
	}

}]);