app.factory('UserInfoModel', [function() {
	var model = function(data) {
		return {
			id: 		data.id,
			sessionId: 	data.sessionId,
			email: 		data.email,
			userName: 	data.username,
			fullname: 	data.fullname,
			fbId: 		data.fbId,
			avatar: 	data.avatar,
			useAvatar: data.useAvatar
		}
	};
	return model;
}]);