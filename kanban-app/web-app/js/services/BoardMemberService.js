app.factory("BoardMemberService", ['$resource', function($resource) {

	var BoardMember = $resource('/boardmember/:id/:action', {id:'@id', action:'@action'},{
		'update': { method:'PUT' }
	});

	return {
		get: function onGet(id) {
			var bm = new BoardMember.get({id:id});
			return bm.$promise;
		},

		save: function onCreate(id,params) {
			return new BoardMember(params).$save({id:id, action:"save"});
		},

		update: function onCreate(id,params) {
			return new BoardMember(params).$update({id:id});
		},

		delete: function onRemove(id,params) {
			return new BoardMember(params).$save({id:id, action:"delete"});
		}
	};
}]);
