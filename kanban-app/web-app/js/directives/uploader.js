app.directive('ngFileSelect', ['$parse', '$http', '$timeout','CONFIG', function($parse, $http, $timeout, CONFIG) {
	return {
		template: '<div class="selected-file" ng-repeat="f in selectedFiles"><span><img ng-show="fileUrls[$index]" ng-src="{{fileUrls[$index]}}"></span><span class="progress"><div ng-show="progress[$index].percentage > 0" style="width:{{progress[$index].percentage}}%">{{progress[$index].text}}</div></span></div><button id="btnUpload" class="btn btn-primary btn-small" type="button">{{buttonText}}</button><input id="fileUpload" class="none" type="file">',
		link: function(scope, element, attr) {
			var $element = $(element[0]),
				$button = $element.find("#btnUpload"),
				$uploader = $element.find("#fileUpload"),
				fn = $parse(attr['ngFileSelect']),
				systemParams = CONFIG.SYS_PARAMS;

				$button.hide();
				scope.fileUrls = [];
				scope.selectedFiles;

			function init(){
				if(attr.triggeredByElement){
					$button = $(attr.triggeredByElement);
				}else{
					scope.buttonText = attr.triggeredByButton;
					$button.show();
				}

				if(attr.multiple) $uploader.attr("multiple", "multiple");

				$uploader.on('change', function(evt) {
					var files = [], fileList, i;
					fileList = evt.target.files;
					scope.selectedFiles = fileList;
					if (fileList != null) {
						for (i = 0; i < fileList.length; i++) {
							var f = fileList.item(i);
							if(validateExtension(attr.fileType, f.name)){
								if(validateFileSize(attr.maxSize, f.size)){	//maxSize in MB
									files.push(f);
									setPreview(files, i);
								}else{
									alert("Exceeds maximum size {0} MB".format(attr.maxSize));
								}
							}else{
								scope.selectedFiles = [];
								alert("Invalid file type");
							}
						}
					}
					$timeout(function() {
						fn(scope, {
							$files : files,
							$event : evt
						});
					});
				});
				$button.on('click', function(e){
					$uploader.click();
				});

				$uploader.on('click', function(){
					this.value = null;
				});

				scope.$watch("hideProgress", function(val,n){
					if(val) scope.selectedFiles = [];
				});
			}

			function setPreview(files, i){
				var fileReader = new FileReader();
				fileReader.readAsDataURL(files[i]);
				function setPreview(fileReader, index) {
					fileReader.onload = function(e) {
						$timeout(function() {
							scope.fileUrls[index] = e.target.result;
						});
					}
				}
				setPreview(fileReader, i);
			}

			function validateExtension(type, file){
				if(attr.ext === "*") return true;
				var ext = file.split('.').pop().toLowerCase(),
					result = false;
				switch(type.toUpperCase()){
					case "IMAGE":
						result = $.inArray(ext, ["png", "jpg","jpeg","gif","bmp"]) != -1;
						break;
					case "FILE":
						var arrExt = systemParams.allowedFileExtensionsAttachment.replaceAll(".","");
						result = $.inArray(ext, eval("[" + arrExt + "]")) != -1;
						break;
				}
				return result;
			}
			function validateFileSize(maxSize, fileSize){
				return fileSize < parseFloat(maxSize).toBytes();
			}
			$timeout(init, 100);
		}
	};
}]);

app.directive('ngFileDropAvailable', ['$parse', '$http', '$timeout', function($parse, $http, $timeout) {
	return function(scope, elem, attr) {
		if ('draggable' in document.createElement('span')) {
			var fn = $parse(attr['ngFileDropAvailable']);
			$timeout(function() {
				fn(scope);
			});
		}
	};
}]);

app.directive('ngFileDrop', ['$parse', '$http', '$timeout', function($parse, $http, $timeout) {
	return function(scope, elem, attr) {
		if ('draggable' in document.createElement('span')) {
			var cancel = null;
			var fn = $parse(attr['ngFileDrop']);
			elem[0].addEventListener("dragover", function(evt) {
				$timeout.cancel(cancel);
				evt.stopPropagation();
				evt.preventDefault();
				elem.addClass(attr['ngFileDragOverClass'] || "dragover");
			}, false);
			elem[0].addEventListener("dragleave", function(evt) {
				cancel = $timeout(function() {
					elem.removeClass(attr['ngFileDragOverClass'] || "dragover");
				});
			}, false);
			elem[0].addEventListener("drop", function(evt) {
				evt.stopPropagation();
				evt.preventDefault();
				elem.removeClass(attr['ngFileDragOverClass'] || "dragover");
				var files = [], fileList = evt.dataTransfer.files, i;
				if (fileList != null) {
					for (i = 0; i < fileList.length; i++) {
						files.push(fileList.item(i));
					}
				}
				$timeout(function() {
					fn(scope, {
						$files : files,
						$event : evt
					});
				});
			}, false);
		}
	};
}]);