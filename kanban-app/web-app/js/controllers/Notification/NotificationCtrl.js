app.controller('NotificationCtrl', ['$scope', '$rootScope', '$filter', '$timeout', 'CONFIG', 'AuthenticationService', 'NotificationService', 'PagingService', 'notifications', 
	function($scope, $rootScope, $filter, $timeout, CONFIG, AuthenticationService, NotificationService, PagingService, notifications) {

	$scope.notifications = notifications.data;
	$scope.page = 1;
	$scope.loading = false;

	//setup pagination
	PagingService
		.setPage($scope.page)
		.setLimit(CONFIG.NOTIFICATION_PAGE_LIMIT)
		.setTotal(notifications.total);

	$scope.numberOfPages = PagingService.getNoOfPage();

	// Load More
	$scope.loadMore = function onLoadMore() {

		$scope.loading = true;

		PagingService.setPage(++$scope.page);

		NotificationService
			.all({
				offset: PagingService.getOffset(),
				limit: PagingService.getLimit(),
				sort: 'createdDate',
				order: 'desc'
			})
			.then(function onPage(resp) {
				$scope.notifications = $scope.notifications.concat(resp.data);
				$rootScope.$broadcast("notification:unread:update", resp.data);
				$scope.loading = false;
			});
	}

	$rootScope.$broadcast("notification:unread:update", notifications.data);

}]);