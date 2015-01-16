app.factory("AuthenticationService", ['$resource', 'SessionStorageService', 'CONFIG', function($resource, SessionStorageService, CONFIG) {

	var Authentication = $resource('/authenticate/:action', 
			{action:'@action'},{
			signin: {method:'POST', params:{action:"signin"}},
			signout: {method:'POST', params:{action:"signout"}},
		});
	return {
		signin: function onSignIn(account) {
			var auth = new Authentication(account);
			return auth.$signin();
		},
		signout: function onSignOut(account, sessionId) {
			$.extend(account, {sessionId: sessionId});
			var auth = new Authentication(account);
			return auth.$signout();
		},
		isLoggedIn: function onIsLoggedIn() {
			return SessionStorageService.getUserInfo();
		}
	};
}]);