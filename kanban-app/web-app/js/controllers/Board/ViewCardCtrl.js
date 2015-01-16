app.controller('ViewCardCtrl', ['$scope', '$filter', '$dialogs', 'CompanyService', 'BoardMemberService', 'SessionStorageService', 'CONFIG', 
	function($scope, $filter, $dialogs, CompanyService, BoardMemberService, SessionStorageService, CONFIG) {

	var TPL_CARD_SETTINGS = 'partials/boards/card-settings.html';

	$scope.editCard = function onEditCard(accountId, boardId) {

		$scope.$emit('hideAllColumnContextMenu');
		$scope.$emit('hideAllEditTitleForm');

		CompanyService
			.labels(accountId)
			.then(function onGetLabels(labels) {
				/*BoardMemberService
					.get(boardId)
					.then(function onGetBoardMembers(boardMembers) {
						dialog = $dialogs
							.create(TPL_CARD_SETTINGS,'UpdateCardCtrl', {cardInfo: $scope.card, projLabels: labels.data, boardMembers: boardMembers.data});
					});*/
					dialog = $dialogs
						.create(TPL_CARD_SETTINGS,'UpdateCardCtrl', {cardInfo: $scope.card, projLabels: labels.data, userInfo: $scope.userInfo, members: $scope.members});
			});
	}
}]);