app.factory("BoardService", ['$resource', function($resource) {

	//http://docs.angularjs.org/api/ngResource.$resource
	var Board = $resource('/board/:id/:action', {id:'@id',action:'@action'}, {
		'update': { method:'PUT' },
		'settings': {method:'GET', params:{action: "settings"}},
		'expand': {method:'GET', params:{action: "expand"}},
		'activity': {method:'GET', params:{action: "activity"}},
		'activitylast': {method:'POST', params:{action: "activitylast"}}
	});

	return {

		get: function onGet(id) {
			return Board.get({id:id}).$promise;
		},

		create: function onCreate(params) {
			return new Board(params).$save();
		},

		update: function onUpdate(id, params) {
			return new Board(params).$update({id:id});
		},

		delete: function onRemove(id) {
			return new Board.delete({id:id}).$promise;
		},

		settings: function onSettings(id) {
			return new Board.settings({id:id}).$promise;
		},

		expand: function onExpand(id) {
			return new Board.expand({id:id}).$promise;
		},
		activity: function onActivity(id, params) {
			return new Board(params).$activity(angular.extend({}, {id:id}, params));
		},
		activitylast: function onActivityLast(id, params) {
			return new Board(params).$activitylast({id:id});
		}
	};
}]);