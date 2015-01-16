app.controller('AssignCardMemberCtrl', ['$scope', '$rootScope', 'CardService', 'growl', function($scope, $rootScope, CardService, growl) {

	$scope.search = {};

	$scope.addCardMember = function onAddCardMember(memberId) {
		CardService
			.assignMember($scope.card.id, {memberId:memberId})
			.then(function onAssign(resp) {
				if(resp.success) {
					growl.addSuccessMessage(resp.message);
					$rootScope.$broadcast("card:updated", angular.extend({}, $scope.card, {assignedUsers:resp.data}));
					$scope.$broadcast("refreshMemberList");
				} else {
					growl.addErrorMessage(resp.message);
				}
			});
	}

	$scope.removeCardMember = function onRemoveCardMember(memberId) {
		CardService
			.unAssignMember($scope.card.id, {memberId:memberId})
			.then(function onUnAssign(resp) {
				if(resp.success) {
					growl.addSuccessMessage(resp.message);
					$rootScope.$broadcast("card:updated", angular.extend({}, $scope.card, {assignedUsers:resp.data}));
					$scope.$broadcast("refreshMemberList");
				} else {
					growl.addErrorMessage(resp.message);
				}
			});
	}

}]);
