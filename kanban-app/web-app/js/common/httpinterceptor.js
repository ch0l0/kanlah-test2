app.config(['$httpProvider', function($httpProvider) {
	var alertDisplayed = false;
	$httpProvider.interceptors.push(['$window','$q', 'SessionStorageService', '$location', '$timeout', 'CONFIG', function($window, $q, SessionStorageService, $location, $timeout, CONFIG) {
		return {
			'request': function(config) {
				var userInfo = SessionStorageService.getUserInfo();
				if(config.headers && userInfo){
					config.headers.userId = userInfo.id;
					config.headers.sessionId = userInfo.sessionId;
					config.headers.userBrowser = JSON.stringify(Util.getBowserType());
				}
				return config || $q.when(config);
			},
			'requestError': function(rejection) {
				return $q.reject(rejection);
			},
			'response': function(response) {
				return response || $q.when(response);
			},
			'responseError': function(rejection) {
				var result = { redirect: false }
				if(rejection.status === 401) {
					result.redirect = true;
					result.msg = "Your session has timeout or is invalid . Please login again.";
					result.url = "/signout";
					if(typeof dialog != "undefined"){
						if(dialog && dialog.close) dialog.close();
					}
					$location.path("/signout");
				}else if(rejection.status === 403) {
					result.redirect = true;
					result.msg = rejection.data.message;
					result.url = "/dashboard";
				}
				
				if(result.redirect){
					if(result.msg){
						if(!alertDisplayed){
							alert(result.msg);
							alertDisplayed = true;
							window.setTimeout(function(){alertDisplayed = false;},1000);
						}
					}
					if(typeof dialog != "undefined"){ 
						if(dialog && dialog.close) dialog.close();
					}
					
					if(typeof httpInterceptorCallBack != "undefined" && httpInterceptorCallBack) {
						httpInterceptorCallBack();
						httpInterceptorCallBack = null;
					}

					$location.path(result.url);
				}
				return $q.reject(rejection);
			}
		};
	}]);
}]);