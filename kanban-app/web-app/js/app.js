var app = angular.module('app', ['ngRoute', 'ngResource', 'ngSanitize', 'ui.bootstrap', 'dialogs', 'angular-growl', 'ngUtil']);

app.run(function() {

});

app.config(['growlProvider', function(growlProvider) {
	growlProvider.globalTimeToLive(5000);
}]);


