app.controller('ProfileCtrl', ['$scope', '$rootScope', '$timeout', '$upload', '$dialogs', '$location', 'CONFIG', 'SessionStorageService', 'UserService', 'user', 'growl', 
	function($scope, $rootScope, $timeout, $upload, $dialogs, $location, CONFIG, SessionStorageService, UserService, user, growl) {

	$scope.detailsOn = true;
	$scope.emailOn = false;
	$scope.passwordOn = false;
	$scope.systemParams = CONFIG.SYS_PARAMS;
	var userInfo = SessionStorageService.getUserInfo();

	var mode = {VIEW:"VIEW", EDIT:"EDIT", ERROR:"ERROR"};
	$scope.mode = mode.ERROR;
	$scope.progress = new Array();

	if(user.success){
		$scope.profile = user.data;
		$scope.mode = mode.VIEW;
		if(SessionStorageService.getUserInfo().id == $scope.profile.id){
			$scope.mode = mode.EDIT;
		}
	}else{
		showNotificationMessage({
			success: false,
			message: user.message,
			show: true
		});
	}

	$scope.fileUpload = function onFileUpload($files){
		if($files.length ===  0) return;

		var index=0, file = $files[index];
		$scope.progress[index] = {
			percentage: 0,
			text:""
		};

		$upload.upload({
			url : 'user/{0}/saveAvatar'.format($scope.profile.id),
			method: 'POST',
			headers: {userId: userInfo.id, sessionId: userInfo.sessionId},
			data : {
				id : $scope.profile.id,
				filename: file.name,
				useDefault: false
			},
			file: file,
			fileFormDataName: 'filedata'
		}).then(function(response) {
			var resp = response.data;
			if(resp.success){
				$timeout(function(){
					$scope.profile.avatar = userInfo.avatar = resp.data.avatar;
					$scope.profile.useAvatar = userInfo.useAvatar = true;
					SessionStorageService.setUserInfo(userInfo);
					$scope.progress[index].text = "Uploaded successfully!";
					$rootScope.$broadcast("userInfo:updated", resp.data);
				}, 1500);
			}else{
				$scope.progress[index].text = "Uploaded failed.";
			}
		}, function() {
			$scope.progress[index].text = "Uploaded failed.";
		}, function(evt) {
			$scope.progress[index].percentage = parseInt(100.0 * evt.loaded / evt.total);
			if($scope.progress[index].percentage <= 99)
				$scope.progress[index].text = $scope.progress[index].percentage + "%";
		});
	}

	$scope.updateDetails = function onUpdateDetails() {

		// Update full name and initials
		UserService
			.update($scope.profile.id, {
				fullname : $scope.profile.fullname,
				initials : $scope.profile.initials
			})
			.then(function(response) {

				if(response.success){
					userInfo.fullname = $scope.profile.fullname;
					userInfo.initials = $scope.profile.initials;
					SessionStorageService.setUserInfo(userInfo);
					$rootScope.$broadcast("userInfo:updated", userInfo);
				}

				// Show message
				showNotificationMessage({
					success: response.success,
					message: response.message,
					show: true
				});
		});
	}

	$scope.changeEmail = function onChangeEmail(){

		// Update email address, then signout
		UserService
			.changeEmail($scope.profile.id, {
				newemail : $scope.profile.newemail
			})
			.then(function(response){
				if(response.success) signout(response);
				else {
					showNotificationMessage({
						success: response.success,
						message: response.message,
						show: true
					});
				}
			});
	}

	$scope.changePassword = function onChangePassword(){

		if($scope.profile.newpassword != $scope.profile.confirmpassword) {
			showNotificationMessage({
				success: false,
				message: "New passwords do not match. Please enter again.",
				show: true
			});
			return;
		}

		// Update password, then signout
		UserService
			.changePassword($scope.profile.id, {
				oldpassword : $scope.profile.oldpassword,
				newpassword : $scope.profile.newpassword,
				confirmpassword : $scope.profile.confirmpassword
			})
			.then(function(response){
				if(response.success) signout(response);
				else {
					showNotificationMessage({
						success: response.success,
						message: response.message,
						show: true
					});
				}
			});
	}

	$scope.toggleTab = function onToggleTab(which) {
		$scope.detailsOn = false;
		$scope.emailOn = false;
		$scope.passwordOn = false;

		if(which == 'details') {
			$scope.detailsOn = true;
		} else if(which == 'email') {
			$scope.emailOn = true;
		} else if(which == 'password') {
			$scope.passwordOn = true;
		}

		// Ugly fix to reset form when switching tabs
		$('form:not(:first)').each(function(i, form) {
			$(form).parsley().reset();
			$('input',form).each(function(y, input) {
				$(input).val("");
			});
		});
	}

	function signout(resp) {
		if(resp.success) {
			dialog = $dialogs
				.notify(CONFIG.APP_NAME,'Update successful. The system will log you out for the changes to take effect.')
				.result.then(function() {
					$location.path("signout");
				});
		} else {
			growl.addSuccessMessage(resp.message);
		}
	}

	function showNotificationMessage(params) {
		//console.log(params.success);
		if(params.success) {
			growl.addSuccessMessage(params.message);
		} else {
			growl.addErrorMessage(params.message);
		}
	}

	$scope.$on('$viewContentLoaded', function() {
		$timeout(function(){
			$scope.profile.oldpassword = "";
		}, 250);
	});
}]);