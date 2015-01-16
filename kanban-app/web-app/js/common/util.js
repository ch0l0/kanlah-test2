var Util = Util || {};

String.prototype.encodeAsHTML = function(){
	return $('<div/>').text(this).html();
}

String.prototype.decodeAsHTML = function(){
	return $('<div />').html(this).text();
}

String.prototype.toPascalCase = function() { 
	return this.replace(/(\w)(\w*)/g,function(g0,g1,g2){return g1.toUpperCase() + g2.toLowerCase();});
}

String.prototype.format = function() {
	var formatted = this;
	for (arg in arguments) {
		formatted = formatted.replace("{" + arg + "}", arguments[arg]);
	}
	return formatted;
};

String.prototype.replaceAll = function (find, replace) {
	var str = this;
	return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};

Number.prototype.toBytes = function(){
	return this * 1048576;
}

Array.prototype.match = function(name, val){
	var match = false;
	this.forEach(function(obj, i){
		if(obj[name] == val)
			match = obj;
	});
	return match;
};

Array.prototype.matchWithIndex = function(name, val){
	var match = false;
	this.forEach(function(obj, i){
		if(obj[name] == val)
			match = {value: obj, index: i};
	});
	return match;
};

Array.prototype.findAndSet = function(findName, findVal, setName, setValue){
	this.forEach(function(obj, i){
		if(obj[findName] == findVal){
			obj[setName] = setValue;
			return;
		}
	});
	return this;
};

Array.prototype.findAndRemove = function(findName, findVal) {
	var arr = this;
	$.each(arr, function(i, j) {
		if(j && j[findName] == findVal) {
			arr.splice(i, 1);
		}
	});
	return this;
}

//Custom utility class
Util = {
	isImage: function(file) {
		if(!file) {
			return false;
		}
		return (/\.(gif|jpg|jpeg|tiff|png)$/i).test(file.name);
	},
	getBowserType: function() {
		var result = {}, offset = 0;
		if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
			result.version = RegExp.$1;
			result.browser="FireFox";
		}
		else if (/Trident\/([0-9]{1,}[\.0-9]{0,});/.test(navigator.userAgent)) {
			result.version = RegExp.$1;
			result.browser="IE";
		}
		else if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
			result.version = RegExp.$1;
			result.browser="IE";
		}
		else if (/Chrome[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
			result.version = RegExp.$1;
			result.browser="Chrome";
		}
		else if (/Opera[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
			result.version = RegExp.$1;
			result.browser="Opera";
		}
		else if (/Safari[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
			result.version = RegExp.$1;
			result.browser="Safari";
		}
		return result;
	}
};
