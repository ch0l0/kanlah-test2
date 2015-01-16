app.factory("ColumnService", ['$resource', function($resource) {

	//http://docs.angularjs.org/api/ngResource.$resource
	var Column = $resource('/column/:id/:action', {id:'@id',action:'@action'}, {
		'update': { method:'PUT' },
		'get': { method:'GET' },
		'subscribe': { method:'POST' },
		'unsubscribe': { method:'DELETE' }
	});

	return {
		get: function onGet(id) {
			return Column.get({id:id}).$promise;
		},

		create: function onCreate(params) {
			return new Column(params).$save();
		},

		update: function onUpdate(id, params) {
			return new Column(params).$update({id:id});
		},

		delete: function onRemove(id) {
			return new Column.delete({id:id}).$promise;
		},

		subscribe: function onSubscribe(id) {
			return Column.subscribe({id:id,action:"subscribe"}).$promise;
		},

		unsubscribe: function onUnSubscribe(id) {
			return Column.unsubscribe({id:id,action:"subscribe"}).$promise;
		}

	};
}]);