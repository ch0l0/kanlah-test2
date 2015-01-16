app.controller('ViewBoardActivitiesCtrl', ['$scope', '$rootScope', '$filter', '$timeout', '$dialogs', 'CONFIG', 'PagingService', 'BoardService', 'CompanyService', 'CardService', 
	function($scope, $rootScope, $filter, $timeout, $dialogs, CONFIG, PagingService, BoardService, CompanyService, CardService) {

	var TPL_CARD_SETTINGS = 'partials/boards/card-settings.html';

	$scope.loading = false;

	//setup pagination
	$scope.page = 1;
	PagingService
		.setPage($scope.page)
		.setLimit(CONFIG.ACTIVITY_PAGE_LIMIT)
		.setTotal($scope.activityData.total);

	$scope.numberOfPages = PagingService.getNoOfPage();

	$scope.refreshActivities = function onRefreshActivities() {
		if($scope.activities.length > 0){
			var time = $filter("date")(new Date($scope.activities[0].time), "yyyy-MM-ddTHH:mm:ss'Z'");
			BoardService.activitylast($scope.boardInfo.id, {time: $scope.activities[0].time})
			.then(function(response){
				if(response.success){
					$.each(response.data, function(i, data){
						$scope.activities.unshift(data);
					});
					$scope.scrollTo('top');
				}
			});
		} else {
			--$scope.page;
			$scope.loadMore();
		}
	}

	$scope.loadMore = function onLoadMore() {
		PagingService.setPage(++$scope.page);

		$scope.loading = true;

		BoardService.activity($scope.boardInfo.id, {
			offset: PagingService.getOffset(),
			limit: PagingService.getLimit(),
			sort: 'activityDate',
			order: 'desc'
		})
		.then(function(response){
			if(response.success){
				$scope.activities = $scope.activities.concat(response.data);
				$scope.scrollTo('bottom');
			}
		});
	}

	$scope.viewItem = function onViewItem(type, id) {
		if(type !== 'CARD') {
			return;
		}

		CompanyService
			.labels($scope.accountInfo.accountId)
			.then(function onGetLabels(labels) {
				CardService
					.get(id)
					.then(function onGetCard(cardInfo) {
						/*dialog = $dialogs
							.create(TPL_CARD_SETTINGS,'UpdateCardCtrl', {cardInfo: cardInfo.data, projLabels: labels.data, boardMembers: $scope.boardMemberData});*/
						dialog = $dialogs
							.create(TPL_CARD_SETTINGS,'UpdateCardCtrl', {cardInfo: cardInfo.data, projLabels: labels.data, userInfo: $scope.userInfo, members: $scope.members});
					});
			});
	}

	$scope.scrollTo = function onScrollTo(w) {
		$timeout(function() {
			// scroll to bottom
			var el = $('[data-scroll="activities"]').get(0);
			el.scrollTop = (w === 'top') ? 0 : el.scrollHeight;
			$scope.loading = false;
		},250);
	}


	$rootScope.$on("column:added", $scope.refreshActivities);
	$rootScope.$on("newCardCreated", $scope.refreshActivities);
	$rootScope.$on("column:updated", $scope.refreshActivities);
	$rootScope.$on("card:updated", $scope.refreshActivities);

}]);