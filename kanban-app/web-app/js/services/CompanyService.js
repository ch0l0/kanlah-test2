app.factory("CompanyService", ['$resource', function($resource) {
	
	var Company = $resource('/company/:id/:action', 
					{id: '@id', action:'@action'}, {
					all: {method:'GET', params:{id:"all"}},
					members: {method:'GET', params:{action: "members"}}, //, cache: true
					boards: {method:'GET', params:{action: "boards"}}, //, cache: true
					labels: {method:'GET', params:{action: "labels"}} //, cache: true
				});

	return {
		all: function onAll() {
			var company = Company.all();
			return company.$promise;
		},
		members: function onMembers(accountId) {
			var company = Company.members({id: accountId});
			return company.$promise;
		},
		boards: function onBoards(accountId) {
			var company = Company.boards({id: accountId});
			return company.$promise;
		},
		labels: function onLabels(accountId) {
			var company = Company.labels({id: accountId});
			return company.$promise;
		}		
	};
}]);