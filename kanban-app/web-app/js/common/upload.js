/**!
 * AngularJS file upload/drop directive with http post and progress
 * @author  Danial  <danial.farid@gmail.com>
 * @version <%= pkg.version %>
 */
(function() {
	
app.service('$upload', ['$http', '$rootScope', '$timeout', function($http, $rootScope, $timeout) {
	function sendHttp(config) {
		config.method = config.method || 'POST';
		config.headers = config.headers || {};
		config.transformRequest = config.transformRequest || function(data) {
			if (window.ArrayBuffer && data instanceof ArrayBuffer) {
				return data;
			}
			return $http.defaults.transformRequest[0](data);
		};
		
		if (window.XMLHttpRequest.__isShim) {
			config.headers['__setXHR_'] = function() {
				return function(xhr) {
					config.__XHR = xhr;
					xhr.upload.addEventListener('progress', function(e) {
						if (config.progress) {
							$timeout(function() {
								if(config.progress) config.progress(e);
							});
						}
					}, false);
					//fix for firefox not firing upload progress end, also IE8-9
					xhr.upload.addEventListener('load', function(e) {
						if (e.lengthComputable) {
							$timeout(function() {
								if(config.progress) config.progress(e);
							});
						}
					}, false);
				}	
			};
		}
			
		var promise = $http(config);
		
		promise.progress = function(fn) {
			config.progress = fn;
			return promise;
		};		
		promise.abort = function() {
			if (config.__XHR) {
				$timeout(function() {
					config.__XHR.abort();
				});
			}
			return promise;
		};		
		promise.then = (function(promise, origThen) {
			return function(s, e, p) {
				config.progress = p || config.progress;
				var result = origThen.apply(promise, [s, e, p]);
				result.abort = promise.abort;
				result.progress = promise.progress;
				return result;
			};
		})(promise, promise.then);
		
		return promise;
	};
	this.upload = function(config) {
		config.headers = config.headers || {};
		config.headers['Content-Type'] = undefined;
		config.transformRequest = config.transformRequest || $http.defaults.transformRequest;
		var formData = new FormData();
		if (config.data) {
			for (var key in config.data) {
				var val = config.data[key];
				if (!config.formDataAppender) {
					if (typeof config.transformRequest == 'function') {
						val = config.transformRequest(val);
					} else {
						for (var i = 0; i < config.transformRequest.length; i++) {
							var fn = config.transformRequest[i];
							if (typeof fn == 'function') {
								val = fn(val);
							}
						}
					}
					formData.append(key, val);
				} else {
					config.formDataAppender(formData, key, val);
				}
			}
		}
		config.transformRequest =  angular.identity;
		
		var fileFormName = config.fileFormDataName || 'file';
		
		if (Object.prototype.toString.call(config.file) === '[object Array]') {
			var isFileFormNameString = Object.prototype.toString.call(fileFormName) === '[object String]'; 
			for (var i = 0; i < config.file.length; i++) {
				formData.append(isFileFormNameString ? fileFormName + i : fileFormName[i], config.file[i], config.file[i].name);
			}
		} else {
			formData.append(fileFormName, config.file, config.file.name);
		}
		
		config.data = formData;
		
		return sendHttp(config);
	};
	this.http = function(config) {
		return sendHttp(config);
	}
}]);

})();
