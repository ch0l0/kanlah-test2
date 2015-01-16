app.factory('LoginSessionModel', [function() {
	var model = function(data) {
		return {
			id: 		data.id,
			sessionId: 	data.sessionId,
			email: 		data.email
		}
	};
	return model;
}]);