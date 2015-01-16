app.factory('SystemParamsModel', [function() {
	var model = function(data) {
		return {
			logo: 					data.logo,
			maxBoards: 				data.maxBoards,
			maxCardsPerColumn: 		data.maxCardsPerColumn,
			maxColumns: 			data.maxColumns,
			maxFilesizeAvatar: 		data.maxFilesizeAvatar,
			allowedFileExtensionsAvatar: 	data.allowedFileExtensionsAvatar,
			maxFilesizeCardAttachment: 	data.maxFilesizeCardAttachment,
			allowedFileExtensionsAttachment: 	data.allowedFileExtensionsAttachment,
			maxProjects: 			data.maxProjects,
			name: 					data.name,
			url: 					data.url
		}
	};
	return model;
}]);