app.controller('HeaderCtrl', ['$rootScope', '$scope', '$timeout', 'CONFIG', 'AuthenticationService', 'NotificationService', function($rootScope, $scope, $timeout, CONFIG, AuthenticationService, NotificationService) {

	$scope.$on('header.authenticated', function(scope, data) {
		$scope.userInfo = data;
	});

	$rootScope.$on("userInfo:updated", function(events, userInfo) {
		$scope.getUnreadCount();
		$scope.userInfo = userInfo;
	});

	$scope.getUnreadCount = function onGetUnreadCount() {
		if(AuthenticationService.isLoggedIn()){
			NotificationService
				.getUnreadCount()
				.then(function onGet(resp) {
					$scope.unReadCount = resp.data;
					$timeout($scope.getUnreadCount, CONFIG.POLL_NOTIFICATION_UNREAD_COUNT);
					
				});
		}
	}

	$scope.getNewNotifications = function onGet() {

		NotificationService.all({
				offset: 0,
				limit: CONFIG.NOTIFICATION_POPOVER_LIMIT,
				sort: 'createdDate',
				order: 'desc'
			})
			.then(function(resp) {
				$scope.notifications = resp.data;
				if($scope.notifications.length) {
					$scope.setAsRead(resp.data);
				}
				
			});
	}

	$scope.setAsRead = function onSetAsRead(notifications) {
		var notificationIds = [];
		angular.forEach(notifications, function onEachNotification(notification) {
			if(notification.status === "NEW") {
				//console.log(notification.id);
				notificationIds.push(notification.id);
			}
		});

		NotificationService
			.setAsRead({ids:notificationIds})
			.then(function onSetRead() {
				$scope.unReadCount -= notificationIds.length;
			});
	}

	$rootScope.$on("notification:unread:update", function onUnread(event, notifications) {
		$scope.setAsRead(notifications);
	});

	if(AuthenticationService.isLoggedIn()) {
		$scope.getUnreadCount();
	}

}]);