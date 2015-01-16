app.controller('UpdateCardCtrl', ['$scope', '$rootScope', '$modalInstance', 'data', '$dialogs', '$filter', '$upload', '$timeout', 'SessionStorageService', 'CONFIG', 'CardService', 'growl', 
	function($scope, $rootScope, $modalInstance, data, $dialogs, $filter, $upload, $timeout, SessionStorageService, CONFIG, CardService, growl) {

	$scope.config = CONFIG;
	$scope.Util = Util;
	$scope.userInfo = data.userInfo;
	$scope.card = data.cardInfo;
	$scope.card.dueDate = $filter('date')($scope.card.dueDate, 'yyyy/MM/dd HH:mm');
	$scope.projLabels = data.projLabels;
	$scope.boardMembers = filterBoardMembers(data.members, $scope.card.assignedUsers);

	delete $scope.card.columnId;
	delete $scope.card.boardId;

	var originalCard = angular.extend({}, $scope.card);

	$scope.editName = false;
	$scope.editDesc = false;

	$scope.save = function onSave() {
		CardService
			.update($scope.card.id, $scope.card)
			.then(function onUpdate(resp) {
				growl.addSuccessMessage("Card has been updated.");
				$scope.showEditName(false);
				$scope.showEditDesc(false);
				$rootScope.$broadcast("card:updated", resp.data);
				originalCard = angular.extend({}, $scope.card, resp.data);
			});
	}

	$scope.deleteCard = function onDelete() {
		function remove() {
			CardService
				.delete($scope.card.id)
				.then(function onDelete(resp) {

					// TODO: Alternative for $rootScope???
					growl.addSuccessMessage("Card has been deleted.");
					$rootScope.$broadcast("card:deleted", resp.data);
					$modalInstance.dismiss('canceled');
				});
		}

		confirmDialog = $dialogs
			.confirm(CONFIG.APP_NAME,'Are you sure you want to delete this card?')
			.result.then(function(btn){
				if(btn === "yes") {
					remove()
				}
			});
	}

	$scope.saveDueDate = function onSaveDueDate(dueDate) {
		$scope.card.dueDate = dueDate;
		$scope.save();
	}

	$scope.removeDueDate = function onRemoveDueDate() {
		$scope.card.dueDate = null;
		$scope.save();
	}

	$scope.subcribeToCard = function onSubcribeToCard() {
		CardService
			.subscribe($scope.card.id)
			.then(function onSuccess() {
				growl.addSuccessMessage("You are now subscribed to this card and will start receiving notification for any updates for this card.");
				$rootScope.$broadcast("card:updated", angular.extend($scope.card, {subscribed:true}));
			});
	}

	$scope.unSubcribeToCard = function onUnSubscribeToCard() {
		CardService
			.unsubscribe($scope.card.id)
			.then(function onSuccess() {
				growl.addSuccessMessage("You are now unsubscribed to this card.");
				$rootScope.$broadcast("card:updated", angular.extend($scope.card, {subscribed:false}));
			});
	}

	$scope.assignLabel = function onAsssignLabel(labelId) {
		CardService
			.assignLabel($scope.card.id, {labelId:labelId})
			.then(function onAssignLabel(resp) {
				if(resp.success){
					growl.addSuccessMessage("Successfully assigned label to this card.");
					$rootScope.$broadcast("card:updated", angular.extend($scope.card, {labels:[resp.data]}));
				}
			});
	}

	$scope.unassignLabel = function onUnAssignLabel(labelId) {
		CardService
			.unassignLabel($scope.card.id, {labelId:labelId})
			.then(function onUnAssignLabel(resp) {
				if(resp.success){
					growl.addSuccessMessage("Successfully un-assigned label from this card.");
					$scope.card.labels = resp.data.length != null ? resp.data : [resp.data];
					$rootScope.$broadcast("card:updated", $scope.card);
				}
			});
	}
	

	$scope.showEditName = function onShowEditName(show, cancelled) {
		$scope.editName = show;
		if(!show && cancelled) {
			$scope.card.name = originalCard.name;
		}
	}

	$scope.showEditDesc = function onShowEditDesc(show, cancelled) {
		$scope.editDesc = show;
		if(!show && cancelled) {
			$scope.card.desc = originalCard.desc;
		}
	}

	$scope.cancel = function onCancel(){
		$modalInstance.dismiss('canceled');
	};

	function filterBoardMembers(members, assignedUsers) {
		var boardMembers = [];
		angular.forEach(members, function(bm) {
			bm.id = bm.userId;
			var match = assignedUsers.matchWithIndex("id",bm.id);
			if(bm.boardRole || match){
				bm.assigned = match.value ? true : false;
				boardMembers.push(bm);
			}
		});
		return boardMembers;
	}

	/*Upload Attachements*/
	$scope.progress = new Array();
	$scope.addAttachment = function onAddAttachment($files){
		if($files.length ===  0) return;
		$scope.hideProgress = false;

		var progress = $scope.progress[0] = {};
		progress.percentage = 0;
		progress.text = "";

		$.each($files, function(index, file){
			//Workaround for OptimisticLocking issue on db
			//TODO : Better solutions?
			var interval = 300 * (1+index);
			$timeout(function(){
				CardService.addAttachment($scope.userInfo, $scope.card.id, file)
				.then(function(response) {
					var resp = response.data;
					if(resp.success){
						$timeout(function(){
							progress.text = "Uploaded successfully!";
							$scope.card.attachments.push(resp.data);
							$rootScope.$broadcast("card:updated", $scope.card);
						}, 1500);
					}else{
						progress.text = "Uploaded failed.";
					}
				}, function() {
					progress.text = "Uploaded failed.";
				}, function(evt) {
					progress.percentage = parseInt(100.0 * evt.loaded / evt.total);
					if(progress.percentage <= 99) progress.text = progress.percentage + "%";
				});
			}, interval);
		});
	}

	$scope.deleteAttachment = function onDeleteAttachment(id){

		function remove(){
			CardService.deleteAttachment($scope.card.id, {fileId: id})
			.then(function(response) {
				var resp = response.data;
				if(response.success){
					$scope.card.attachments.findAndRemove("id",id);
					$rootScope.$broadcast("card:updated", $scope.card);
					$scope.selectedFiles = [];
					$scope.hideProgress = true;
				}
			});
		}

		confirmDialog = $dialogs
			.confirm(CONFIG.APP_NAME,'Are you sure you want to delete this attachment?')
			.result.then(function(btn){
				if(btn === "yes") {
					remove();
				}
			});
	}
 }]);
