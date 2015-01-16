app.factory("LabelService", ['$resource', function($resource) {

	//http://docs.angularjs.org/api/ngResource.$resource
	var Label = $resource('/label/:id', {id:'@id'},{
		'update': { method:'PUT' },
		'get': { method:'GET' }
	});

	return {
		get: function onGet(id) {
			return Label.get({id:id}).$promise;
		},

		create: function onCreate(params) {
			return new Label(params).$save();
		},

		update: function onUpdate(id, params) {
			return new Label(params).$update({id:id});
		},

		delete: function onRemove(id) {
			return new Label.delete({id:id}).$promise;
		}
	};
}]);