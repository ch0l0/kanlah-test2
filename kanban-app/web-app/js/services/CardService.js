app.factory("CardService", ['$resource', '$upload', function($resource, $upload) {

	//http://docs.angularjs.org/api/ngResource.$resource
	var Card = $resource('/card/:id/:action', {id:'@id',action:'@action'},{
		'update': { method:'PUT' },
		'get': { method:'GET' },
		'subscribe': { method:'POST', params: {action:'subscribe'} },
		'unsubscribe': { method:'DELETE', params: {action:'subscribe'} },
		'assignMember': { method:'POST', params: {action:'member'} },
		'unAssignMember': { method:'PUT', params: {action:'member'} },
		'deleteAttachment': { method:'POST', params: {action:'attachment'} },
		'putLabel': { method:'PUT', params: {action:'label'} },
		'removeLabel': { method:'POST', params: {action:'label'} }
	});

	return {
		get: function onGet(id) {
			return Card.get({id:id}).$promise;
		},

		create: function onCreate(params) {
			return new Card(params).$save();
		},

		update: function onUpdate(id, params) {
			return new Card(params).$update({id:id});
		},

		delete: function onRemove(id) {
			return new Card.delete({id:id}).$promise;
		},

		subscribe: function onSubscribe(id) {
			return Card.subscribe({id:id}).$promise;
		},

		unsubscribe: function onUnSubscribe(id) {
			return Card.unsubscribe({id:id}).$promise;
		},

		assignLabel: function onAssignLabel(id, params) {
			return new Card(params).$putLabel({id:id});
		},

		unassignLabel: function onUnAssignLabel(id, params) {
			return new Card(params).$removeLabel({id:id});
		},

		assignMember: function onAssignMember(id, params) {
			return new Card(params).$assignMember({id:id});
		},

		unAssignMember: function onUnAssignMember(id, params) {
			return new Card(params).$unAssignMember({id:id});
		},
		addAttachment: function onAddAttachment(userInfo, id, file){
			return $upload.upload({
				url : 'card/{0}/attachment/{1}'.format(id,userInfo.id),
				method: 'POST',
				headers: {userId: userInfo.id, sessionId: userInfo.sessionId},
				data : {
					filename: file.name
				},
				file: file,
				fileFormDataName: 'filedata'
			});
		},
		deleteAttachment: function onDeleteAttachment(id, params){
			return new Card(params).$deleteAttachment({id:id});
		}

	};
}]);