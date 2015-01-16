app.factory("MemberService", ['$resource', function($resource) {

	//http://docs.angularjs.org/api/ngResource.$resource

	var Member = $resource('/member/:action',
			{action:'@action'});

	return {

		create: function onCreate(credentials) {
			var member = new Member(credentials);
			return member.$save({action:"create"});
		},

		invite: function onInvite(credentials) {
			var member = new Member(credentials);
			return member.$save({action:"invite"});
		},

		reInvite: function onReInvite(credentials) {
			var member = new Member(credentials);
			return member.$save({action:"reInvite"});
		},

		accept: function onInvite(accountId) {
			var member = new Member({accountId:accountId});
			return member.$save({action:"accept"});
		},

		decline: function onRemove(params) {
			var member = new Member(params);
			return member.$save({action:"decline"});
		},

		delete: function onRemove(params) {
			var member = new Member(params);
			return member.$save({action:"delete"});
		},

		setRole: function onSetRole(params) {
			var member = new Member(params);
			return member.$save({action:"role"});
		},
		get: function onGet(params) {
			var member = new Member(params);
			return member.$save({action:"get"});
		}
	};
}]);

