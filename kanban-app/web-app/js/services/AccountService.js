app.factory("AccountService", ['$resource', function($resource) {

	//http://docs.angularjs.org/api/ngResource.$resource
	var Account = $resource('/account/:id', {id:'@id'}, {
		'update': { method:'PUT' },
		'get': { method:'GET' }
	}); 

	return {
		get: function onGet(id) {
			var acct = Account.get({id:id});
			return acct.$promise;
		},

		create: function onCreate(account) {
			var acct = new Account(account);
			return acct.$save();
		},

		update: function onUpdate(id, params) {
			var account = Account.get( { id: id });
			angular.extend(account, params);
			account.id = id;
			return account.$update();
		},

		delete: function onRemove(id) {
			var acct = new Account.delete({id:id});
			return acct.$promise;
		}
	};
}]);