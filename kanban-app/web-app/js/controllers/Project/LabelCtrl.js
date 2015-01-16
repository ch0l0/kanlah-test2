app.controller('LabelCtrl', ['$scope', '$rootScope', '$timeout', 'CONFIG', '$dialogs', 'LabelService', 'growl', function($scope, $rootScope, $timeout, CONFIG, $dialogs, LabelService, growl) {


	$scope.submitLabel = function(editMode){
		if(editMode)
			$scope.updateLabel();
		else
			$scope.addLabel();
	}

	$scope.addLabel = function() {
		if(!$scope.label || !$scope.color) {
			//$scope.errorMessage = "Please select a color and enter a name for the label.";
			growl.addErrorMessage("Please select a color and enter a name for the label.");
			return;
		}

		var params = {
			name: $scope.label,
			color: $scope.color,
			userId: $scope.project.userId,
			accountId: $scope.project.accountId
		};

		LabelService
			.create(params)
			.then(function onSuccess(resp) {
				if (!resp.success) {
					$scope.errorMessage = resp.message;
				}
				else {
					growl.addSuccessMessage(resp.message);
					$scope.labels.push(resp.data)
					$rootScope.$broadcast("labels:updated", $scope.labels);
					$scope.reset();
				}
			});
	}

	$scope.displayLabel = function(label) {
		$scope.editMode = true;
		$scope.label = label.name;
		$scope.color = label.color;
		$scope.id = label.id;
		$("[name='label']").focus();
		deselectLabel();
	}

	$timeout(function(){
		$scope.colorSelector = function(index,color){
			$scope.color = color;
			$scope.colorIndex = index;
			deselectLabel();
			$("[name='label']").focus();
			$('label .check-'+index).css('opacity','1');
		};
	},200);
	
	$scope.updateLabel = function(id) {

		if(!$scope.label || !$scope.color) {
			//$scope.errorMessage = "Please select a color and enter a name for the label.";
			growl.addErrorMessage("Please select a color and enter a name for the label.");
			return;
		}

		var params = {
			//id: $scope.id,
			name: $scope.label,
			color: $scope.color,
			//userId: $rootScope.userInfo.id,
			//companyId: $rootScope.companyInfo.id
		};

		LabelService
			.update($scope.id, params)
			.then(function onSuccess(resp) {
				if (!resp.success) {
					$scope.errorMessage = resp.message;
				} else {
					for(var i=$scope.labels.length-1; i>=0; i--) {
						if ($scope.labels[i].id == $scope.id) {
							$scope.labels[i] = resp.data;
							break;
						}
					}
					growl.addSuccessMessage(resp.message);
					$rootScope.$broadcast("labels:updated", $scope.labels);
					$scope.reset();
				}
			});
	}
	
	$scope.reset = function() {
		$scope.editMode = false;
		$scope.label = "";
		$scope.color = "";
		$(".clr-opt").removeClass('active');
		$('label .check-'+$scope.colorIndex).css('opacity','0');		
	}

	$scope.deleteLabel = function(id) {

		function remove() {
			LabelService
				.delete(id)
				.then(function onSuccess(resp) {
					if (!resp.success) {
						//$scope.errorMessage = resp.message;
						growl.addErrorMessage(resp.message);
					} else {
						for(var i=$scope.labels.length-1; i>=0; i--) {
							if ($scope.labels[i].id == id) {
								$scope.labels.splice(i,1);
								break;
							}
						}
						growl.addSuccessMessage(resp.message);
						$rootScope.$broadcast("labels:updated", $scope.labels);
						$scope.reset();
					}
				});
		}

		confirmDialog = $dialogs
			.confirm(CONFIG.APP_NAME,'Deleting this label will also remove all the the label assigned to this card. Would you like to continue?')
			.result.then(function(btn){
				if(btn === "yes") {
					remove()
				}
			});
	}

	$scope.cancelEdit = function(){
		$scope.reset();
		$scope.editMode=false;
	}

	function deselectLabel(){
		for(var i in $scope.colors){
			$('label .check-'+i).css('opacity','0');
		}
	}
}]);

