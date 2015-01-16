app.factory("ActivityService", ['$resource', function($resource) {

	var Activity = $resource('/board/:id', {id:'@id'}, {
	});

	return {
		get: function onGet(id) {
			return Activity.get({id:id}).$promise;
		}
	};
}]);