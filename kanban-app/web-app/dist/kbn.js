/* Kanlah is a project which was started by Leo Tech Services Pte Ltd but is now an open source project covered by a Creative Commons Non-commercial, Attribution, Share-alike license.
*  Find out more at http://www.GitHub.com/Kanlah.
*/
angular
.module('ngUtil', [])
	.factory('throttle', ['$timeout', function ($timeout) {
		return function (delay, no_trailing, callback, debounce_mode) {
			var timeout_id,
			last_exec = 0;
			
			if (typeof no_trailing !== 'boolean') {
				debounce_mode = callback;
				callback = no_trailing;
				no_trailing = undefined;
			}
			
			var wrapper = function () {
				var that = this,
						elapsed = +new Date() - last_exec,
						args = arguments,
						exec = function () {
							last_exec = +new Date();
							callback.apply(that, args);
						},
						clear = function () {
							timeout_id = undefined;
						};

				if (debounce_mode && !timeout_id) { exec(); }
				if (timeout_id) { $timeout.cancel(timeout_id); }
				if (debounce_mode === undefined && elapsed > delay) {
					exec();
				} else if (no_trailing !== true) {
					timeout_id = $timeout(debounce_mode ? clear : exec, debounce_mode === undefined ? delay - elapsed : delay);
				}
			};
			return wrapper;
		};
	}])
	.factory('getMaxPos', [function() {
		return function (arr, attr) {
			var max = 0;
			if(!attr) attr = 'pos';
			angular.forEach(arr, function onEach(item) {
				if(!item[attr]) {
					return;
				}
				if(+item[attr] > max) {
					max = +item[attr];
				}
			});
			return max;
		};
	}]);;(function() {

if (window.XMLHttpRequest) {
	if (window.FormData) {
		// allow access to Angular XHR private field: https://github.com/angular/angular.js/issues/1934
		window.XMLHttpRequest = (function(origXHR) {
			return function() {
				var xhr = new origXHR();
				xhr.setRequestHeader = (function(orig) {
					return function(header, value) {
						if (header === '__setXHR_') {
							var val = value(xhr);
							// fix for angular < 1.2.0
							if (val instanceof Function) {
								val(xhr);
							}
						} else {
							orig.apply(xhr, arguments);
						}
					}
				})(xhr.setRequestHeader);
				return xhr;
			}
		})(window.XMLHttpRequest);
	} else {
		var hasFlash = false;
		try {
		  var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
		  if (fo) hasFlash = true;
		} catch(e) {
		  if (navigator.mimeTypes["application/x-shockwave-flash"] != undefined) hasFlash = true;
		}
		window.XMLHttpRequest = (function(origXHR) {
			return function() {
				var xhr = new origXHR();
				var origSend = xhr.send;
				xhr.__requestHeaders = [];
				xhr.open = (function(orig) {
					if (!xhr.upload) xhr.upload = {};
					xhr.upload.addEventListener = function(t, fn, b) {
						if (t === 'progress') {
							xhr.__progress = fn;
						}
						if (t === 'load') {
							xhr.__load = fn;
						}
					};
					return function(m, url, b) {
						orig.apply(xhr, [m, url, b]);
						xhr.__url = url;
					}
				})(xhr.open);
				xhr.getResponseHeader = (function(orig) {
					return function(h) {
						return xhr.__fileApiXHR ? xhr.__fileApiXHR.getResponseHeader(h) : orig.apply(xhr, [h]);
					}
				})(xhr.getResponseHeader);
				xhr.getAllResponseHeaders = (function(orig) {
					return function() {
						return xhr.__fileApiXHR ? xhr.__fileApiXHR.getAllResponseHeaders() : orig.apply(xhr);
					}
				})(xhr.getAllResponseHeaders);
				xhr.abort = (function(orig) {
					return function() {
						return xhr.__fileApiXHR ? xhr.__fileApiXHR.abort() : (orig == null ? null : orig.apply(xhr));
					}
				})(xhr.abort);
				xhr.setRequestHeader = (function(orig) {
					return function(header, value) {
						if (header === '__setXHR_') {
							var val = value(xhr);
							// fix for angular < 1.2.0
							if (val instanceof Function) {
								val(xhr);
							}
						} else {
							orig.apply(xhr, arguments);
						}
					}
				})(xhr.setRequestHeader);

				xhr.send = function() {
					if (arguments[0] && arguments[0].__isShim) {
						var formData = arguments[0];
						var config = {
							url: xhr.__url,
							complete: function(err, fileApiXHR) {
								if (!err) xhr.__load({type: 'load', loaded: xhr.__total, total: xhr.__total, target: xhr, lengthComputable: true});
								if (fileApiXHR.status !== undefined) Object.defineProperty(xhr, 'status', {get: function() {return fileApiXHR.status}});
								if (fileApiXHR.statusText !== undefined) Object.defineProperty(xhr, 'statusText', {get: function() {return fileApiXHR.statusText}});
								Object.defineProperty(xhr, 'readyState', {get: function() {return 4}});
								if (fileApiXHR.response !== undefined) Object.defineProperty(xhr, 'response', {get: function() {return fileApiXHR.response}});
								Object.defineProperty(xhr, 'responseText', {get: function() {return fileApiXHR.responseText}});
								xhr.__fileApiXHR = fileApiXHR;
								xhr.onreadystatechange();
							},
							progress: function(e) {
								e.target = xhr;
								xhr.__progress(e);
								xhr.__total = e.total;
							},
							headers: xhr.__requestHeaders
						}
						config.data = {};
						config.files = {}
						for (var i = 0; i < formData.data.length; i++) {
							var item = formData.data[i];
							if (item.val != null && item.val.name != null && item.val.size != null && item.val.type != null) {
								config.files[item.key] = item.val;
							} else {
								config.data[item.key] = item.val;
							}
						}

						setTimeout(function() {
							if (!hasFlash) {
								alert('Please install Adode Flash Player to upload files.');
							}
							xhr.__fileApiXHR = FileAPI.upload(config);
						}, 1);
					} else {
						origSend.apply(xhr, arguments);
					}
				}
				return xhr;
			}
		})(window.XMLHttpRequest);
		window.XMLHttpRequest.__hasFlash = hasFlash;
	}
	window.XMLHttpRequest.__isShim = true;
}

if (!window.FormData) {
	var wrapFileApi = function(elem) {
		if (!elem.__isWrapped && (elem.getAttribute('ng-file-select') != null || elem.getAttribute('data-ng-file-select') != null)) {
			var wrap = document.createElement('div');
			wrap.innerHTML = '<div class="js-fileapi-wrapper" style="position:relative; overflow:hidden"></div>';
			wrap = wrap.firstChild;
			var parent = elem.parentNode;
			parent.insertBefore(wrap, elem);
			parent.removeChild(elem);
			wrap.appendChild(elem);
			elem.__isWrapped = true;
		}
	};
	var changeFnWrapper = function(fn) {
		return function(evt) {
			var files = FileAPI.getFiles(evt);
			if (!evt.target) {
				evt.target = {};
			}
			evt.target.files = files;
			evt.target.files.item = function(i) {
				return evt.target.files[i] || null;
			}
			fn(evt);
		};
	};
	var isFileChange = function(elem, e) {
		return (e.toLowerCase() === 'change' || e.toLowerCase() === 'onchange') && elem.getAttribute('type') == 'file';
	}
	if (HTMLInputElement.prototype.addEventListener) {
		HTMLInputElement.prototype.addEventListener = (function(origAddEventListener) {
			return function(e, fn, b, d) {
				if (isFileChange(this, e)) {
					wrapFileApi(this);
					origAddEventListener.apply(this, [e, changeFnWrapper(fn), b, d]);
				} else {
					origAddEventListener.apply(this, [e, fn, b, d]);
				}
			}
		})(HTMLInputElement.prototype.addEventListener);
	}
	if (HTMLInputElement.prototype.attachEvent) {
		HTMLInputElement.prototype.attachEvent = (function(origAttachEvent) {
			return function(e, fn) {
				if (isFileChange(this, e)) {
					wrapFileApi(this);
					origAttachEvent.apply(this, [e, changeFnWrapper(fn)]);
				} else {
					origAttachEvent.apply(this, [e, fn]);
				}
			}
		})(HTMLInputElement.prototype.attachEvent);
	}

	window.FormData = FormData = function() {
		return {
			append: function(key, val, name) {
				this.data.push({
					key: key,
					val: val,
					name: name
				});
			},
			data: [],
			__isShim: true
		};
	};

	(function () {
		//load FileAPI
		if (!window.FileAPI) {
			window.FileAPI = {};
		}
		if (!FileAPI.upload) {
			var jsUrl, basePath, script = document.createElement('script'), allScripts = document.getElementsByTagName('script'), i, index, src;
			if (window.FileAPI.jsUrl) {
				jsUrl = window.FileAPI.jsUrl;
			} else if (window.FileAPI.jsPath) {
				basePath = window.FileAPI.jsPath;
			} else {
				for (i = 0; i < allScripts.length; i++) {
					src = allScripts[i].src;
					index = src.indexOf('angular-file-upload-shim.js')
					if (index == -1) {
						index = src.indexOf('angular-file-upload-shim.min.js');
					}
					if (index > -1) {
						basePath = src.substring(0, index);
						break;
					}
				}
			}

			if (FileAPI.staticPath == null) FileAPI.staticPath = basePath;
			script.setAttribute('src', jsUrl || basePath + "FileAPI.min.js");
			document.getElementsByTagName('head')[0].appendChild(script);
		}
	})();
}


if (!window.FileReader) {
	window.FileReader = function() {
		var _this = this, loadStarted = false;
		this.listeners = {};
		this.addEventListener = function(type, fn) {
			_this.listeners[type] = _this.listeners[type] || [];
			_this.listeners[type].push(fn);
		};
		this.removeEventListener = function(type, fn) {
			_this.listeners[type] && _this.listeners[type].splice(_this.listeners[type].indexOf(fn), 1);
		};
		this.dispatchEvent = function(evt) {
			var list = _this.listeners[evt.type];
			if (list) {
				for (var i = 0; i < list.length; i++) {
					list[i].call(_this, evt);
				}
			}
		};
		this.onabort = this.onerror = this.onload = this.onloadstart = this.onloadend = this.onprogress = null;

		function constructEvent(type, evt) {
			var e = {type: type, target: _this, loaded: evt.loaded, total: evt.total, error: evt.error};
			if (evt.result != null) e.target.result = evt.result;
			return e;
		};
		var listener = function(evt) {
			if (!loadStarted) {
				loadStarted = true;
				_this.onloadstart && this.onloadstart(constructEvent('loadstart', evt));
			}
			if (evt.type === 'load') {
				_this.onloadend && _this.onloadend(constructEvent('loadend', evt));
				var e = constructEvent('load', evt);
				_this.onload && _this.onload(e);
				_this.dispatchEvent(e);
			} else if (evt.type === 'progress') {
				var e = constructEvent('progress', evt);
				_this.onprogress && _this.onprogress(e);
				_this.dispatchEvent(e);
			} else {
				var e = constructEvent('error', evt);
				_this.onerror && _this.onerror(e);
				_this.dispatchEvent(e);
			}
		};
		this.readAsArrayBuffer = function(file) {
			FileAPI.readAsBinaryString(file, listener);
		}
		this.readAsBinaryString = function(file) {
			FileAPI.readAsBinaryString(file, listener);
		}
		this.readAsDataURL = function(file) {
			FileAPI.readAsDataURL(file, listener);
		}
		this.readAsText = function(file) {
			FileAPI.readAsText(file, listener);
		}
	}
}

})();
;(function( $, undefined ) {

var uuid = 0,
	runiqueId = /^ui-id-\d+$/;

// $.ui might exist from components with no dependencies, e.g., $.ui.position
$.ui = $.ui || {};

$.extend( $.ui, {
	version: "1.10.4",

	keyCode: {
		BACKSPACE: 8,
		COMMA: 188,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		LEFT: 37,
		NUMPAD_ADD: 107,
		NUMPAD_DECIMAL: 110,
		NUMPAD_DIVIDE: 111,
		NUMPAD_ENTER: 108,
		NUMPAD_MULTIPLY: 106,
		NUMPAD_SUBTRACT: 109,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SPACE: 32,
		TAB: 9,
		UP: 38
	}
});

// plugins
$.fn.extend({
	focus: (function( orig ) {
		return function( delay, fn ) {
			return typeof delay === "number" ?
				this.each(function() {
					var elem = this;
					setTimeout(function() {
						$( elem ).focus();
						if ( fn ) {
							fn.call( elem );
						}
					}, delay );
				}) :
				orig.apply( this, arguments );
		};
	})( $.fn.focus ),

	scrollParent: function() {
		var scrollParent;
		if (($.ui.ie && (/(static|relative)/).test(this.css("position"))) || (/absolute/).test(this.css("position"))) {
			scrollParent = this.parents().filter(function() {
				return (/(relative|absolute|fixed)/).test($.css(this,"position")) && (/(auto|scroll)/).test($.css(this,"overflow")+$.css(this,"overflow-y")+$.css(this,"overflow-x"));
			}).eq(0);
		} else {
			scrollParent = this.parents().filter(function() {
				return (/(auto|scroll)/).test($.css(this,"overflow")+$.css(this,"overflow-y")+$.css(this,"overflow-x"));
			}).eq(0);
		}

		return (/fixed/).test(this.css("position")) || !scrollParent.length ? $(document) : scrollParent;
	},

	zIndex: function( zIndex ) {
		if ( zIndex !== undefined ) {
			return this.css( "zIndex", zIndex );
		}

		if ( this.length ) {
			var elem = $( this[ 0 ] ), position, value;
			while ( elem.length && elem[ 0 ] !== document ) {
				// Ignore z-index if position is set to a value where z-index is ignored by the browser
				// This makes behavior of this function consistent across browsers
				// WebKit always returns auto if the element is positioned
				position = elem.css( "position" );
				if ( position === "absolute" || position === "relative" || position === "fixed" ) {
					// IE returns 0 when zIndex is not specified
					// other browsers return a string
					// we ignore the case of nested elements with an explicit value of 0
					// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
					value = parseInt( elem.css( "zIndex" ), 10 );
					if ( !isNaN( value ) && value !== 0 ) {
						return value;
					}
				}
				elem = elem.parent();
			}
		}

		return 0;
	},

	uniqueId: function() {
		return this.each(function() {
			if ( !this.id ) {
				this.id = "ui-id-" + (++uuid);
			}
		});
	},

	removeUniqueId: function() {
		return this.each(function() {
			if ( runiqueId.test( this.id ) ) {
				$( this ).removeAttr( "id" );
			}
		});
	}
});

// selectors
function focusable( element, isTabIndexNotNaN ) {
	var map, mapName, img,
		nodeName = element.nodeName.toLowerCase();
	if ( "area" === nodeName ) {
		map = element.parentNode;
		mapName = map.name;
		if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
			return false;
		}
		img = $( "img[usemap=#" + mapName + "]" )[0];
		return !!img && visible( img );
	}
	return ( /input|select|textarea|button|object/.test( nodeName ) ?
		!element.disabled :
		"a" === nodeName ?
			element.href || isTabIndexNotNaN :
			isTabIndexNotNaN) &&
		// the element and all of its ancestors must be visible
		visible( element );
}

function visible( element ) {
	return $.expr.filters.visible( element ) &&
		!$( element ).parents().addBack().filter(function() {
			return $.css( this, "visibility" ) === "hidden";
		}).length;
}

$.extend( $.expr[ ":" ], {
	data: $.expr.createPseudo ?
		$.expr.createPseudo(function( dataName ) {
			return function( elem ) {
				return !!$.data( elem, dataName );
			};
		}) :
		// support: jQuery <1.8
		function( elem, i, match ) {
			return !!$.data( elem, match[ 3 ] );
		},

	focusable: function( element ) {
		return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
	},

	tabbable: function( element ) {
		var tabIndex = $.attr( element, "tabindex" ),
			isTabIndexNaN = isNaN( tabIndex );
		return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
	}
});

// support: jQuery <1.8
if ( !$( "<a>" ).outerWidth( 1 ).jquery ) {
	$.each( [ "Width", "Height" ], function( i, name ) {
		var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
			type = name.toLowerCase(),
			orig = {
				innerWidth: $.fn.innerWidth,
				innerHeight: $.fn.innerHeight,
				outerWidth: $.fn.outerWidth,
				outerHeight: $.fn.outerHeight
			};

		function reduce( elem, size, border, margin ) {
			$.each( side, function() {
				size -= parseFloat( $.css( elem, "padding" + this ) ) || 0;
				if ( border ) {
					size -= parseFloat( $.css( elem, "border" + this + "Width" ) ) || 0;
				}
				if ( margin ) {
					size -= parseFloat( $.css( elem, "margin" + this ) ) || 0;
				}
			});
			return size;
		}

		$.fn[ "inner" + name ] = function( size ) {
			if ( size === undefined ) {
				return orig[ "inner" + name ].call( this );
			}

			return this.each(function() {
				$( this ).css( type, reduce( this, size ) + "px" );
			});
		};

		$.fn[ "outer" + name] = function( size, margin ) {
			if ( typeof size !== "number" ) {
				return orig[ "outer" + name ].call( this, size );
			}

			return this.each(function() {
				$( this).css( type, reduce( this, size, true, margin ) + "px" );
			});
		};
	});
}

// support: jQuery <1.8
if ( !$.fn.addBack ) {
	$.fn.addBack = function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	};
}

// support: jQuery 1.6.1, 1.6.2 (http://bugs.jquery.com/ticket/9413)
if ( $( "<a>" ).data( "a-b", "a" ).removeData( "a-b" ).data( "a-b" ) ) {
	$.fn.removeData = (function( removeData ) {
		return function( key ) {
			if ( arguments.length ) {
				return removeData.call( this, $.camelCase( key ) );
			} else {
				return removeData.call( this );
			}
		};
	})( $.fn.removeData );
}





// deprecated
$.ui.ie = !!/msie [\w.]+/.exec( navigator.userAgent.toLowerCase() );

$.support.selectstart = "onselectstart" in document.createElement( "div" );
$.fn.extend({
	disableSelection: function() {
		return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
			".ui-disableSelection", function( event ) {
				event.preventDefault();
			});
	},

	enableSelection: function() {
		return this.unbind( ".ui-disableSelection" );
	}
});

$.extend( $.ui, {
	// $.ui.plugin is deprecated. Use $.widget() extensions instead.
	plugin: {
		add: function( module, option, set ) {
			var i,
				proto = $.ui[ module ].prototype;
			for ( i in set ) {
				proto.plugins[ i ] = proto.plugins[ i ] || [];
				proto.plugins[ i ].push( [ option, set[ i ] ] );
			}
		},
		call: function( instance, name, args ) {
			var i,
				set = instance.plugins[ name ];
			if ( !set || !instance.element[ 0 ].parentNode || instance.element[ 0 ].parentNode.nodeType === 11 ) {
				return;
			}

			for ( i = 0; i < set.length; i++ ) {
				if ( instance.options[ set[ i ][ 0 ] ] ) {
					set[ i ][ 1 ].apply( instance.element, args );
				}
			}
		}
	},

	// only used by resizable
	hasScroll: function( el, a ) {

		//If overflow is hidden, the element might have extra content, but the user wants to hide it
		if ( $( el ).css( "overflow" ) === "hidden") {
			return false;
		}

		var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop",
			has = false;

		if ( el[ scroll ] > 0 ) {
			return true;
		}

		// TODO: determine which cases actually cause this to happen
		// if the element doesn't have the scroll set, see if it's possible to
		// set the scroll
		el[ scroll ] = 1;
		has = ( el[ scroll ] > 0 );
		el[ scroll ] = 0;
		return has;
	}
});

})( jQuery );
(function( $, undefined ) {

var uuid = 0,
	slice = Array.prototype.slice,
	_cleanData = $.cleanData;
$.cleanData = function( elems ) {
	for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
		try {
			$( elem ).triggerHandler( "remove" );
		// http://bugs.jquery.com/ticket/8235
		} catch( e ) {}
	}
	_cleanData( elems );
};

$.widget = function( name, base, prototype ) {
	var fullName, existingConstructor, constructor, basePrototype,
		// proxiedPrototype allows the provided prototype to remain unmodified
		// so that it can be used as a mixin for multiple widgets (#8876)
		proxiedPrototype = {},
		namespace = name.split( "." )[ 0 ];

	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	// create selector for plugin
	$.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
		return !!$.data( elem, fullName );
	};

	$[ namespace ] = $[ namespace ] || {};
	existingConstructor = $[ namespace ][ name ];
	constructor = $[ namespace ][ name ] = function( options, element ) {
		// allow instantiation without "new" keyword
		if ( !this._createWidget ) {
			return new constructor( options, element );
		}

		// allow instantiation without initializing for simple inheritance
		// must use "new" keyword (the code above always passes args)
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};
	// extend with the existing constructor to carry over any static properties
	$.extend( constructor, existingConstructor, {
		version: prototype.version,
		// copy the object used to create the prototype in case we need to
		// redefine the widget later
		_proto: $.extend( {}, prototype ),
		// track widgets that inherit from this widget in case this widget is
		// redefined after a widget inherits from it
		_childConstructors: []
	});

	basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
	basePrototype.options = $.widget.extend( {}, basePrototype.options );
	$.each( prototype, function( prop, value ) {
		if ( !$.isFunction( value ) ) {
			proxiedPrototype[ prop ] = value;
			return;
		}
		proxiedPrototype[ prop ] = (function() {
			var _super = function() {
					return base.prototype[ prop ].apply( this, arguments );
				},
				_superApply = function( args ) {
					return base.prototype[ prop ].apply( this, args );
				};
			return function() {
				var __super = this._super,
					__superApply = this._superApply,
					returnValue;

				this._super = _super;
				this._superApply = _superApply;

				returnValue = value.apply( this, arguments );

				this._super = __super;
				this._superApply = __superApply;

				return returnValue;
			};
		})();
	});
	constructor.prototype = $.widget.extend( basePrototype, {
		// TODO: remove support for widgetEventPrefix
		// always use the name + a colon as the prefix, e.g., draggable:start
		// don't prefix for widgets that aren't DOM-based
		widgetEventPrefix: existingConstructor ? (basePrototype.widgetEventPrefix || name) : name
	}, proxiedPrototype, {
		constructor: constructor,
		namespace: namespace,
		widgetName: name,
		widgetFullName: fullName
	});

	// If this widget is being redefined then we need to find all widgets that
	// are inheriting from it and redefine all of them so that they inherit from
	// the new version of this widget. We're essentially trying to replace one
	// level in the prototype chain.
	if ( existingConstructor ) {
		$.each( existingConstructor._childConstructors, function( i, child ) {
			var childPrototype = child.prototype;

			// redefine the child widget using the same prototype that was
			// originally used, but inherit from the new version of the base
			$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto );
		});
		// remove the list of existing child constructors from the old constructor
		// so the old child constructors can be garbage collected
		delete existingConstructor._childConstructors;
	} else {
		base._childConstructors.push( constructor );
	}

	$.widget.bridge( name, constructor );
};

$.widget.extend = function( target ) {
	var input = slice.call( arguments, 1 ),
		inputIndex = 0,
		inputLength = input.length,
		key,
		value;
	for ( ; inputIndex < inputLength; inputIndex++ ) {
		for ( key in input[ inputIndex ] ) {
			value = input[ inputIndex ][ key ];
			if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {
				// Clone objects
				if ( $.isPlainObject( value ) ) {
					target[ key ] = $.isPlainObject( target[ key ] ) ?
						$.widget.extend( {}, target[ key ], value ) :
						// Don't extend strings, arrays, etc. with objects
						$.widget.extend( {}, value );
				// Copy everything else by reference
				} else {
					target[ key ] = value;
				}
			}
		}
	}
	return target;
};

$.widget.bridge = function( name, object ) {
	var fullName = object.prototype.widgetFullName || name;
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
			args = slice.call( arguments, 1 ),
			returnValue = this;

		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.widget.extend.apply( null, [ options ].concat(args) ) :
			options;

		if ( isMethodCall ) {
			this.each(function() {
				var methodValue,
					instance = $.data( this, fullName );
				if ( !instance ) {
					return $.error( "cannot call methods on " + name + " prior to initialization; " +
						"attempted to call method '" + options + "'" );
				}
				if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
					return $.error( "no such method '" + options + "' for " + name + " widget instance" );
				}
				methodValue = instance[ options ].apply( instance, args );
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue && methodValue.jquery ?
						returnValue.pushStack( methodValue.get() ) :
						methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $.data( this, fullName );
				if ( instance ) {
					instance.option( options || {} )._init();
				} else {
					$.data( this, fullName, new object( options, this ) );
				}
			});
		}

		return returnValue;
	};
};

$.Widget = function( /* options, element */ ) {};
$.Widget._childConstructors = [];

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	defaultElement: "<div>",
	options: {
		disabled: false,

		// callbacks
		create: null
	},
	_createWidget: function( options, element ) {
		element = $( element || this.defaultElement || this )[ 0 ];
		this.element = $( element );
		this.uuid = uuid++;
		this.eventNamespace = "." + this.widgetName + this.uuid;
		this.options = $.widget.extend( {},
			this.options,
			this._getCreateOptions(),
			options );

		this.bindings = $();
		this.hoverable = $();
		this.focusable = $();

		if ( element !== this ) {
			$.data( element, this.widgetFullName, this );
			this._on( true, this.element, {
				remove: function( event ) {
					if ( event.target === element ) {
						this.destroy();
					}
				}
			});
			this.document = $( element.style ?
				// element within the document
				element.ownerDocument :
				// element is window or document
				element.document || element );
			this.window = $( this.document[0].defaultView || this.document[0].parentWindow );
		}

		this._create();
		this._trigger( "create", null, this._getCreateEventData() );
		this._init();
	},
	_getCreateOptions: $.noop,
	_getCreateEventData: $.noop,
	_create: $.noop,
	_init: $.noop,

	destroy: function() {
		this._destroy();
		// we can probably remove the unbind calls in 2.0
		// all event bindings should go through this._on()
		this.element
			.unbind( this.eventNamespace )
			// 1.9 BC for #7810
			// TODO remove dual storage
			.removeData( this.widgetName )
			.removeData( this.widgetFullName )
			// support: jquery <1.6.3
			// http://bugs.jquery.com/ticket/9413
			.removeData( $.camelCase( this.widgetFullName ) );
		this.widget()
			.unbind( this.eventNamespace )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.widgetFullName + "-disabled " +
				"ui-state-disabled" );

		// clean up events and states
		this.bindings.unbind( this.eventNamespace );
		this.hoverable.removeClass( "ui-state-hover" );
		this.focusable.removeClass( "ui-state-focus" );
	},
	_destroy: $.noop,

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key,
			parts,
			curOption,
			i;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.widget.extend( {}, this.options );
		}

		if ( typeof key === "string" ) {
			// handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
			options = {};
			parts = key.split( "." );
			key = parts.shift();
			if ( parts.length ) {
				curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
				for ( i = 0; i < parts.length - 1; i++ ) {
					curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
					curOption = curOption[ parts[ i ] ];
				}
				key = parts.pop();
				if ( arguments.length === 1 ) {
					return curOption[ key ] === undefined ? null : curOption[ key ];
				}
				curOption[ key ] = value;
			} else {
				if ( arguments.length === 1 ) {
					return this.options[ key ] === undefined ? null : this.options[ key ];
				}
				options[ key ] = value;
			}
		}

		this._setOptions( options );

		return this;
	},
	_setOptions: function( options ) {
		var key;

		for ( key in options ) {
			this._setOption( key, options[ key ] );
		}

		return this;
	},
	_setOption: function( key, value ) {
		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this.widget()
				.toggleClass( this.widgetFullName + "-disabled ui-state-disabled", !!value )
				.attr( "aria-disabled", value );
			this.hoverable.removeClass( "ui-state-hover" );
			this.focusable.removeClass( "ui-state-focus" );
		}

		return this;
	},

	enable: function() {
		return this._setOption( "disabled", false );
	},
	disable: function() {
		return this._setOption( "disabled", true );
	},

	_on: function( suppressDisabledCheck, element, handlers ) {
		var delegateElement,
			instance = this;

		// no suppressDisabledCheck flag, shuffle arguments
		if ( typeof suppressDisabledCheck !== "boolean" ) {
			handlers = element;
			element = suppressDisabledCheck;
			suppressDisabledCheck = false;
		}

		// no element argument, shuffle and use this.element
		if ( !handlers ) {
			handlers = element;
			element = this.element;
			delegateElement = this.widget();
		} else {
			// accept selectors, DOM elements
			element = delegateElement = $( element );
			this.bindings = this.bindings.add( element );
		}

		$.each( handlers, function( event, handler ) {
			function handlerProxy() {
				// allow widgets to customize the disabled handling
				// - disabled as an array instead of boolean
				// - disabled class as method for disabling individual parts
				if ( !suppressDisabledCheck &&
						( instance.options.disabled === true ||
							$( this ).hasClass( "ui-state-disabled" ) ) ) {
					return;
				}
				return ( typeof handler === "string" ? instance[ handler ] : handler )
					.apply( instance, arguments );
			}

			// copy the guid so direct unbinding works
			if ( typeof handler !== "string" ) {
				handlerProxy.guid = handler.guid =
					handler.guid || handlerProxy.guid || $.guid++;
			}

			var match = event.match( /^(\w+)\s*(.*)$/ ),
				eventName = match[1] + instance.eventNamespace,
				selector = match[2];
			if ( selector ) {
				delegateElement.delegate( selector, eventName, handlerProxy );
			} else {
				element.bind( eventName, handlerProxy );
			}
		});
	},

	_off: function( element, eventName ) {
		eventName = (eventName || "").split( " " ).join( this.eventNamespace + " " ) + this.eventNamespace;
		element.unbind( eventName ).undelegate( eventName );
	},

	_delay: function( handler, delay ) {
		function handlerProxy() {
			return ( typeof handler === "string" ? instance[ handler ] : handler )
				.apply( instance, arguments );
		}
		var instance = this;
		return setTimeout( handlerProxy, delay || 0 );
	},

	_hoverable: function( element ) {
		this.hoverable = this.hoverable.add( element );
		this._on( element, {
			mouseenter: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-hover" );
			},
			mouseleave: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-hover" );
			}
		});
	},

	_focusable: function( element ) {
		this.focusable = this.focusable.add( element );
		this._on( element, {
			focusin: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-focus" );
			},
			focusout: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-focus" );
			}
		});
	},

	_trigger: function( type, event, data ) {
		var prop, orig,
			callback = this.options[ type ];

		data = data || {};
		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();
		// the original event may come from any element
		// so we need to reset the target on the new event
		event.target = this.element[ 0 ];

		// copy original event properties over to the new event
		orig = event.originalEvent;
		if ( orig ) {
			for ( prop in orig ) {
				if ( !( prop in event ) ) {
					event[ prop ] = orig[ prop ];
				}
			}
		}

		this.element.trigger( event, data );
		return !( $.isFunction( callback ) &&
			callback.apply( this.element[0], [ event ].concat( data ) ) === false ||
			event.isDefaultPrevented() );
	}
};

$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
	$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
		if ( typeof options === "string" ) {
			options = { effect: options };
		}
		var hasOptions,
			effectName = !options ?
				method :
				options === true || typeof options === "number" ?
					defaultEffect :
					options.effect || defaultEffect;
		options = options || {};
		if ( typeof options === "number" ) {
			options = { duration: options };
		}
		hasOptions = !$.isEmptyObject( options );
		options.complete = callback;
		if ( options.delay ) {
			element.delay( options.delay );
		}
		if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
			element[ method ]( options );
		} else if ( effectName !== method && element[ effectName ] ) {
			element[ effectName ]( options.duration, options.easing, callback );
		} else {
			element.queue(function( next ) {
				$( this )[ method ]();
				if ( callback ) {
					callback.call( element[ 0 ] );
				}
				next();
			});
		}
	};
});

})( jQuery );
(function( $, undefined ) {

var mouseHandled = false;
$( document ).mouseup( function() {
	mouseHandled = false;
});

$.widget("ui.mouse", {
	version: "1.10.4",
	options: {
		cancel: "input,textarea,button,select,option",
		distance: 1,
		delay: 0
	},
	_mouseInit: function() {
		var that = this;

		this.element
			.bind("mousedown."+this.widgetName, function(event) {
				return that._mouseDown(event);
			})
			.bind("click."+this.widgetName, function(event) {
				if (true === $.data(event.target, that.widgetName + ".preventClickEvent")) {
					$.removeData(event.target, that.widgetName + ".preventClickEvent");
					event.stopImmediatePropagation();
					return false;
				}
			});

		this.started = false;
	},

	// TODO: make sure destroying one instance of mouse doesn't mess with
	// other instances of mouse
	_mouseDestroy: function() {
		this.element.unbind("."+this.widgetName);
		if ( this._mouseMoveDelegate ) {
			$(document)
				.unbind("mousemove."+this.widgetName, this._mouseMoveDelegate)
				.unbind("mouseup."+this.widgetName, this._mouseUpDelegate);
		}
	},

	_mouseDown: function(event) {
		// don't let more than one widget handle mouseStart
		if( mouseHandled ) { return; }

		// we may have missed mouseup (out of window)
		(this._mouseStarted && this._mouseUp(event));

		this._mouseDownEvent = event;

		var that = this,
			btnIsLeft = (event.which === 1),
			// event.target.nodeName works around a bug in IE 8 with
			// disabled inputs (#7620)
			elIsCancel = (typeof this.options.cancel === "string" && event.target.nodeName ? $(event.target).closest(this.options.cancel).length : false);
		if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
			return true;
		}

		this.mouseDelayMet = !this.options.delay;
		if (!this.mouseDelayMet) {
			this._mouseDelayTimer = setTimeout(function() {
				that.mouseDelayMet = true;
			}, this.options.delay);
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted = (this._mouseStart(event) !== false);
			if (!this._mouseStarted) {
				event.preventDefault();
				return true;
			}
		}

		// Click event may never have fired (Gecko & Opera)
		if (true === $.data(event.target, this.widgetName + ".preventClickEvent")) {
			$.removeData(event.target, this.widgetName + ".preventClickEvent");
		}

		// these delegates are required to keep context
		this._mouseMoveDelegate = function(event) {
			return that._mouseMove(event);
		};
		this._mouseUpDelegate = function(event) {
			return that._mouseUp(event);
		};
		$(document)
			.bind("mousemove."+this.widgetName, this._mouseMoveDelegate)
			.bind("mouseup."+this.widgetName, this._mouseUpDelegate);

		event.preventDefault();

		mouseHandled = true;
		return true;
	},

	_mouseMove: function(event) {
		// IE mouseup check - mouseup happened when mouse was out of window
		if ($.ui.ie && ( !document.documentMode || document.documentMode < 9 ) && !event.button) {
			return this._mouseUp(event);
		}

		if (this._mouseStarted) {
			this._mouseDrag(event);
			return event.preventDefault();
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted =
				(this._mouseStart(this._mouseDownEvent, event) !== false);
			(this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
		}

		return !this._mouseStarted;
	},

	_mouseUp: function(event) {
		$(document)
			.unbind("mousemove."+this.widgetName, this._mouseMoveDelegate)
			.unbind("mouseup."+this.widgetName, this._mouseUpDelegate);

		if (this._mouseStarted) {
			this._mouseStarted = false;

			if (event.target === this._mouseDownEvent.target) {
				$.data(event.target, this.widgetName + ".preventClickEvent", true);
			}

			this._mouseStop(event);
		}

		return false;
	},

	_mouseDistanceMet: function(event) {
		return (Math.max(
				Math.abs(this._mouseDownEvent.pageX - event.pageX),
				Math.abs(this._mouseDownEvent.pageY - event.pageY)
			) >= this.options.distance
		);
	},

	_mouseDelayMet: function(/* event */) {
		return this.mouseDelayMet;
	},

	// These are placeholder methods, to be overriden by extending plugin
	_mouseStart: function(/* event */) {},
	_mouseDrag: function(/* event */) {},
	_mouseStop: function(/* event */) {},
	_mouseCapture: function(/* event */) { return true; }
});

})(jQuery);
(function( $, undefined ) {

$.widget("ui.draggable", $.ui.mouse, {
	version: "1.10.4",
	widgetEventPrefix: "drag",
	options: {
		addClasses: true,
		appendTo: "parent",
		axis: false,
		connectToSortable: false,
		containment: false,
		cursor: "auto",
		cursorAt: false,
		grid: false,
		handle: false,
		helper: "original",
		iframeFix: false,
		opacity: false,
		refreshPositions: false,
		revert: false,
		revertDuration: 500,
		scope: "default",
		scroll: true,
		scrollSensitivity: 20,
		scrollSpeed: 20,
		snap: false,
		snapMode: "both",
		snapTolerance: 20,
		stack: false,
		zIndex: false,

		// callbacks
		drag: null,
		start: null,
		stop: null
	},
	_create: function() {

		if (this.options.helper === "original" && !(/^(?:r|a|f)/).test(this.element.css("position"))) {
			this.element[0].style.position = "relative";
		}
		if (this.options.addClasses){
			this.element.addClass("ui-draggable");
		}
		if (this.options.disabled){
			this.element.addClass("ui-draggable-disabled");
		}

		this._mouseInit();

	},

	_destroy: function() {
		this.element.removeClass( "ui-draggable ui-draggable-dragging ui-draggable-disabled" );
		this._mouseDestroy();
	},

	_mouseCapture: function(event) {

		var o = this.options;

		// among others, prevent a drag on a resizable-handle
		if (this.helper || o.disabled || $(event.target).closest(".ui-resizable-handle").length > 0) {
			return false;
		}

		//Quit if we're not on a valid handle
		this.handle = this._getHandle(event);
		if (!this.handle) {
			return false;
		}

		$(o.iframeFix === true ? "iframe" : o.iframeFix).each(function() {
			$("<div class='ui-draggable-iframeFix' style='background: #fff;'></div>")
			.css({
				width: this.offsetWidth+"px", height: this.offsetHeight+"px",
				position: "absolute", opacity: "0.001", zIndex: 1000
			})
			.css($(this).offset())
			.appendTo("body");
		});

		return true;

	},

	_mouseStart: function(event) {

		var o = this.options;

		//Create and append the visible helper
		this.helper = this._createHelper(event);

		this.helper.addClass("ui-draggable-dragging");

		//Cache the helper size
		this._cacheHelperProportions();

		//If ddmanager is used for droppables, set the global draggable
		if($.ui.ddmanager) {
			$.ui.ddmanager.current = this;
		}

		/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */

		//Cache the margins of the original element
		this._cacheMargins();

		//Store the helper's css position
		this.cssPosition = this.helper.css( "position" );
		this.scrollParent = this.helper.scrollParent();
		this.offsetParent = this.helper.offsetParent();
		this.offsetParentCssPosition = this.offsetParent.css( "position" );

		//The element's absolute position on the page minus margins
		this.offset = this.positionAbs = this.element.offset();
		this.offset = {
			top: this.offset.top - this.margins.top,
			left: this.offset.left - this.margins.left
		};

		//Reset scroll cache
		this.offset.scroll = false;

		$.extend(this.offset, {
			click: { //Where the click happened, relative to the element
				left: event.pageX - this.offset.left,
				top: event.pageY - this.offset.top
			},
			parent: this._getParentOffset(),
			relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
		});

		//Generate the original position
		this.originalPosition = this.position = this._generatePosition(event);
		this.originalPageX = event.pageX;
		this.originalPageY = event.pageY;

		//Adjust the mouse offset relative to the helper if "cursorAt" is supplied
		(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

		//Set a containment if given in the options
		this._setContainment();

		//Trigger event + callbacks
		if(this._trigger("start", event) === false) {
			this._clear();
			return false;
		}

		//Recache the helper size
		this._cacheHelperProportions();

		//Prepare the droppable offsets
		if ($.ui.ddmanager && !o.dropBehaviour) {
			$.ui.ddmanager.prepareOffsets(this, event);
		}


		this._mouseDrag(event, true); //Execute the drag once - this causes the helper not to be visible before getting its correct position

		//If the ddmanager is used for droppables, inform the manager that dragging has started (see #5003)
		if ( $.ui.ddmanager ) {
			$.ui.ddmanager.dragStart(this, event);
		}

		return true;
	},

	_mouseDrag: function(event, noPropagation) {
		// reset any necessary cached properties (see #5009)
		if ( this.offsetParentCssPosition === "fixed" ) {
			this.offset.parent = this._getParentOffset();
		}

		//Compute the helpers position
		this.position = this._generatePosition(event);
		this.positionAbs = this._convertPositionTo("absolute");

		//Call plugins and callbacks and use the resulting position if something is returned
		if (!noPropagation) {
			var ui = this._uiHash();
			if(this._trigger("drag", event, ui) === false) {
				this._mouseUp({});
				return false;
			}
			this.position = ui.position;
		}

		if(!this.options.axis || this.options.axis !== "y") {
			this.helper[0].style.left = this.position.left+"px";
		}
		if(!this.options.axis || this.options.axis !== "x") {
			this.helper[0].style.top = this.position.top+"px";
		}
		if($.ui.ddmanager) {
			$.ui.ddmanager.drag(this, event);
		}

		return false;
	},

	_mouseStop: function(event) {

		//If we are using droppables, inform the manager about the drop
		var that = this,
			dropped = false;
		if ($.ui.ddmanager && !this.options.dropBehaviour) {
			dropped = $.ui.ddmanager.drop(this, event);
		}

		//if a drop comes from outside (a sortable)
		if(this.dropped) {
			dropped = this.dropped;
			this.dropped = false;
		}

		//if the original element is no longer in the DOM don't bother to continue (see #8269)
		if ( this.options.helper === "original" && !$.contains( this.element[ 0 ].ownerDocument, this.element[ 0 ] ) ) {
			return false;
		}

		if((this.options.revert === "invalid" && !dropped) || (this.options.revert === "valid" && dropped) || this.options.revert === true || ($.isFunction(this.options.revert) && this.options.revert.call(this.element, dropped))) {
			$(this.helper).animate(this.originalPosition, parseInt(this.options.revertDuration, 10), function() {
				if(that._trigger("stop", event) !== false) {
					that._clear();
				}
			});
		} else {
			if(this._trigger("stop", event) !== false) {
				this._clear();
			}
		}

		return false;
	},

	_mouseUp: function(event) {
		//Remove frame helpers
		$("div.ui-draggable-iframeFix").each(function() {
			this.parentNode.removeChild(this);
		});

		//If the ddmanager is used for droppables, inform the manager that dragging has stopped (see #5003)
		if( $.ui.ddmanager ) {
			$.ui.ddmanager.dragStop(this, event);
		}

		return $.ui.mouse.prototype._mouseUp.call(this, event);
	},

	cancel: function() {

		if(this.helper.is(".ui-draggable-dragging")) {
			this._mouseUp({});
		} else {
			this._clear();
		}

		return this;

	},

	_getHandle: function(event) {
		return this.options.handle ?
			!!$( event.target ).closest( this.element.find( this.options.handle ) ).length :
			true;
	},

	_createHelper: function(event) {

		var o = this.options,
			helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event])) : (o.helper === "clone" ? this.element.clone().removeAttr("id") : this.element);

		if(!helper.parents("body").length) {
			helper.appendTo((o.appendTo === "parent" ? this.element[0].parentNode : o.appendTo));
		}

		if(helper[0] !== this.element[0] && !(/(fixed|absolute)/).test(helper.css("position"))) {
			helper.css("position", "absolute");
		}

		return helper;

	},

	_adjustOffsetFromHelper: function(obj) {
		if (typeof obj === "string") {
			obj = obj.split(" ");
		}
		if ($.isArray(obj)) {
			obj = {left: +obj[0], top: +obj[1] || 0};
		}
		if ("left" in obj) {
			this.offset.click.left = obj.left + this.margins.left;
		}
		if ("right" in obj) {
			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
		}
		if ("top" in obj) {
			this.offset.click.top = obj.top + this.margins.top;
		}
		if ("bottom" in obj) {
			this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
		}
	},

	_getParentOffset: function() {

		//Get the offsetParent and cache its position
		var po = this.offsetParent.offset();

		// This is a special case where we need to modify a offset calculated on start, since the following happened:
		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
		if(this.cssPosition === "absolute" && this.scrollParent[0] !== document && $.contains(this.scrollParent[0], this.offsetParent[0])) {
			po.left += this.scrollParent.scrollLeft();
			po.top += this.scrollParent.scrollTop();
		}

		//This needs to be actually done for all browsers, since pageX/pageY includes this information
		//Ugly IE fix
		if((this.offsetParent[0] === document.body) ||
			(this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() === "html" && $.ui.ie)) {
			po = { top: 0, left: 0 };
		}

		return {
			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
		};

	},

	_getRelativeOffset: function() {

		if(this.cssPosition === "relative") {
			var p = this.element.position();
			return {
				top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.scrollParent.scrollTop(),
				left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.scrollParent.scrollLeft()
			};
		} else {
			return { top: 0, left: 0 };
		}

	},

	_cacheMargins: function() {
		this.margins = {
			left: (parseInt(this.element.css("marginLeft"),10) || 0),
			top: (parseInt(this.element.css("marginTop"),10) || 0),
			right: (parseInt(this.element.css("marginRight"),10) || 0),
			bottom: (parseInt(this.element.css("marginBottom"),10) || 0)
		};
	},

	_cacheHelperProportions: function() {
		this.helperProportions = {
			width: this.helper.outerWidth(),
			height: this.helper.outerHeight()
		};
	},

	_setContainment: function() {

		var over, c, ce,
			o = this.options;

		if ( !o.containment ) {
			this.containment = null;
			return;
		}

		if ( o.containment === "window" ) {
			this.containment = [
				$( window ).scrollLeft() - this.offset.relative.left - this.offset.parent.left,
				$( window ).scrollTop() - this.offset.relative.top - this.offset.parent.top,
				$( window ).scrollLeft() + $( window ).width() - this.helperProportions.width - this.margins.left,
				$( window ).scrollTop() + ( $( window ).height() || document.body.parentNode.scrollHeight ) - this.helperProportions.height - this.margins.top
			];
			return;
		}

		if ( o.containment === "document") {
			this.containment = [
				0,
				0,
				$( document ).width() - this.helperProportions.width - this.margins.left,
				( $( document ).height() || document.body.parentNode.scrollHeight ) - this.helperProportions.height - this.margins.top
			];
			return;
		}

		if ( o.containment.constructor === Array ) {
			this.containment = o.containment;
			return;
		}

		if ( o.containment === "parent" ) {
			o.containment = this.helper[ 0 ].parentNode;
		}

		c = $( o.containment );
		ce = c[ 0 ];

		if( !ce ) {
			return;
		}

		over = c.css( "overflow" ) !== "hidden";

		this.containment = [
			( parseInt( c.css( "borderLeftWidth" ), 10 ) || 0 ) + ( parseInt( c.css( "paddingLeft" ), 10 ) || 0 ),
			( parseInt( c.css( "borderTopWidth" ), 10 ) || 0 ) + ( parseInt( c.css( "paddingTop" ), 10 ) || 0 ) ,
			( over ? Math.max( ce.scrollWidth, ce.offsetWidth ) : ce.offsetWidth ) - ( parseInt( c.css( "borderRightWidth" ), 10 ) || 0 ) - ( parseInt( c.css( "paddingRight" ), 10 ) || 0 ) - this.helperProportions.width - this.margins.left - this.margins.right,
			( over ? Math.max( ce.scrollHeight, ce.offsetHeight ) : ce.offsetHeight ) - ( parseInt( c.css( "borderBottomWidth" ), 10 ) || 0 ) - ( parseInt( c.css( "paddingBottom" ), 10 ) || 0 ) - this.helperProportions.height - this.margins.top  - this.margins.bottom
		];
		this.relative_container = c;
	},

	_convertPositionTo: function(d, pos) {

		if(!pos) {
			pos = this.position;
		}

		var mod = d === "absolute" ? 1 : -1,
			scroll = this.cssPosition === "absolute" && !( this.scrollParent[ 0 ] !== document && $.contains( this.scrollParent[ 0 ], this.offsetParent[ 0 ] ) ) ? this.offsetParent : this.scrollParent;

		//Cache the scroll
		if (!this.offset.scroll) {
			this.offset.scroll = {top : scroll.scrollTop(), left : scroll.scrollLeft()};
		}

		return {
			top: (
				pos.top	+																// The absolute mouse position
				this.offset.relative.top * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.top * mod -										// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollTop() : this.offset.scroll.top ) * mod )
			),
			left: (
				pos.left +																// The absolute mouse position
				this.offset.relative.left * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.left * mod	-										// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollLeft() : this.offset.scroll.left ) * mod )
			)
		};

	},

	_generatePosition: function(event) {

		var containment, co, top, left,
			o = this.options,
			scroll = this.cssPosition === "absolute" && !( this.scrollParent[ 0 ] !== document && $.contains( this.scrollParent[ 0 ], this.offsetParent[ 0 ] ) ) ? this.offsetParent : this.scrollParent,
			pageX = event.pageX,
			pageY = event.pageY;

		//Cache the scroll
		if (!this.offset.scroll) {
			this.offset.scroll = {top : scroll.scrollTop(), left : scroll.scrollLeft()};
		}

		/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */

		// If we are not dragging yet, we won't check for options
		if ( this.originalPosition ) {
			if ( this.containment ) {
				if ( this.relative_container ){
					co = this.relative_container.offset();
					containment = [
						this.containment[ 0 ] + co.left,
						this.containment[ 1 ] + co.top,
						this.containment[ 2 ] + co.left,
						this.containment[ 3 ] + co.top
					];
				}
				else {
					containment = this.containment;
				}

				if(event.pageX - this.offset.click.left < containment[0]) {
					pageX = containment[0] + this.offset.click.left;
				}
				if(event.pageY - this.offset.click.top < containment[1]) {
					pageY = containment[1] + this.offset.click.top;
				}
				if(event.pageX - this.offset.click.left > containment[2]) {
					pageX = containment[2] + this.offset.click.left;
				}
				if(event.pageY - this.offset.click.top > containment[3]) {
					pageY = containment[3] + this.offset.click.top;
				}
			}

			if(o.grid) {
				//Check for grid elements set to 0 to prevent divide by 0 error causing invalid argument errors in IE (see ticket #6950)
				top = o.grid[1] ? this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1] : this.originalPageY;
				pageY = containment ? ((top - this.offset.click.top >= containment[1] || top - this.offset.click.top > containment[3]) ? top : ((top - this.offset.click.top >= containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

				left = o.grid[0] ? this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0] : this.originalPageX;
				pageX = containment ? ((left - this.offset.click.left >= containment[0] || left - this.offset.click.left > containment[2]) ? left : ((left - this.offset.click.left >= containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
			}

		}

		return {
			top: (
				pageY -																	// The absolute mouse position
				this.offset.click.top	-												// Click offset (relative to the element)
				this.offset.relative.top -												// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.top +												// The offsetParent's offset without borders (offset + border)
				( this.cssPosition === "fixed" ? -this.scrollParent.scrollTop() : this.offset.scroll.top )
			),
			left: (
				pageX -																	// The absolute mouse position
				this.offset.click.left -												// Click offset (relative to the element)
				this.offset.relative.left -												// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.left +												// The offsetParent's offset without borders (offset + border)
				( this.cssPosition === "fixed" ? -this.scrollParent.scrollLeft() : this.offset.scroll.left )
			)
		};

	},

	_clear: function() {
		this.helper.removeClass("ui-draggable-dragging");
		if(this.helper[0] !== this.element[0] && !this.cancelHelperRemoval) {
			this.helper.remove();
		}
		this.helper = null;
		this.cancelHelperRemoval = false;
	},

	// From now on bulk stuff - mainly helpers

	_trigger: function(type, event, ui) {
		ui = ui || this._uiHash();
		$.ui.plugin.call(this, type, [event, ui]);
		//The absolute position has to be recalculated after plugins
		if(type === "drag") {
			this.positionAbs = this._convertPositionTo("absolute");
		}
		return $.Widget.prototype._trigger.call(this, type, event, ui);
	},

	plugins: {},

	_uiHash: function() {
		return {
			helper: this.helper,
			position: this.position,
			originalPosition: this.originalPosition,
			offset: this.positionAbs
		};
	}

});

$.ui.plugin.add("draggable", "connectToSortable", {
	start: function(event, ui) {

		var inst = $(this).data("ui-draggable"), o = inst.options,
			uiSortable = $.extend({}, ui, { item: inst.element });
		inst.sortables = [];
		$(o.connectToSortable).each(function() {
			var sortable = $.data(this, "ui-sortable");
			if (sortable && !sortable.options.disabled) {
				inst.sortables.push({
					instance: sortable,
					shouldRevert: sortable.options.revert
				});
				sortable.refreshPositions();	// Call the sortable's refreshPositions at drag start to refresh the containerCache since the sortable container cache is used in drag and needs to be up to date (this will ensure it's initialised as well as being kept in step with any changes that might have happened on the page).
				sortable._trigger("activate", event, uiSortable);
			}
		});

	},
	stop: function(event, ui) {

		//If we are still over the sortable, we fake the stop event of the sortable, but also remove helper
		var inst = $(this).data("ui-draggable"),
			uiSortable = $.extend({}, ui, { item: inst.element });

		$.each(inst.sortables, function() {
			if(this.instance.isOver) {

				this.instance.isOver = 0;

				inst.cancelHelperRemoval = true; //Don't remove the helper in the draggable instance
				this.instance.cancelHelperRemoval = false; //Remove it in the sortable instance (so sortable plugins like revert still work)

				//The sortable revert is supported, and we have to set a temporary dropped variable on the draggable to support revert: "valid/invalid"
				if(this.shouldRevert) {
					this.instance.options.revert = this.shouldRevert;
				}

				//Trigger the stop of the sortable
				this.instance._mouseStop(event);

				this.instance.options.helper = this.instance.options._helper;

				//If the helper has been the original item, restore properties in the sortable
				if(inst.options.helper === "original") {
					this.instance.currentItem.css({ top: "auto", left: "auto" });
				}

			} else {
				this.instance.cancelHelperRemoval = false; //Remove the helper in the sortable instance
				this.instance._trigger("deactivate", event, uiSortable);
			}

		});

	},
	drag: function(event, ui) {

		var inst = $(this).data("ui-draggable"), that = this;

		$.each(inst.sortables, function() {

			var innermostIntersecting = false,
				thisSortable = this;

			//Copy over some variables to allow calling the sortable's native _intersectsWith
			this.instance.positionAbs = inst.positionAbs;
			this.instance.helperProportions = inst.helperProportions;
			this.instance.offset.click = inst.offset.click;

			if(this.instance._intersectsWith(this.instance.containerCache)) {
				innermostIntersecting = true;
				$.each(inst.sortables, function () {
					this.instance.positionAbs = inst.positionAbs;
					this.instance.helperProportions = inst.helperProportions;
					this.instance.offset.click = inst.offset.click;
					if (this !== thisSortable &&
						this.instance._intersectsWith(this.instance.containerCache) &&
						$.contains(thisSortable.instance.element[0], this.instance.element[0])
					) {
						innermostIntersecting = false;
					}
					return innermostIntersecting;
				});
			}


			if(innermostIntersecting) {
				//If it intersects, we use a little isOver variable and set it once, so our move-in stuff gets fired only once
				if(!this.instance.isOver) {

					this.instance.isOver = 1;
					//Now we fake the start of dragging for the sortable instance,
					//by cloning the list group item, appending it to the sortable and using it as inst.currentItem
					//We can then fire the start event of the sortable with our passed browser event, and our own helper (so it doesn't create a new one)
					this.instance.currentItem = $(that).clone().removeAttr("id").appendTo(this.instance.element).data("ui-sortable-item", true);
					this.instance.options._helper = this.instance.options.helper; //Store helper option to later restore it
					this.instance.options.helper = function() { return ui.helper[0]; };

					event.target = this.instance.currentItem[0];
					this.instance._mouseCapture(event, true);
					this.instance._mouseStart(event, true, true);

					//Because the browser event is way off the new appended portlet, we modify a couple of variables to reflect the changes
					this.instance.offset.click.top = inst.offset.click.top;
					this.instance.offset.click.left = inst.offset.click.left;
					this.instance.offset.parent.left -= inst.offset.parent.left - this.instance.offset.parent.left;
					this.instance.offset.parent.top -= inst.offset.parent.top - this.instance.offset.parent.top;

					inst._trigger("toSortable", event);
					inst.dropped = this.instance.element; //draggable revert needs that
					//hack so receive/update callbacks work (mostly)
					inst.currentItem = inst.element;
					this.instance.fromOutside = inst;

				}

				//Provided we did all the previous steps, we can fire the drag event of the sortable on every draggable drag, when it intersects with the sortable
				if(this.instance.currentItem) {
					this.instance._mouseDrag(event);
				}

			} else {

				//If it doesn't intersect with the sortable, and it intersected before,
				//we fake the drag stop of the sortable, but make sure it doesn't remove the helper by using cancelHelperRemoval
				if(this.instance.isOver) {

					this.instance.isOver = 0;
					this.instance.cancelHelperRemoval = true;

					//Prevent reverting on this forced stop
					this.instance.options.revert = false;

					// The out event needs to be triggered independently
					this.instance._trigger("out", event, this.instance._uiHash(this.instance));

					this.instance._mouseStop(event, true);
					this.instance.options.helper = this.instance.options._helper;

					//Now we remove our currentItem, the list group clone again, and the placeholder, and animate the helper back to it's original size
					this.instance.currentItem.remove();
					if(this.instance.placeholder) {
						this.instance.placeholder.remove();
					}

					inst._trigger("fromSortable", event);
					inst.dropped = false; //draggable revert needs that
				}

			}

		});

	}
});

$.ui.plugin.add("draggable", "cursor", {
	start: function() {
		var t = $("body"), o = $(this).data("ui-draggable").options;
		if (t.css("cursor")) {
			o._cursor = t.css("cursor");
		}
		t.css("cursor", o.cursor);
	},
	stop: function() {
		var o = $(this).data("ui-draggable").options;
		if (o._cursor) {
			$("body").css("cursor", o._cursor);
		}
	}
});

$.ui.plugin.add("draggable", "opacity", {
	start: function(event, ui) {
		var t = $(ui.helper), o = $(this).data("ui-draggable").options;
		if(t.css("opacity")) {
			o._opacity = t.css("opacity");
		}
		t.css("opacity", o.opacity);
	},
	stop: function(event, ui) {
		var o = $(this).data("ui-draggable").options;
		if(o._opacity) {
			$(ui.helper).css("opacity", o._opacity);
		}
	}
});

$.ui.plugin.add("draggable", "scroll", {
	start: function() {
		var i = $(this).data("ui-draggable");
		if(i.scrollParent[0] !== document && i.scrollParent[0].tagName !== "HTML") {
			i.overflowOffset = i.scrollParent.offset();
		}
	},
	drag: function( event ) {

		var i = $(this).data("ui-draggable"), o = i.options, scrolled = false;

		if(i.scrollParent[0] !== document && i.scrollParent[0].tagName !== "HTML") {

			if(!o.axis || o.axis !== "x") {
				if((i.overflowOffset.top + i.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity) {
					i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop + o.scrollSpeed;
				} else if(event.pageY - i.overflowOffset.top < o.scrollSensitivity) {
					i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop - o.scrollSpeed;
				}
			}

			if(!o.axis || o.axis !== "y") {
				if((i.overflowOffset.left + i.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity) {
					i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft + o.scrollSpeed;
				} else if(event.pageX - i.overflowOffset.left < o.scrollSensitivity) {
					i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft - o.scrollSpeed;
				}
			}

		} else {

			if(!o.axis || o.axis !== "x") {
				if(event.pageY - $(document).scrollTop() < o.scrollSensitivity) {
					scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
				} else if($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity) {
					scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);
				}
			}

			if(!o.axis || o.axis !== "y") {
				if(event.pageX - $(document).scrollLeft() < o.scrollSensitivity) {
					scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
				} else if($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity) {
					scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);
				}
			}

		}

		if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour) {
			$.ui.ddmanager.prepareOffsets(i, event);
		}

	}
});

$.ui.plugin.add("draggable", "snap", {
	start: function() {

		var i = $(this).data("ui-draggable"),
			o = i.options;

		i.snapElements = [];

		$(o.snap.constructor !== String ? ( o.snap.items || ":data(ui-draggable)" ) : o.snap).each(function() {
			var $t = $(this),
				$o = $t.offset();
			if(this !== i.element[0]) {
				i.snapElements.push({
					item: this,
					width: $t.outerWidth(), height: $t.outerHeight(),
					top: $o.top, left: $o.left
				});
			}
		});

	},
	drag: function(event, ui) {

		var ts, bs, ls, rs, l, r, t, b, i, first,
			inst = $(this).data("ui-draggable"),
			o = inst.options,
			d = o.snapTolerance,
			x1 = ui.offset.left, x2 = x1 + inst.helperProportions.width,
			y1 = ui.offset.top, y2 = y1 + inst.helperProportions.height;

		for (i = inst.snapElements.length - 1; i >= 0; i--){

			l = inst.snapElements[i].left;
			r = l + inst.snapElements[i].width;
			t = inst.snapElements[i].top;
			b = t + inst.snapElements[i].height;

			if ( x2 < l - d || x1 > r + d || y2 < t - d || y1 > b + d || !$.contains( inst.snapElements[ i ].item.ownerDocument, inst.snapElements[ i ].item ) ) {
				if(inst.snapElements[i].snapping) {
					(inst.options.snap.release && inst.options.snap.release.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
				}
				inst.snapElements[i].snapping = false;
				continue;
			}

			if(o.snapMode !== "inner") {
				ts = Math.abs(t - y2) <= d;
				bs = Math.abs(b - y1) <= d;
				ls = Math.abs(l - x2) <= d;
				rs = Math.abs(r - x1) <= d;
				if(ts) {
					ui.position.top = inst._convertPositionTo("relative", { top: t - inst.helperProportions.height, left: 0 }).top - inst.margins.top;
				}
				if(bs) {
					ui.position.top = inst._convertPositionTo("relative", { top: b, left: 0 }).top - inst.margins.top;
				}
				if(ls) {
					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l - inst.helperProportions.width }).left - inst.margins.left;
				}
				if(rs) {
					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r }).left - inst.margins.left;
				}
			}

			first = (ts || bs || ls || rs);

			if(o.snapMode !== "outer") {
				ts = Math.abs(t - y1) <= d;
				bs = Math.abs(b - y2) <= d;
				ls = Math.abs(l - x1) <= d;
				rs = Math.abs(r - x2) <= d;
				if(ts) {
					ui.position.top = inst._convertPositionTo("relative", { top: t, left: 0 }).top - inst.margins.top;
				}
				if(bs) {
					ui.position.top = inst._convertPositionTo("relative", { top: b - inst.helperProportions.height, left: 0 }).top - inst.margins.top;
				}
				if(ls) {
					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l }).left - inst.margins.left;
				}
				if(rs) {
					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r - inst.helperProportions.width }).left - inst.margins.left;
				}
			}

			if(!inst.snapElements[i].snapping && (ts || bs || ls || rs || first)) {
				(inst.options.snap.snap && inst.options.snap.snap.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
			}
			inst.snapElements[i].snapping = (ts || bs || ls || rs || first);

		}

	}
});

$.ui.plugin.add("draggable", "stack", {
	start: function() {
		var min,
			o = this.data("ui-draggable").options,
			group = $.makeArray($(o.stack)).sort(function(a,b) {
				return (parseInt($(a).css("zIndex"),10) || 0) - (parseInt($(b).css("zIndex"),10) || 0);
			});

		if (!group.length) { return; }

		min = parseInt($(group[0]).css("zIndex"), 10) || 0;
		$(group).each(function(i) {
			$(this).css("zIndex", min + i);
		});
		this.css("zIndex", (min + group.length));
	}
});

$.ui.plugin.add("draggable", "zIndex", {
	start: function(event, ui) {
		var t = $(ui.helper), o = $(this).data("ui-draggable").options;
		if(t.css("zIndex")) {
			o._zIndex = t.css("zIndex");
		}
		t.css("zIndex", o.zIndex);
	},
	stop: function(event, ui) {
		var o = $(this).data("ui-draggable").options;
		if(o._zIndex) {
			$(ui.helper).css("zIndex", o._zIndex);
		}
	}
});

})(jQuery);
(function( $, undefined ) {

function isOverAxis( x, reference, size ) {
	return ( x > reference ) && ( x < ( reference + size ) );
}

$.widget("ui.droppable", {
	version: "1.10.4",
	widgetEventPrefix: "drop",
	options: {
		accept: "*",
		activeClass: false,
		addClasses: true,
		greedy: false,
		hoverClass: false,
		scope: "default",
		tolerance: "intersect",

		// callbacks
		activate: null,
		deactivate: null,
		drop: null,
		out: null,
		over: null
	},
	_create: function() {

		var proportions,
			o = this.options,
			accept = o.accept;

		this.isover = false;
		this.isout = true;

		this.accept = $.isFunction(accept) ? accept : function(d) {
			return d.is(accept);
		};

		this.proportions = function( /* valueToWrite */ ) {
			if ( arguments.length ) {
				// Store the droppable's proportions
				proportions = arguments[ 0 ];
			} else {
				// Retrieve or derive the droppable's proportions
				return proportions ?
					proportions :
					proportions = {
						width: this.element[ 0 ].offsetWidth,
						height: this.element[ 0 ].offsetHeight
					};
			}
		};

		// Add the reference and positions to the manager
		$.ui.ddmanager.droppables[o.scope] = $.ui.ddmanager.droppables[o.scope] || [];
		$.ui.ddmanager.droppables[o.scope].push(this);

		(o.addClasses && this.element.addClass("ui-droppable"));

	},

	_destroy: function() {
		var i = 0,
			drop = $.ui.ddmanager.droppables[this.options.scope];

		for ( ; i < drop.length; i++ ) {
			if ( drop[i] === this ) {
				drop.splice(i, 1);
			}
		}

		this.element.removeClass("ui-droppable ui-droppable-disabled");
	},

	_setOption: function(key, value) {

		if(key === "accept") {
			this.accept = $.isFunction(value) ? value : function(d) {
				return d.is(value);
			};
		}
		$.Widget.prototype._setOption.apply(this, arguments);
	},

	_activate: function(event) {
		var draggable = $.ui.ddmanager.current;
		if(this.options.activeClass) {
			this.element.addClass(this.options.activeClass);
		}
		if(draggable){
			this._trigger("activate", event, this.ui(draggable));
		}
	},

	_deactivate: function(event) {
		var draggable = $.ui.ddmanager.current;
		if(this.options.activeClass) {
			this.element.removeClass(this.options.activeClass);
		}
		if(draggable){
			this._trigger("deactivate", event, this.ui(draggable));
		}
	},

	_over: function(event) {

		var draggable = $.ui.ddmanager.current;

		// Bail if draggable and droppable are same element
		if (!draggable || (draggable.currentItem || draggable.element)[0] === this.element[0]) {
			return;
		}

		if (this.accept.call(this.element[0],(draggable.currentItem || draggable.element))) {
			if(this.options.hoverClass) {
				this.element.addClass(this.options.hoverClass);
			}
			this._trigger("over", event, this.ui(draggable));
		}

	},

	_out: function(event) {

		var draggable = $.ui.ddmanager.current;

		// Bail if draggable and droppable are same element
		if (!draggable || (draggable.currentItem || draggable.element)[0] === this.element[0]) {
			return;
		}

		if (this.accept.call(this.element[0],(draggable.currentItem || draggable.element))) {
			if(this.options.hoverClass) {
				this.element.removeClass(this.options.hoverClass);
			}
			this._trigger("out", event, this.ui(draggable));
		}

	},

	_drop: function(event,custom) {

		var draggable = custom || $.ui.ddmanager.current,
			childrenIntersection = false;

		// Bail if draggable and droppable are same element
		if (!draggable || (draggable.currentItem || draggable.element)[0] === this.element[0]) {
			return false;
		}

		this.element.find(":data(ui-droppable)").not(".ui-draggable-dragging").each(function() {
			var inst = $.data(this, "ui-droppable");
			if(
				inst.options.greedy &&
				!inst.options.disabled &&
				inst.options.scope === draggable.options.scope &&
				inst.accept.call(inst.element[0], (draggable.currentItem || draggable.element)) &&
				$.ui.intersect(draggable, $.extend(inst, { offset: inst.element.offset() }), inst.options.tolerance)
			) { childrenIntersection = true; return false; }
		});
		if(childrenIntersection) {
			return false;
		}

		if(this.accept.call(this.element[0],(draggable.currentItem || draggable.element))) {
			if(this.options.activeClass) {
				this.element.removeClass(this.options.activeClass);
			}
			if(this.options.hoverClass) {
				this.element.removeClass(this.options.hoverClass);
			}
			this._trigger("drop", event, this.ui(draggable));
			return this.element;
		}

		return false;

	},

	ui: function(c) {
		return {
			draggable: (c.currentItem || c.element),
			helper: c.helper,
			position: c.position,
			offset: c.positionAbs
		};
	}

});

$.ui.intersect = function(draggable, droppable, toleranceMode) {

	if (!droppable.offset) {
		return false;
	}

	var draggableLeft, draggableTop,
		x1 = (draggable.positionAbs || draggable.position.absolute).left,
		y1 = (draggable.positionAbs || draggable.position.absolute).top,
		x2 = x1 + draggable.helperProportions.width,
		y2 = y1 + draggable.helperProportions.height,
		l = droppable.offset.left,
		t = droppable.offset.top,
		r = l + droppable.proportions().width,
		b = t + droppable.proportions().height;

	switch (toleranceMode) {
		case "fit":
			return (l <= x1 && x2 <= r && t <= y1 && y2 <= b);
		case "intersect":
			return (l < x1 + (draggable.helperProportions.width / 2) && // Right Half
				x2 - (draggable.helperProportions.width / 2) < r && // Left Half
				t < y1 + (draggable.helperProportions.height / 2) && // Bottom Half
				y2 - (draggable.helperProportions.height / 2) < b ); // Top Half
		case "pointer":
			draggableLeft = ((draggable.positionAbs || draggable.position.absolute).left + (draggable.clickOffset || draggable.offset.click).left);
			draggableTop = ((draggable.positionAbs || draggable.position.absolute).top + (draggable.clickOffset || draggable.offset.click).top);
			return isOverAxis( draggableTop, t, droppable.proportions().height ) && isOverAxis( draggableLeft, l, droppable.proportions().width );
		case "touch":
			return (
				(y1 >= t && y1 <= b) ||	// Top edge touching
				(y2 >= t && y2 <= b) ||	// Bottom edge touching
				(y1 < t && y2 > b)		// Surrounded vertically
			) && (
				(x1 >= l && x1 <= r) ||	// Left edge touching
				(x2 >= l && x2 <= r) ||	// Right edge touching
				(x1 < l && x2 > r)		// Surrounded horizontally
			);
		default:
			return false;
		}

};

/*
	This manager tracks offsets of draggables and droppables
*/
$.ui.ddmanager = {
	current: null,
	droppables: { "default": [] },
	prepareOffsets: function(t, event) {

		var i, j,
			m = $.ui.ddmanager.droppables[t.options.scope] || [],
			type = event ? event.type : null, // workaround for #2317
			list = (t.currentItem || t.element).find(":data(ui-droppable)").addBack();

		droppablesLoop: for (i = 0; i < m.length; i++) {

			//No disabled and non-accepted
			if(m[i].options.disabled || (t && !m[i].accept.call(m[i].element[0],(t.currentItem || t.element)))) {
				continue;
			}

			// Filter out elements in the current dragged item
			for (j=0; j < list.length; j++) {
				if(list[j] === m[i].element[0]) {
					m[i].proportions().height = 0;
					continue droppablesLoop;
				}
			}

			m[i].visible = m[i].element.css("display") !== "none";
			if(!m[i].visible) {
				continue;
			}

			//Activate the droppable if used directly from draggables
			if(type === "mousedown") {
				m[i]._activate.call(m[i], event);
			}

			m[ i ].offset = m[ i ].element.offset();
			m[ i ].proportions({ width: m[ i ].element[ 0 ].offsetWidth, height: m[ i ].element[ 0 ].offsetHeight });

		}

	},
	drop: function(draggable, event) {

		var dropped = false;
		// Create a copy of the droppables in case the list changes during the drop (#9116)
		$.each(($.ui.ddmanager.droppables[draggable.options.scope] || []).slice(), function() {

			if(!this.options) {
				return;
			}
			if (!this.options.disabled && this.visible && $.ui.intersect(draggable, this, this.options.tolerance)) {
				dropped = this._drop.call(this, event) || dropped;
			}

			if (!this.options.disabled && this.visible && this.accept.call(this.element[0],(draggable.currentItem || draggable.element))) {
				this.isout = true;
				this.isover = false;
				this._deactivate.call(this, event);
			}

		});
		return dropped;

	},
	dragStart: function( draggable, event ) {
		//Listen for scrolling so that if the dragging causes scrolling the position of the droppables can be recalculated (see #5003)
		draggable.element.parentsUntil( "body" ).bind( "scroll.droppable", function() {
			if( !draggable.options.refreshPositions ) {
				$.ui.ddmanager.prepareOffsets( draggable, event );
			}
		});
	},
	drag: function(draggable, event) {

		//If you have a highly dynamic page, you might try this option. It renders positions every time you move the mouse.
		if(draggable.options.refreshPositions) {
			$.ui.ddmanager.prepareOffsets(draggable, event);
		}

		//Run through all droppables and check their positions based on specific tolerance options
		$.each($.ui.ddmanager.droppables[draggable.options.scope] || [], function() {

			if(this.options.disabled || this.greedyChild || !this.visible) {
				return;
			}

			var parentInstance, scope, parent,
				intersects = $.ui.intersect(draggable, this, this.options.tolerance),
				c = !intersects && this.isover ? "isout" : (intersects && !this.isover ? "isover" : null);
			if(!c) {
				return;
			}

			if (this.options.greedy) {
				// find droppable parents with same scope
				scope = this.options.scope;
				parent = this.element.parents(":data(ui-droppable)").filter(function () {
					return $.data(this, "ui-droppable").options.scope === scope;
				});

				if (parent.length) {
					parentInstance = $.data(parent[0], "ui-droppable");
					parentInstance.greedyChild = (c === "isover");
				}
			}

			// we just moved into a greedy child
			if (parentInstance && c === "isover") {
				parentInstance.isover = false;
				parentInstance.isout = true;
				parentInstance._out.call(parentInstance, event);
			}

			this[c] = true;
			this[c === "isout" ? "isover" : "isout"] = false;
			this[c === "isover" ? "_over" : "_out"].call(this, event);

			// we just moved out of a greedy child
			if (parentInstance && c === "isout") {
				parentInstance.isout = false;
				parentInstance.isover = true;
				parentInstance._over.call(parentInstance, event);
			}
		});

	},
	dragStop: function( draggable, event ) {
		draggable.element.parentsUntil( "body" ).unbind( "scroll.droppable" );
		//Call prepareOffsets one final time since IE does not fire return scroll events when overflow was caused by drag (see #5003)
		if( !draggable.options.refreshPositions ) {
			$.ui.ddmanager.prepareOffsets( draggable, event );
		}
	}
};

})(jQuery);
(function( $, undefined ) {

function isOverAxis( x, reference, size ) {
	return ( x > reference ) && ( x < ( reference + size ) );
}

function isFloating(item) {
	return (/left|right/).test(item.css("float")) || (/inline|table-cell/).test(item.css("display"));
}

$.widget("ui.sortable", $.ui.mouse, {
	version: "1.10.4",
	widgetEventPrefix: "sort",
	ready: false,
	options: {
		appendTo: "parent",
		axis: false,
		connectWith: false,
		containment: false,
		cursor: "auto",
		cursorAt: false,
		dropOnEmpty: true,
		forcePlaceholderSize: false,
		forceHelperSize: false,
		grid: false,
		handle: false,
		helper: "original",
		items: "> *",
		opacity: false,
		placeholder: false,
		revert: false,
		scroll: true,
		scrollSensitivity: 20,
		scrollSpeed: 20,
		scope: "default",
		tolerance: "intersect",
		zIndex: 1000,

		// callbacks
		activate: null,
		beforeStop: null,
		change: null,
		deactivate: null,
		out: null,
		over: null,
		receive: null,
		remove: null,
		sort: null,
		start: null,
		stop: null,
		update: null
	},
	_create: function() {

		var o = this.options;
		this.containerCache = {};
		this.element.addClass("ui-sortable");

		//Get the items
		this.refresh();

		//Let's determine if the items are being displayed horizontally
		this.floating = this.items.length ? o.axis === "x" || isFloating(this.items[0].item) : false;

		//Let's determine the parent's offset
		this.offset = this.element.offset();

		//Initialize mouse events for interaction
		this._mouseInit();

		//We're ready to go
		this.ready = true;

	},

	_destroy: function() {
		this.element
			.removeClass("ui-sortable ui-sortable-disabled");
		this._mouseDestroy();

		for ( var i = this.items.length - 1; i >= 0; i-- ) {
			this.items[i].item.removeData(this.widgetName + "-item");
		}

		return this;
	},

	_setOption: function(key, value){
		if ( key === "disabled" ) {
			this.options[ key ] = value;

			this.widget().toggleClass( "ui-sortable-disabled", !!value );
		} else {
			// Don't call widget base _setOption for disable as it adds ui-state-disabled class
			$.Widget.prototype._setOption.apply(this, arguments);
		}
	},

	_mouseCapture: function(event, overrideHandle) {
		var currentItem = null,
			validHandle = false,
			that = this;

		if (this.reverting) {
			return false;
		}

		if(this.options.disabled || this.options.type === "static") {
			return false;
		}

		//We have to refresh the items data once first
		this._refreshItems(event);

		//Find out if the clicked node (or one of its parents) is a actual item in this.items
		$(event.target).parents().each(function() {
			if($.data(this, that.widgetName + "-item") === that) {
				currentItem = $(this);
				return false;
			}
		});
		if($.data(event.target, that.widgetName + "-item") === that) {
			currentItem = $(event.target);
		}

		if(!currentItem) {
			return false;
		}
		if(this.options.handle && !overrideHandle) {
			$(this.options.handle, currentItem).find("*").addBack().each(function() {
				if(this === event.target) {
					validHandle = true;
				}
			});
			if(!validHandle) {
				return false;
			}
		}

		this.currentItem = currentItem;
		this._removeCurrentsFromItems();
		return true;

	},

	_mouseStart: function(event, overrideHandle, noActivation) {

		var i, body,
			o = this.options;

		this.currentContainer = this;

		//We only need to call refreshPositions, because the refreshItems call has been moved to mouseCapture
		this.refreshPositions();

		//Create and append the visible helper
		this.helper = this._createHelper(event);

		//Cache the helper size
		this._cacheHelperProportions();

		/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */

		//Cache the margins of the original element
		this._cacheMargins();

		//Get the next scrolling parent
		this.scrollParent = this.helper.scrollParent();

		//The element's absolute position on the page minus margins
		this.offset = this.currentItem.offset();
		this.offset = {
			top: this.offset.top - this.margins.top,
			left: this.offset.left - this.margins.left
		};

		$.extend(this.offset, {
			click: { //Where the click happened, relative to the element
				left: event.pageX - this.offset.left,
				top: event.pageY - this.offset.top
			},
			parent: this._getParentOffset(),
			relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
		});

		// Only after we got the offset, we can change the helper's position to absolute
		// TODO: Still need to figure out a way to make relative sorting possible
		this.helper.css("position", "absolute");
		this.cssPosition = this.helper.css("position");

		//Generate the original position
		this.originalPosition = this._generatePosition(event);
		this.originalPageX = event.pageX;
		this.originalPageY = event.pageY;

		//Adjust the mouse offset relative to the helper if "cursorAt" is supplied
		(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

		//Cache the former DOM position
		this.domPosition = { prev: this.currentItem.prev()[0], parent: this.currentItem.parent()[0] };

		//If the helper is not the original, hide the original so it's not playing any role during the drag, won't cause anything bad this way
		if(this.helper[0] !== this.currentItem[0]) {
			this.currentItem.hide();
		}

		//Create the placeholder
		this._createPlaceholder();

		//Set a containment if given in the options
		if(o.containment) {
			this._setContainment();
		}

		if( o.cursor && o.cursor !== "auto" ) { // cursor option
			body = this.document.find( "body" );

			// support: IE
			this.storedCursor = body.css( "cursor" );
			body.css( "cursor", o.cursor );

			this.storedStylesheet = $( "<style>*{ cursor: "+o.cursor+" !important; }</style>" ).appendTo( body );
		}

		if(o.opacity) { // opacity option
			if (this.helper.css("opacity")) {
				this._storedOpacity = this.helper.css("opacity");
			}
			this.helper.css("opacity", o.opacity);
		}

		if(o.zIndex) { // zIndex option
			if (this.helper.css("zIndex")) {
				this._storedZIndex = this.helper.css("zIndex");
			}
			this.helper.css("zIndex", o.zIndex);
		}

		//Prepare scrolling
		if(this.scrollParent[0] !== document && this.scrollParent[0].tagName !== "HTML") {
			this.overflowOffset = this.scrollParent.offset();
		}

		//Call callbacks
		this._trigger("start", event, this._uiHash());

		//Recache the helper size
		if(!this._preserveHelperProportions) {
			this._cacheHelperProportions();
		}


		//Post "activate" events to possible containers
		if( !noActivation ) {
			for ( i = this.containers.length - 1; i >= 0; i-- ) {
				this.containers[ i ]._trigger( "activate", event, this._uiHash( this ) );
			}
		}

		//Prepare possible droppables
		if($.ui.ddmanager) {
			$.ui.ddmanager.current = this;
		}

		if ($.ui.ddmanager && !o.dropBehaviour) {
			$.ui.ddmanager.prepareOffsets(this, event);
		}

		this.dragging = true;

		this.helper.addClass("ui-sortable-helper");
		this._mouseDrag(event); //Execute the drag once - this causes the helper not to be visible before getting its correct position
		return true;

	},

	_mouseDrag: function(event) {
		var i, item, itemElement, intersection,
			o = this.options,
			scrolled = false;

		//Compute the helpers position
		this.position = this._generatePosition(event);
		this.positionAbs = this._convertPositionTo("absolute");

		if (!this.lastPositionAbs) {
			this.lastPositionAbs = this.positionAbs;
		}

		//Do scrolling
		if(this.options.scroll) {
			if(this.scrollParent[0] !== document && this.scrollParent[0].tagName !== "HTML") {

				if((this.overflowOffset.top + this.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity) {
					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop + o.scrollSpeed;
				} else if(event.pageY - this.overflowOffset.top < o.scrollSensitivity) {
					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop - o.scrollSpeed;
				}

				if((this.overflowOffset.left + this.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity) {
					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft + o.scrollSpeed;
				} else if(event.pageX - this.overflowOffset.left < o.scrollSensitivity) {
					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft - o.scrollSpeed;
				}

			} else {

				if(event.pageY - $(document).scrollTop() < o.scrollSensitivity) {
					scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
				} else if($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity) {
					scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);
				}

				if(event.pageX - $(document).scrollLeft() < o.scrollSensitivity) {
					scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
				} else if($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity) {
					scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);
				}

			}

			if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour) {
				$.ui.ddmanager.prepareOffsets(this, event);
			}
		}

		//Regenerate the absolute position used for position checks
		this.positionAbs = this._convertPositionTo("absolute");

		//Set the helper position
		if(!this.options.axis || this.options.axis !== "y") {
			this.helper[0].style.left = this.position.left+"px";
		}
		if(!this.options.axis || this.options.axis !== "x") {
			this.helper[0].style.top = this.position.top+"px";
		}

		//Rearrange
		for (i = this.items.length - 1; i >= 0; i--) {

			//Cache variables and intersection, continue if no intersection
			item = this.items[i];
			itemElement = item.item[0];
			intersection = this._intersectsWithPointer(item);
			if (!intersection) {
				continue;
			}

			// Only put the placeholder inside the current Container, skip all
			// items from other containers. This works because when moving
			// an item from one container to another the
			// currentContainer is switched before the placeholder is moved.
			//
			// Without this, moving items in "sub-sortables" can cause
			// the placeholder to jitter beetween the outer and inner container.
			if (item.instance !== this.currentContainer) {
				continue;
			}

			// cannot intersect with itself
			// no useless actions that have been done before
			// no action if the item moved is the parent of the item checked
			if (itemElement !== this.currentItem[0] &&
				this.placeholder[intersection === 1 ? "next" : "prev"]()[0] !== itemElement &&
				!$.contains(this.placeholder[0], itemElement) &&
				(this.options.type === "semi-dynamic" ? !$.contains(this.element[0], itemElement) : true)
			) {

				this.direction = intersection === 1 ? "down" : "up";

				if (this.options.tolerance === "pointer" || this._intersectsWithSides(item)) {
					this._rearrange(event, item);
				} else {
					break;
				}

				this._trigger("change", event, this._uiHash());
				break;
			}
		}

		//Post events to containers
		this._contactContainers(event);

		//Interconnect with droppables
		if($.ui.ddmanager) {
			$.ui.ddmanager.drag(this, event);
		}

		//Call callbacks
		this._trigger("sort", event, this._uiHash());

		this.lastPositionAbs = this.positionAbs;
		return false;

	},

	_mouseStop: function(event, noPropagation) {

		if(!event) {
			return;
		}

		//If we are using droppables, inform the manager about the drop
		if ($.ui.ddmanager && !this.options.dropBehaviour) {
			$.ui.ddmanager.drop(this, event);
		}

		if(this.options.revert) {
			var that = this,
				cur = this.placeholder.offset(),
				axis = this.options.axis,
				animation = {};

			if ( !axis || axis === "x" ) {
				animation.left = cur.left - this.offset.parent.left - this.margins.left + (this.offsetParent[0] === document.body ? 0 : this.offsetParent[0].scrollLeft);
			}
			if ( !axis || axis === "y" ) {
				animation.top = cur.top - this.offset.parent.top - this.margins.top + (this.offsetParent[0] === document.body ? 0 : this.offsetParent[0].scrollTop);
			}
			this.reverting = true;
			$(this.helper).animate( animation, parseInt(this.options.revert, 10) || 500, function() {
				that._clear(event);
			});
		} else {
			this._clear(event, noPropagation);
		}

		return false;

	},

	cancel: function() {

		if(this.dragging) {

			this._mouseUp({ target: null });

			if(this.options.helper === "original") {
				this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
			} else {
				this.currentItem.show();
			}

			//Post deactivating events to containers
			for (var i = this.containers.length - 1; i >= 0; i--){
				this.containers[i]._trigger("deactivate", null, this._uiHash(this));
				if(this.containers[i].containerCache.over) {
					this.containers[i]._trigger("out", null, this._uiHash(this));
					this.containers[i].containerCache.over = 0;
				}
			}

		}

		if (this.placeholder) {
			//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
			if(this.placeholder[0].parentNode) {
				this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
			}
			if(this.options.helper !== "original" && this.helper && this.helper[0].parentNode) {
				this.helper.remove();
			}

			$.extend(this, {
				helper: null,
				dragging: false,
				reverting: false,
				_noFinalSort: null
			});

			if(this.domPosition.prev) {
				$(this.domPosition.prev).after(this.currentItem);
			} else {
				$(this.domPosition.parent).prepend(this.currentItem);
			}
		}

		return this;

	},

	serialize: function(o) {

		var items = this._getItemsAsjQuery(o && o.connected),
			str = [];
		o = o || {};

		$(items).each(function() {
			var res = ($(o.item || this).attr(o.attribute || "id") || "").match(o.expression || (/(.+)[\-=_](.+)/));
			if (res) {
				str.push((o.key || res[1]+"[]")+"="+(o.key && o.expression ? res[1] : res[2]));
			}
		});

		if(!str.length && o.key) {
			str.push(o.key + "=");
		}

		return str.join("&");

	},

	toArray: function(o) {

		var items = this._getItemsAsjQuery(o && o.connected),
			ret = [];

		o = o || {};

		items.each(function() { ret.push($(o.item || this).attr(o.attribute || "id") || ""); });
		return ret;

	},

	/* Be careful with the following core functions */
	_intersectsWith: function(item) {

		var x1 = this.positionAbs.left,
			x2 = x1 + this.helperProportions.width,
			y1 = this.positionAbs.top,
			y2 = y1 + this.helperProportions.height,
			l = item.left,
			r = l + item.width,
			t = item.top,
			b = t + item.height,
			dyClick = this.offset.click.top,
			dxClick = this.offset.click.left,
			isOverElementHeight = ( this.options.axis === "x" ) || ( ( y1 + dyClick ) > t && ( y1 + dyClick ) < b ),
			isOverElementWidth = ( this.options.axis === "y" ) || ( ( x1 + dxClick ) > l && ( x1 + dxClick ) < r ),
			isOverElement = isOverElementHeight && isOverElementWidth;

		if ( this.options.tolerance === "pointer" ||
			this.options.forcePointerForContainers ||
			(this.options.tolerance !== "pointer" && this.helperProportions[this.floating ? "width" : "height"] > item[this.floating ? "width" : "height"])
		) {
			return isOverElement;
		} else {

			return (l < x1 + (this.helperProportions.width / 2) && // Right Half
				x2 - (this.helperProportions.width / 2) < r && // Left Half
				t < y1 + (this.helperProportions.height / 2) && // Bottom Half
				y2 - (this.helperProportions.height / 2) < b ); // Top Half

		}
	},

	_intersectsWithPointer: function(item) {

		var isOverElementHeight = (this.options.axis === "x") || isOverAxis(this.positionAbs.top + this.offset.click.top, item.top, item.height),
			isOverElementWidth = (this.options.axis === "y") || isOverAxis(this.positionAbs.left + this.offset.click.left, item.left, item.width),
			isOverElement = isOverElementHeight && isOverElementWidth,
			verticalDirection = this._getDragVerticalDirection(),
			horizontalDirection = this._getDragHorizontalDirection();

		if (!isOverElement) {
			return false;
		}

		return this.floating ?
			( ((horizontalDirection && horizontalDirection === "right") || verticalDirection === "down") ? 2 : 1 )
			: ( verticalDirection && (verticalDirection === "down" ? 2 : 1) );

	},

	_intersectsWithSides: function(item) {

		var isOverBottomHalf = isOverAxis(this.positionAbs.top + this.offset.click.top, item.top + (item.height/2), item.height),
			isOverRightHalf = isOverAxis(this.positionAbs.left + this.offset.click.left, item.left + (item.width/2), item.width),
			verticalDirection = this._getDragVerticalDirection(),
			horizontalDirection = this._getDragHorizontalDirection();

		if (this.floating && horizontalDirection) {
			return ((horizontalDirection === "right" && isOverRightHalf) || (horizontalDirection === "left" && !isOverRightHalf));
		} else {
			return verticalDirection && ((verticalDirection === "down" && isOverBottomHalf) || (verticalDirection === "up" && !isOverBottomHalf));
		}

	},

	_getDragVerticalDirection: function() {
		var delta = this.positionAbs.top - this.lastPositionAbs.top;
		return delta !== 0 && (delta > 0 ? "down" : "up");
	},

	_getDragHorizontalDirection: function() {
		var delta = this.positionAbs.left - this.lastPositionAbs.left;
		return delta !== 0 && (delta > 0 ? "right" : "left");
	},

	refresh: function(event) {
		this._refreshItems(event);
		this.refreshPositions();
		return this;
	},

	_connectWith: function() {
		var options = this.options;
		return options.connectWith.constructor === String ? [options.connectWith] : options.connectWith;
	},

	_getItemsAsjQuery: function(connected) {

		var i, j, cur, inst,
			items = [],
			queries = [],
			connectWith = this._connectWith();

		if(connectWith && connected) {
			for (i = connectWith.length - 1; i >= 0; i--){
				cur = $(connectWith[i]);
				for ( j = cur.length - 1; j >= 0; j--){
					inst = $.data(cur[j], this.widgetFullName);
					if(inst && inst !== this && !inst.options.disabled) {
						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element) : $(inst.options.items, inst.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), inst]);
					}
				}
			}
		}

		queries.push([$.isFunction(this.options.items) ? this.options.items.call(this.element, null, { options: this.options, item: this.currentItem }) : $(this.options.items, this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), this]);

		function addItems() {
			items.push( this );
		}
		for (i = queries.length - 1; i >= 0; i--){
			queries[i][0].each( addItems );
		}

		return $(items);

	},

	_removeCurrentsFromItems: function() {

		var list = this.currentItem.find(":data(" + this.widgetName + "-item)");

		this.items = $.grep(this.items, function (item) {
			for (var j=0; j < list.length; j++) {
				if(list[j] === item.item[0]) {
					return false;
				}
			}
			return true;
		});

	},

	_refreshItems: function(event) {

		this.items = [];
		this.containers = [this];

		var i, j, cur, inst, targetData, _queries, item, queriesLength,
			items = this.items,
			queries = [[$.isFunction(this.options.items) ? this.options.items.call(this.element[0], event, { item: this.currentItem }) : $(this.options.items, this.element), this]],
			connectWith = this._connectWith();

		if(connectWith && this.ready) { //Shouldn't be run the first time through due to massive slow-down
			for (i = connectWith.length - 1; i >= 0; i--){
				cur = $(connectWith[i]);
				for (j = cur.length - 1; j >= 0; j--){
					inst = $.data(cur[j], this.widgetFullName);
					if(inst && inst !== this && !inst.options.disabled) {
						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element[0], event, { item: this.currentItem }) : $(inst.options.items, inst.element), inst]);
						this.containers.push(inst);
					}
				}
			}
		}

		for (i = queries.length - 1; i >= 0; i--) {
			targetData = queries[i][1];
			_queries = queries[i][0];

			for (j=0, queriesLength = _queries.length; j < queriesLength; j++) {
				item = $(_queries[j]);

				item.data(this.widgetName + "-item", targetData); // Data for target checking (mouse manager)

				items.push({
					item: item,
					instance: targetData,
					width: 0, height: 0,
					left: 0, top: 0
				});
			}
		}

	},

	refreshPositions: function(fast) {

		//This has to be redone because due to the item being moved out/into the offsetParent, the offsetParent's position will change
		if(this.offsetParent && this.helper) {
			this.offset.parent = this._getParentOffset();
		}

		var i, item, t, p;

		for (i = this.items.length - 1; i >= 0; i--){
			item = this.items[i];

			//We ignore calculating positions of all connected containers when we're not over them
			if(item.instance !== this.currentContainer && this.currentContainer && item.item[0] !== this.currentItem[0]) {
				continue;
			}

			t = this.options.toleranceElement ? $(this.options.toleranceElement, item.item) : item.item;

			if (!fast) {
				item.width = t.outerWidth();
				item.height = t.outerHeight();
			}

			p = t.offset();
			item.left = p.left;
			item.top = p.top;
		}

		if(this.options.custom && this.options.custom.refreshContainers) {
			this.options.custom.refreshContainers.call(this);
		} else {
			for (i = this.containers.length - 1; i >= 0; i--){
				p = this.containers[i].element.offset();
				this.containers[i].containerCache.left = p.left;
				this.containers[i].containerCache.top = p.top;
				this.containers[i].containerCache.width	= this.containers[i].element.outerWidth();
				this.containers[i].containerCache.height = this.containers[i].element.outerHeight();
			}
		}

		return this;
	},

	_createPlaceholder: function(that) {
		that = that || this;
		var className,
			o = that.options;

		if(!o.placeholder || o.placeholder.constructor === String) {
			className = o.placeholder;
			o.placeholder = {
				element: function() {

					var nodeName = that.currentItem[0].nodeName.toLowerCase(),
						element = $( "<" + nodeName + ">", that.document[0] )
							.addClass(className || that.currentItem[0].className+" ui-sortable-placeholder")
							.removeClass("ui-sortable-helper");

					if ( nodeName === "tr" ) {
						that.currentItem.children().each(function() {
							$( "<td>&#160;</td>", that.document[0] )
								.attr( "colspan", $( this ).attr( "colspan" ) || 1 )
								.appendTo( element );
						});
					} else if ( nodeName === "img" ) {
						element.attr( "src", that.currentItem.attr( "src" ) );
					}

					if ( !className ) {
						element.css( "visibility", "hidden" );
					}

					return element;
				},
				update: function(container, p) {

					// 1. If a className is set as 'placeholder option, we don't force sizes - the class is responsible for that
					// 2. The option 'forcePlaceholderSize can be enabled to force it even if a class name is specified
					if(className && !o.forcePlaceholderSize) {
						return;
					}

					//If the element doesn't have a actual height by itself (without styles coming from a stylesheet), it receives the inline height from the dragged item
					if(!p.height()) { p.height(that.currentItem.innerHeight() - parseInt(that.currentItem.css("paddingTop")||0, 10) - parseInt(that.currentItem.css("paddingBottom")||0, 10)); }
					if(!p.width()) { p.width(that.currentItem.innerWidth() - parseInt(that.currentItem.css("paddingLeft")||0, 10) - parseInt(that.currentItem.css("paddingRight")||0, 10)); }
				}
			};
		}

		//Create the placeholder
		that.placeholder = $(o.placeholder.element.call(that.element, that.currentItem));

		//Append it after the actual current item
		that.currentItem.after(that.placeholder);

		//Update the size of the placeholder (TODO: Logic to fuzzy, see line 316/317)
		o.placeholder.update(that, that.placeholder);

	},

	_contactContainers: function(event) {
		var i, j, dist, itemWithLeastDistance, posProperty, sizeProperty, base, cur, nearBottom, floating,
			innermostContainer = null,
			innermostIndex = null;

		// get innermost container that intersects with item
		for (i = this.containers.length - 1; i >= 0; i--) {

			// never consider a container that's located within the item itself
			if($.contains(this.currentItem[0], this.containers[i].element[0])) {
				continue;
			}

			if(this._intersectsWith(this.containers[i].containerCache)) {

				// if we've already found a container and it's more "inner" than this, then continue
				if(innermostContainer && $.contains(this.containers[i].element[0], innermostContainer.element[0])) {
					continue;
				}

				innermostContainer = this.containers[i];
				innermostIndex = i;

			} else {
				// container doesn't intersect. trigger "out" event if necessary
				if(this.containers[i].containerCache.over) {
					this.containers[i]._trigger("out", event, this._uiHash(this));
					this.containers[i].containerCache.over = 0;
				}
			}

		}

		// if no intersecting containers found, return
		if(!innermostContainer) {
			return;
		}

		// move the item into the container if it's not there already
		if(this.containers.length === 1) {
			if (!this.containers[innermostIndex].containerCache.over) {
				this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
				this.containers[innermostIndex].containerCache.over = 1;
			}
		} else {

			//When entering a new container, we will find the item with the least distance and append our item near it
			dist = 10000;
			itemWithLeastDistance = null;
			floating = innermostContainer.floating || isFloating(this.currentItem);
			posProperty = floating ? "left" : "top";
			sizeProperty = floating ? "width" : "height";
			base = this.positionAbs[posProperty] + this.offset.click[posProperty];
			for (j = this.items.length - 1; j >= 0; j--) {
				if(!$.contains(this.containers[innermostIndex].element[0], this.items[j].item[0])) {
					continue;
				}
				if(this.items[j].item[0] === this.currentItem[0]) {
					continue;
				}
				if (floating && !isOverAxis(this.positionAbs.top + this.offset.click.top, this.items[j].top, this.items[j].height)) {
					continue;
				}
				cur = this.items[j].item.offset()[posProperty];
				nearBottom = false;
				if(Math.abs(cur - base) > Math.abs(cur + this.items[j][sizeProperty] - base)){
					nearBottom = true;
					cur += this.items[j][sizeProperty];
				}

				if(Math.abs(cur - base) < dist) {
					dist = Math.abs(cur - base); itemWithLeastDistance = this.items[j];
					this.direction = nearBottom ? "up": "down";
				}
			}

			//Check if dropOnEmpty is enabled
			if(!itemWithLeastDistance && !this.options.dropOnEmpty) {
				return;
			}

			if(this.currentContainer === this.containers[innermostIndex]) {
				return;
			}

			itemWithLeastDistance ? this._rearrange(event, itemWithLeastDistance, null, true) : this._rearrange(event, null, this.containers[innermostIndex].element, true);
			this._trigger("change", event, this._uiHash());
			this.containers[innermostIndex]._trigger("change", event, this._uiHash(this));
			this.currentContainer = this.containers[innermostIndex];

			//Update the placeholder
			this.options.placeholder.update(this.currentContainer, this.placeholder);

			this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
			this.containers[innermostIndex].containerCache.over = 1;
		}


	},

	_createHelper: function(event) {

		var o = this.options,
			helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event, this.currentItem])) : (o.helper === "clone" ? this.currentItem.clone() : this.currentItem);

		//Add the helper to the DOM if that didn't happen already
		if(!helper.parents("body").length) {
			$(o.appendTo !== "parent" ? o.appendTo : this.currentItem[0].parentNode)[0].appendChild(helper[0]);
		}

		if(helper[0] === this.currentItem[0]) {
			this._storedCSS = { width: this.currentItem[0].style.width, height: this.currentItem[0].style.height, position: this.currentItem.css("position"), top: this.currentItem.css("top"), left: this.currentItem.css("left") };
		}

		if(!helper[0].style.width || o.forceHelperSize) {
			helper.width(this.currentItem.width());
		}
		if(!helper[0].style.height || o.forceHelperSize) {
			helper.height(this.currentItem.height());
		}

		return helper;

	},

	_adjustOffsetFromHelper: function(obj) {
		if (typeof obj === "string") {
			obj = obj.split(" ");
		}
		if ($.isArray(obj)) {
			obj = {left: +obj[0], top: +obj[1] || 0};
		}
		if ("left" in obj) {
			this.offset.click.left = obj.left + this.margins.left;
		}
		if ("right" in obj) {
			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
		}
		if ("top" in obj) {
			this.offset.click.top = obj.top + this.margins.top;
		}
		if ("bottom" in obj) {
			this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
		}
	},

	_getParentOffset: function() {


		//Get the offsetParent and cache its position
		this.offsetParent = this.helper.offsetParent();
		var po = this.offsetParent.offset();

		// This is a special case where we need to modify a offset calculated on start, since the following happened:
		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
		if(this.cssPosition === "absolute" && this.scrollParent[0] !== document && $.contains(this.scrollParent[0], this.offsetParent[0])) {
			po.left += this.scrollParent.scrollLeft();
			po.top += this.scrollParent.scrollTop();
		}

		// This needs to be actually done for all browsers, since pageX/pageY includes this information
		// with an ugly IE fix
		if( this.offsetParent[0] === document.body || (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() === "html" && $.ui.ie)) {
			po = { top: 0, left: 0 };
		}

		return {
			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
		};

	},

	_getRelativeOffset: function() {

		if(this.cssPosition === "relative") {
			var p = this.currentItem.position();
			return {
				top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.scrollParent.scrollTop(),
				left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.scrollParent.scrollLeft()
			};
		} else {
			return { top: 0, left: 0 };
		}

	},

	_cacheMargins: function() {
		this.margins = {
			left: (parseInt(this.currentItem.css("marginLeft"),10) || 0),
			top: (parseInt(this.currentItem.css("marginTop"),10) || 0)
		};
	},

	_cacheHelperProportions: function() {
		this.helperProportions = {
			width: this.helper.outerWidth(),
			height: this.helper.outerHeight()
		};
	},

	_setContainment: function() {

		var ce, co, over,
			o = this.options;
		if(o.containment === "parent") {
			o.containment = this.helper[0].parentNode;
		}
		if(o.containment === "document" || o.containment === "window") {
			this.containment = [
				0 - this.offset.relative.left - this.offset.parent.left,
				0 - this.offset.relative.top - this.offset.parent.top,
				$(o.containment === "document" ? document : window).width() - this.helperProportions.width - this.margins.left,
				($(o.containment === "document" ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
			];
		}

		if(!(/^(document|window|parent)$/).test(o.containment)) {
			ce = $(o.containment)[0];
			co = $(o.containment).offset();
			over = ($(ce).css("overflow") !== "hidden");

			this.containment = [
				co.left + (parseInt($(ce).css("borderLeftWidth"),10) || 0) + (parseInt($(ce).css("paddingLeft"),10) || 0) - this.margins.left,
				co.top + (parseInt($(ce).css("borderTopWidth"),10) || 0) + (parseInt($(ce).css("paddingTop"),10) || 0) - this.margins.top,
				co.left+(over ? Math.max(ce.scrollWidth,ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"),10) || 0) - (parseInt($(ce).css("paddingRight"),10) || 0) - this.helperProportions.width - this.margins.left,
				co.top+(over ? Math.max(ce.scrollHeight,ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"),10) || 0) - (parseInt($(ce).css("paddingBottom"),10) || 0) - this.helperProportions.height - this.margins.top
			];
		}

	},

	_convertPositionTo: function(d, pos) {

		if(!pos) {
			pos = this.position;
		}
		var mod = d === "absolute" ? 1 : -1,
			scroll = this.cssPosition === "absolute" && !(this.scrollParent[0] !== document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent,
			scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		return {
			top: (
				pos.top	+																// The absolute mouse position
				this.offset.relative.top * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.top * mod -											// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ) * mod)
			),
			left: (
				pos.left +																// The absolute mouse position
				this.offset.relative.left * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.left * mod	-										// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ) * mod)
			)
		};

	},

	_generatePosition: function(event) {

		var top, left,
			o = this.options,
			pageX = event.pageX,
			pageY = event.pageY,
			scroll = this.cssPosition === "absolute" && !(this.scrollParent[0] !== document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		// This is another very weird special case that only happens for relative elements:
		// 1. If the css position is relative
		// 2. and the scroll parent is the document or similar to the offset parent
		// we have to refresh the relative offset during the scroll so there are no jumps
		if(this.cssPosition === "relative" && !(this.scrollParent[0] !== document && this.scrollParent[0] !== this.offsetParent[0])) {
			this.offset.relative = this._getRelativeOffset();
		}

		/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */

		if(this.originalPosition) { //If we are not dragging yet, we won't check for options

			if(this.containment) {
				if(event.pageX - this.offset.click.left < this.containment[0]) {
					pageX = this.containment[0] + this.offset.click.left;
				}
				if(event.pageY - this.offset.click.top < this.containment[1]) {
					pageY = this.containment[1] + this.offset.click.top;
				}
				if(event.pageX - this.offset.click.left > this.containment[2]) {
					pageX = this.containment[2] + this.offset.click.left;
				}
				if(event.pageY - this.offset.click.top > this.containment[3]) {
					pageY = this.containment[3] + this.offset.click.top;
				}
			}

			if(o.grid) {
				top = this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1];
				pageY = this.containment ? ( (top - this.offset.click.top >= this.containment[1] && top - this.offset.click.top <= this.containment[3]) ? top : ((top - this.offset.click.top >= this.containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

				left = this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0];
				pageX = this.containment ? ( (left - this.offset.click.left >= this.containment[0] && left - this.offset.click.left <= this.containment[2]) ? left : ((left - this.offset.click.left >= this.containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
			}

		}

		return {
			top: (
				pageY -																// The absolute mouse position
				this.offset.click.top -													// Click offset (relative to the element)
				this.offset.relative.top	-											// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.top +												// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ))
			),
			left: (
				pageX -																// The absolute mouse position
				this.offset.click.left -												// Click offset (relative to the element)
				this.offset.relative.left	-											// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.left +												// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ))
			)
		};

	},

	_rearrange: function(event, i, a, hardRefresh) {

		a ? a[0].appendChild(this.placeholder[0]) : i.item[0].parentNode.insertBefore(this.placeholder[0], (this.direction === "down" ? i.item[0] : i.item[0].nextSibling));

		//Various things done here to improve the performance:
		// 1. we create a setTimeout, that calls refreshPositions
		// 2. on the instance, we have a counter variable, that get's higher after every append
		// 3. on the local scope, we copy the counter variable, and check in the timeout, if it's still the same
		// 4. this lets only the last addition to the timeout stack through
		this.counter = this.counter ? ++this.counter : 1;
		var counter = this.counter;

		this._delay(function() {
			if(counter === this.counter) {
				this.refreshPositions(!hardRefresh); //Precompute after each DOM insertion, NOT on mousemove
			}
		});

	},

	_clear: function(event, noPropagation) {

		this.reverting = false;
		// We delay all events that have to be triggered to after the point where the placeholder has been removed and
		// everything else normalized again
		var i,
			delayedTriggers = [];

		// We first have to update the dom position of the actual currentItem
		// Note: don't do it if the current item is already removed (by a user), or it gets reappended (see #4088)
		if(!this._noFinalSort && this.currentItem.parent().length) {
			this.placeholder.before(this.currentItem);
		}
		this._noFinalSort = null;

		if(this.helper[0] === this.currentItem[0]) {
			for(i in this._storedCSS) {
				if(this._storedCSS[i] === "auto" || this._storedCSS[i] === "static") {
					this._storedCSS[i] = "";
				}
			}
			this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
		} else {
			this.currentItem.show();
		}

		if(this.fromOutside && !noPropagation) {
			delayedTriggers.push(function(event) { this._trigger("receive", event, this._uiHash(this.fromOutside)); });
		}
		if((this.fromOutside || this.domPosition.prev !== this.currentItem.prev().not(".ui-sortable-helper")[0] || this.domPosition.parent !== this.currentItem.parent()[0]) && !noPropagation) {
			delayedTriggers.push(function(event) { this._trigger("update", event, this._uiHash()); }); //Trigger update callback if the DOM position has changed
		}

		// Check if the items Container has Changed and trigger appropriate
		// events.
		if (this !== this.currentContainer) {
			if(!noPropagation) {
				delayedTriggers.push(function(event) { this._trigger("remove", event, this._uiHash()); });
				delayedTriggers.push((function(c) { return function(event) { c._trigger("receive", event, this._uiHash(this)); };  }).call(this, this.currentContainer));
				delayedTriggers.push((function(c) { return function(event) { c._trigger("update", event, this._uiHash(this));  }; }).call(this, this.currentContainer));
			}
		}


		//Post events to containers
		function delayEvent( type, instance, container ) {
			return function( event ) {
				container._trigger( type, event, instance._uiHash( instance ) );
			};
		}
		for (i = this.containers.length - 1; i >= 0; i--){
			if (!noPropagation) {
				delayedTriggers.push( delayEvent( "deactivate", this, this.containers[ i ] ) );
			}
			if(this.containers[i].containerCache.over) {
				delayedTriggers.push( delayEvent( "out", this, this.containers[ i ] ) );
				this.containers[i].containerCache.over = 0;
			}
		}

		//Do what was originally in plugins
		if ( this.storedCursor ) {
			this.document.find( "body" ).css( "cursor", this.storedCursor );
			this.storedStylesheet.remove();
		}
		if(this._storedOpacity) {
			this.helper.css("opacity", this._storedOpacity);
		}
		if(this._storedZIndex) {
			this.helper.css("zIndex", this._storedZIndex === "auto" ? "" : this._storedZIndex);
		}

		this.dragging = false;
		if(this.cancelHelperRemoval) {
			if(!noPropagation) {
				this._trigger("beforeStop", event, this._uiHash());
				for (i=0; i < delayedTriggers.length; i++) {
					delayedTriggers[i].call(this, event);
				} //Trigger all delayed events
				this._trigger("stop", event, this._uiHash());
			}

			this.fromOutside = false;
			return false;
		}

		if(!noPropagation) {
			this._trigger("beforeStop", event, this._uiHash());
		}

		//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
		this.placeholder[0].parentNode.removeChild(this.placeholder[0]);

		if(this.helper[0] !== this.currentItem[0]) {
			this.helper.remove();
		}
		this.helper = null;

		if(!noPropagation) {
			for (i=0; i < delayedTriggers.length; i++) {
				delayedTriggers[i].call(this, event);
			} //Trigger all delayed events
			this._trigger("stop", event, this._uiHash());
		}

		this.fromOutside = false;
		return true;

	},

	_trigger: function() {
		if ($.Widget.prototype._trigger.apply(this, arguments) === false) {
			this.cancel();
		}
	},

	_uiHash: function(_inst) {
		var inst = _inst || this;
		return {
			helper: inst.helper,
			placeholder: inst.placeholder || $([]),
			position: inst.position,
			originalPosition: inst.originalPosition,
			offset: inst.positionAbs,
			item: inst.currentItem,
			sender: _inst ? _inst.element : null
		};
	}

});

})(jQuery);
;(function(e,t){function i(t,i){var s,a,o,r=t.nodeName.toLowerCase();return"area"===r?(s=t.parentNode,a=s.name,t.href&&a&&"map"===s.nodeName.toLowerCase()?(o=e("img[usemap=#"+a+"]")[0],!!o&&n(o)):!1):(/input|select|textarea|button|object/.test(r)?!t.disabled:"a"===r?t.href||i:i)&&n(t)}function n(t){return e.expr.filters.visible(t)&&!e(t).parents().addBack().filter(function(){return"hidden"===e.css(this,"visibility")}).length}var s=0,a=/^ui-id-\d+$/;e.ui=e.ui||{},e.extend(e.ui,{version:"1.10.4",keyCode:{BACKSPACE:8,COMMA:188,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SPACE:32,TAB:9,UP:38}}),e.fn.extend({focus:function(t){return function(i,n){return"number"==typeof i?this.each(function(){var t=this;setTimeout(function(){e(t).focus(),n&&n.call(t)},i)}):t.apply(this,arguments)}}(e.fn.focus),scrollParent:function(){var t;return t=e.ui.ie&&/(static|relative)/.test(this.css("position"))||/absolute/.test(this.css("position"))?this.parents().filter(function(){return/(relative|absolute|fixed)/.test(e.css(this,"position"))&&/(auto|scroll)/.test(e.css(this,"overflow")+e.css(this,"overflow-y")+e.css(this,"overflow-x"))}).eq(0):this.parents().filter(function(){return/(auto|scroll)/.test(e.css(this,"overflow")+e.css(this,"overflow-y")+e.css(this,"overflow-x"))}).eq(0),/fixed/.test(this.css("position"))||!t.length?e(document):t},zIndex:function(i){if(i!==t)return this.css("zIndex",i);if(this.length)for(var n,s,a=e(this[0]);a.length&&a[0]!==document;){if(n=a.css("position"),("absolute"===n||"relative"===n||"fixed"===n)&&(s=parseInt(a.css("zIndex"),10),!isNaN(s)&&0!==s))return s;a=a.parent()}return 0},uniqueId:function(){return this.each(function(){this.id||(this.id="ui-id-"+ ++s)})},removeUniqueId:function(){return this.each(function(){a.test(this.id)&&e(this).removeAttr("id")})}}),e.extend(e.expr[":"],{data:e.expr.createPseudo?e.expr.createPseudo(function(t){return function(i){return!!e.data(i,t)}}):function(t,i,n){return!!e.data(t,n[3])},focusable:function(t){return i(t,!isNaN(e.attr(t,"tabindex")))},tabbable:function(t){var n=e.attr(t,"tabindex"),s=isNaN(n);return(s||n>=0)&&i(t,!s)}}),e("<a>").outerWidth(1).jquery||e.each(["Width","Height"],function(i,n){function s(t,i,n,s){return e.each(a,function(){i-=parseFloat(e.css(t,"padding"+this))||0,n&&(i-=parseFloat(e.css(t,"border"+this+"Width"))||0),s&&(i-=parseFloat(e.css(t,"margin"+this))||0)}),i}var a="Width"===n?["Left","Right"]:["Top","Bottom"],o=n.toLowerCase(),r={innerWidth:e.fn.innerWidth,innerHeight:e.fn.innerHeight,outerWidth:e.fn.outerWidth,outerHeight:e.fn.outerHeight};e.fn["inner"+n]=function(i){return i===t?r["inner"+n].call(this):this.each(function(){e(this).css(o,s(this,i)+"px")})},e.fn["outer"+n]=function(t,i){return"number"!=typeof t?r["outer"+n].call(this,t):this.each(function(){e(this).css(o,s(this,t,!0,i)+"px")})}}),e.fn.addBack||(e.fn.addBack=function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}),e("<a>").data("a-b","a").removeData("a-b").data("a-b")&&(e.fn.removeData=function(t){return function(i){return arguments.length?t.call(this,e.camelCase(i)):t.call(this)}}(e.fn.removeData)),e.ui.ie=!!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase()),e.support.selectstart="onselectstart"in document.createElement("div"),e.fn.extend({disableSelection:function(){return this.bind((e.support.selectstart?"selectstart":"mousedown")+".ui-disableSelection",function(e){e.preventDefault()})},enableSelection:function(){return this.unbind(".ui-disableSelection")}}),e.extend(e.ui,{plugin:{add:function(t,i,n){var s,a=e.ui[t].prototype;for(s in n)a.plugins[s]=a.plugins[s]||[],a.plugins[s].push([i,n[s]])},call:function(e,t,i){var n,s=e.plugins[t];if(s&&e.element[0].parentNode&&11!==e.element[0].parentNode.nodeType)for(n=0;s.length>n;n++)e.options[s[n][0]]&&s[n][1].apply(e.element,i)}},hasScroll:function(t,i){if("hidden"===e(t).css("overflow"))return!1;var n=i&&"left"===i?"scrollLeft":"scrollTop",s=!1;return t[n]>0?!0:(t[n]=1,s=t[n]>0,t[n]=0,s)}})})(jQuery);(function(t,e){var i=0,s=Array.prototype.slice,n=t.cleanData;t.cleanData=function(e){for(var i,s=0;null!=(i=e[s]);s++)try{t(i).triggerHandler("remove")}catch(o){}n(e)},t.widget=function(i,s,n){var o,a,r,h,l={},c=i.split(".")[0];i=i.split(".")[1],o=c+"-"+i,n||(n=s,s=t.Widget),t.expr[":"][o.toLowerCase()]=function(e){return!!t.data(e,o)},t[c]=t[c]||{},a=t[c][i],r=t[c][i]=function(t,i){return this._createWidget?(arguments.length&&this._createWidget(t,i),e):new r(t,i)},t.extend(r,a,{version:n.version,_proto:t.extend({},n),_childConstructors:[]}),h=new s,h.options=t.widget.extend({},h.options),t.each(n,function(i,n){return t.isFunction(n)?(l[i]=function(){var t=function(){return s.prototype[i].apply(this,arguments)},e=function(t){return s.prototype[i].apply(this,t)};return function(){var i,s=this._super,o=this._superApply;return this._super=t,this._superApply=e,i=n.apply(this,arguments),this._super=s,this._superApply=o,i}}(),e):(l[i]=n,e)}),r.prototype=t.widget.extend(h,{widgetEventPrefix:a?h.widgetEventPrefix||i:i},l,{constructor:r,namespace:c,widgetName:i,widgetFullName:o}),a?(t.each(a._childConstructors,function(e,i){var s=i.prototype;t.widget(s.namespace+"."+s.widgetName,r,i._proto)}),delete a._childConstructors):s._childConstructors.push(r),t.widget.bridge(i,r)},t.widget.extend=function(i){for(var n,o,a=s.call(arguments,1),r=0,h=a.length;h>r;r++)for(n in a[r])o=a[r][n],a[r].hasOwnProperty(n)&&o!==e&&(i[n]=t.isPlainObject(o)?t.isPlainObject(i[n])?t.widget.extend({},i[n],o):t.widget.extend({},o):o);return i},t.widget.bridge=function(i,n){var o=n.prototype.widgetFullName||i;t.fn[i]=function(a){var r="string"==typeof a,h=s.call(arguments,1),l=this;return a=!r&&h.length?t.widget.extend.apply(null,[a].concat(h)):a,r?this.each(function(){var s,n=t.data(this,o);return n?t.isFunction(n[a])&&"_"!==a.charAt(0)?(s=n[a].apply(n,h),s!==n&&s!==e?(l=s&&s.jquery?l.pushStack(s.get()):s,!1):e):t.error("no such method '"+a+"' for "+i+" widget instance"):t.error("cannot call methods on "+i+" prior to initialization; "+"attempted to call method '"+a+"'")}):this.each(function(){var e=t.data(this,o);e?e.option(a||{})._init():t.data(this,o,new n(a,this))}),l}},t.Widget=function(){},t.Widget._childConstructors=[],t.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",defaultElement:"<div>",options:{disabled:!1,create:null},_createWidget:function(e,s){s=t(s||this.defaultElement||this)[0],this.element=t(s),this.uuid=i++,this.eventNamespace="."+this.widgetName+this.uuid,this.options=t.widget.extend({},this.options,this._getCreateOptions(),e),this.bindings=t(),this.hoverable=t(),this.focusable=t(),s!==this&&(t.data(s,this.widgetFullName,this),this._on(!0,this.element,{remove:function(t){t.target===s&&this.destroy()}}),this.document=t(s.style?s.ownerDocument:s.document||s),this.window=t(this.document[0].defaultView||this.document[0].parentWindow)),this._create(),this._trigger("create",null,this._getCreateEventData()),this._init()},_getCreateOptions:t.noop,_getCreateEventData:t.noop,_create:t.noop,_init:t.noop,destroy:function(){this._destroy(),this.element.unbind(this.eventNamespace).removeData(this.widgetName).removeData(this.widgetFullName).removeData(t.camelCase(this.widgetFullName)),this.widget().unbind(this.eventNamespace).removeAttr("aria-disabled").removeClass(this.widgetFullName+"-disabled "+"ui-state-disabled"),this.bindings.unbind(this.eventNamespace),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")},_destroy:t.noop,widget:function(){return this.element},option:function(i,s){var n,o,a,r=i;if(0===arguments.length)return t.widget.extend({},this.options);if("string"==typeof i)if(r={},n=i.split("."),i=n.shift(),n.length){for(o=r[i]=t.widget.extend({},this.options[i]),a=0;n.length-1>a;a++)o[n[a]]=o[n[a]]||{},o=o[n[a]];if(i=n.pop(),1===arguments.length)return o[i]===e?null:o[i];o[i]=s}else{if(1===arguments.length)return this.options[i]===e?null:this.options[i];r[i]=s}return this._setOptions(r),this},_setOptions:function(t){var e;for(e in t)this._setOption(e,t[e]);return this},_setOption:function(t,e){return this.options[t]=e,"disabled"===t&&(this.widget().toggleClass(this.widgetFullName+"-disabled ui-state-disabled",!!e).attr("aria-disabled",e),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")),this},enable:function(){return this._setOption("disabled",!1)},disable:function(){return this._setOption("disabled",!0)},_on:function(i,s,n){var o,a=this;"boolean"!=typeof i&&(n=s,s=i,i=!1),n?(s=o=t(s),this.bindings=this.bindings.add(s)):(n=s,s=this.element,o=this.widget()),t.each(n,function(n,r){function h(){return i||a.options.disabled!==!0&&!t(this).hasClass("ui-state-disabled")?("string"==typeof r?a[r]:r).apply(a,arguments):e}"string"!=typeof r&&(h.guid=r.guid=r.guid||h.guid||t.guid++);var l=n.match(/^(\w+)\s*(.*)$/),c=l[1]+a.eventNamespace,u=l[2];u?o.delegate(u,c,h):s.bind(c,h)})},_off:function(t,e){e=(e||"").split(" ").join(this.eventNamespace+" ")+this.eventNamespace,t.unbind(e).undelegate(e)},_delay:function(t,e){function i(){return("string"==typeof t?s[t]:t).apply(s,arguments)}var s=this;return setTimeout(i,e||0)},_hoverable:function(e){this.hoverable=this.hoverable.add(e),this._on(e,{mouseenter:function(e){t(e.currentTarget).addClass("ui-state-hover")},mouseleave:function(e){t(e.currentTarget).removeClass("ui-state-hover")}})},_focusable:function(e){this.focusable=this.focusable.add(e),this._on(e,{focusin:function(e){t(e.currentTarget).addClass("ui-state-focus")},focusout:function(e){t(e.currentTarget).removeClass("ui-state-focus")}})},_trigger:function(e,i,s){var n,o,a=this.options[e];if(s=s||{},i=t.Event(i),i.type=(e===this.widgetEventPrefix?e:this.widgetEventPrefix+e).toLowerCase(),i.target=this.element[0],o=i.originalEvent)for(n in o)n in i||(i[n]=o[n]);return this.element.trigger(i,s),!(t.isFunction(a)&&a.apply(this.element[0],[i].concat(s))===!1||i.isDefaultPrevented())}},t.each({show:"fadeIn",hide:"fadeOut"},function(e,i){t.Widget.prototype["_"+e]=function(s,n,o){"string"==typeof n&&(n={effect:n});var a,r=n?n===!0||"number"==typeof n?i:n.effect||i:e;n=n||{},"number"==typeof n&&(n={duration:n}),a=!t.isEmptyObject(n),n.complete=o,n.delay&&s.delay(n.delay),a&&t.effects&&t.effects.effect[r]?s[e](n):r!==e&&s[r]?s[r](n.duration,n.easing,o):s.queue(function(i){t(this)[e](),o&&o.call(s[0]),i()})}})})(jQuery);(function(t){var e=!1;t(document).mouseup(function(){e=!1}),t.widget("ui.mouse",{version:"1.10.4",options:{cancel:"input,textarea,button,select,option",distance:1,delay:0},_mouseInit:function(){var e=this;this.element.bind("mousedown."+this.widgetName,function(t){return e._mouseDown(t)}).bind("click."+this.widgetName,function(i){return!0===t.data(i.target,e.widgetName+".preventClickEvent")?(t.removeData(i.target,e.widgetName+".preventClickEvent"),i.stopImmediatePropagation(),!1):undefined}),this.started=!1},_mouseDestroy:function(){this.element.unbind("."+this.widgetName),this._mouseMoveDelegate&&t(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate)},_mouseDown:function(i){if(!e){this._mouseStarted&&this._mouseUp(i),this._mouseDownEvent=i;var s=this,n=1===i.which,a="string"==typeof this.options.cancel&&i.target.nodeName?t(i.target).closest(this.options.cancel).length:!1;return n&&!a&&this._mouseCapture(i)?(this.mouseDelayMet=!this.options.delay,this.mouseDelayMet||(this._mouseDelayTimer=setTimeout(function(){s.mouseDelayMet=!0},this.options.delay)),this._mouseDistanceMet(i)&&this._mouseDelayMet(i)&&(this._mouseStarted=this._mouseStart(i)!==!1,!this._mouseStarted)?(i.preventDefault(),!0):(!0===t.data(i.target,this.widgetName+".preventClickEvent")&&t.removeData(i.target,this.widgetName+".preventClickEvent"),this._mouseMoveDelegate=function(t){return s._mouseMove(t)},this._mouseUpDelegate=function(t){return s._mouseUp(t)},t(document).bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate),i.preventDefault(),e=!0,!0)):!0}},_mouseMove:function(e){return t.ui.ie&&(!document.documentMode||9>document.documentMode)&&!e.button?this._mouseUp(e):this._mouseStarted?(this._mouseDrag(e),e.preventDefault()):(this._mouseDistanceMet(e)&&this._mouseDelayMet(e)&&(this._mouseStarted=this._mouseStart(this._mouseDownEvent,e)!==!1,this._mouseStarted?this._mouseDrag(e):this._mouseUp(e)),!this._mouseStarted)},_mouseUp:function(e){return t(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate),this._mouseStarted&&(this._mouseStarted=!1,e.target===this._mouseDownEvent.target&&t.data(e.target,this.widgetName+".preventClickEvent",!0),this._mouseStop(e)),!1},_mouseDistanceMet:function(t){return Math.max(Math.abs(this._mouseDownEvent.pageX-t.pageX),Math.abs(this._mouseDownEvent.pageY-t.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return!0}})})(jQuery);(function(t){t.widget("ui.draggable",t.ui.mouse,{version:"1.10.4",widgetEventPrefix:"drag",options:{addClasses:!0,appendTo:"parent",axis:!1,connectToSortable:!1,containment:!1,cursor:"auto",cursorAt:!1,grid:!1,handle:!1,helper:"original",iframeFix:!1,opacity:!1,refreshPositions:!1,revert:!1,revertDuration:500,scope:"default",scroll:!0,scrollSensitivity:20,scrollSpeed:20,snap:!1,snapMode:"both",snapTolerance:20,stack:!1,zIndex:!1,drag:null,start:null,stop:null},_create:function(){"original"!==this.options.helper||/^(?:r|a|f)/.test(this.element.css("position"))||(this.element[0].style.position="relative"),this.options.addClasses&&this.element.addClass("ui-draggable"),this.options.disabled&&this.element.addClass("ui-draggable-disabled"),this._mouseInit()},_destroy:function(){this.element.removeClass("ui-draggable ui-draggable-dragging ui-draggable-disabled"),this._mouseDestroy()},_mouseCapture:function(e){var i=this.options;return this.helper||i.disabled||t(e.target).closest(".ui-resizable-handle").length>0?!1:(this.handle=this._getHandle(e),this.handle?(t(i.iframeFix===!0?"iframe":i.iframeFix).each(function(){t("<div class='ui-draggable-iframeFix' style='background: #fff;'></div>").css({width:this.offsetWidth+"px",height:this.offsetHeight+"px",position:"absolute",opacity:"0.001",zIndex:1e3}).css(t(this).offset()).appendTo("body")}),!0):!1)},_mouseStart:function(e){var i=this.options;return this.helper=this._createHelper(e),this.helper.addClass("ui-draggable-dragging"),this._cacheHelperProportions(),t.ui.ddmanager&&(t.ui.ddmanager.current=this),this._cacheMargins(),this.cssPosition=this.helper.css("position"),this.scrollParent=this.helper.scrollParent(),this.offsetParent=this.helper.offsetParent(),this.offsetParentCssPosition=this.offsetParent.css("position"),this.offset=this.positionAbs=this.element.offset(),this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-this.margins.left},this.offset.scroll=!1,t.extend(this.offset,{click:{left:e.pageX-this.offset.left,top:e.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()}),this.originalPosition=this.position=this._generatePosition(e),this.originalPageX=e.pageX,this.originalPageY=e.pageY,i.cursorAt&&this._adjustOffsetFromHelper(i.cursorAt),this._setContainment(),this._trigger("start",e)===!1?(this._clear(),!1):(this._cacheHelperProportions(),t.ui.ddmanager&&!i.dropBehaviour&&t.ui.ddmanager.prepareOffsets(this,e),this._mouseDrag(e,!0),t.ui.ddmanager&&t.ui.ddmanager.dragStart(this,e),!0)},_mouseDrag:function(e,i){if("fixed"===this.offsetParentCssPosition&&(this.offset.parent=this._getParentOffset()),this.position=this._generatePosition(e),this.positionAbs=this._convertPositionTo("absolute"),!i){var s=this._uiHash();if(this._trigger("drag",e,s)===!1)return this._mouseUp({}),!1;this.position=s.position}return this.options.axis&&"y"===this.options.axis||(this.helper[0].style.left=this.position.left+"px"),this.options.axis&&"x"===this.options.axis||(this.helper[0].style.top=this.position.top+"px"),t.ui.ddmanager&&t.ui.ddmanager.drag(this,e),!1},_mouseStop:function(e){var i=this,s=!1;return t.ui.ddmanager&&!this.options.dropBehaviour&&(s=t.ui.ddmanager.drop(this,e)),this.dropped&&(s=this.dropped,this.dropped=!1),"original"!==this.options.helper||t.contains(this.element[0].ownerDocument,this.element[0])?("invalid"===this.options.revert&&!s||"valid"===this.options.revert&&s||this.options.revert===!0||t.isFunction(this.options.revert)&&this.options.revert.call(this.element,s)?t(this.helper).animate(this.originalPosition,parseInt(this.options.revertDuration,10),function(){i._trigger("stop",e)!==!1&&i._clear()}):this._trigger("stop",e)!==!1&&this._clear(),!1):!1},_mouseUp:function(e){return t("div.ui-draggable-iframeFix").each(function(){this.parentNode.removeChild(this)}),t.ui.ddmanager&&t.ui.ddmanager.dragStop(this,e),t.ui.mouse.prototype._mouseUp.call(this,e)},cancel:function(){return this.helper.is(".ui-draggable-dragging")?this._mouseUp({}):this._clear(),this},_getHandle:function(e){return this.options.handle?!!t(e.target).closest(this.element.find(this.options.handle)).length:!0},_createHelper:function(e){var i=this.options,s=t.isFunction(i.helper)?t(i.helper.apply(this.element[0],[e])):"clone"===i.helper?this.element.clone().removeAttr("id"):this.element;return s.parents("body").length||s.appendTo("parent"===i.appendTo?this.element[0].parentNode:i.appendTo),s[0]===this.element[0]||/(fixed|absolute)/.test(s.css("position"))||s.css("position","absolute"),s},_adjustOffsetFromHelper:function(e){"string"==typeof e&&(e=e.split(" ")),t.isArray(e)&&(e={left:+e[0],top:+e[1]||0}),"left"in e&&(this.offset.click.left=e.left+this.margins.left),"right"in e&&(this.offset.click.left=this.helperProportions.width-e.right+this.margins.left),"top"in e&&(this.offset.click.top=e.top+this.margins.top),"bottom"in e&&(this.offset.click.top=this.helperProportions.height-e.bottom+this.margins.top)},_getParentOffset:function(){var e=this.offsetParent.offset();return"absolute"===this.cssPosition&&this.scrollParent[0]!==document&&t.contains(this.scrollParent[0],this.offsetParent[0])&&(e.left+=this.scrollParent.scrollLeft(),e.top+=this.scrollParent.scrollTop()),(this.offsetParent[0]===document.body||this.offsetParent[0].tagName&&"html"===this.offsetParent[0].tagName.toLowerCase()&&t.ui.ie)&&(e={top:0,left:0}),{top:e.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:e.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if("relative"===this.cssPosition){var t=this.element.position();return{top:t.top-(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:t.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}return{top:0,left:0}},_cacheMargins:function(){this.margins={left:parseInt(this.element.css("marginLeft"),10)||0,top:parseInt(this.element.css("marginTop"),10)||0,right:parseInt(this.element.css("marginRight"),10)||0,bottom:parseInt(this.element.css("marginBottom"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var e,i,s,n=this.options;return n.containment?"window"===n.containment?(this.containment=[t(window).scrollLeft()-this.offset.relative.left-this.offset.parent.left,t(window).scrollTop()-this.offset.relative.top-this.offset.parent.top,t(window).scrollLeft()+t(window).width()-this.helperProportions.width-this.margins.left,t(window).scrollTop()+(t(window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top],undefined):"document"===n.containment?(this.containment=[0,0,t(document).width()-this.helperProportions.width-this.margins.left,(t(document).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top],undefined):n.containment.constructor===Array?(this.containment=n.containment,undefined):("parent"===n.containment&&(n.containment=this.helper[0].parentNode),i=t(n.containment),s=i[0],s&&(e="hidden"!==i.css("overflow"),this.containment=[(parseInt(i.css("borderLeftWidth"),10)||0)+(parseInt(i.css("paddingLeft"),10)||0),(parseInt(i.css("borderTopWidth"),10)||0)+(parseInt(i.css("paddingTop"),10)||0),(e?Math.max(s.scrollWidth,s.offsetWidth):s.offsetWidth)-(parseInt(i.css("borderRightWidth"),10)||0)-(parseInt(i.css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left-this.margins.right,(e?Math.max(s.scrollHeight,s.offsetHeight):s.offsetHeight)-(parseInt(i.css("borderBottomWidth"),10)||0)-(parseInt(i.css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top-this.margins.bottom],this.relative_container=i),undefined):(this.containment=null,undefined)},_convertPositionTo:function(e,i){i||(i=this.position);var s="absolute"===e?1:-1,n="absolute"!==this.cssPosition||this.scrollParent[0]!==document&&t.contains(this.scrollParent[0],this.offsetParent[0])?this.scrollParent:this.offsetParent;return this.offset.scroll||(this.offset.scroll={top:n.scrollTop(),left:n.scrollLeft()}),{top:i.top+this.offset.relative.top*s+this.offset.parent.top*s-("fixed"===this.cssPosition?-this.scrollParent.scrollTop():this.offset.scroll.top)*s,left:i.left+this.offset.relative.left*s+this.offset.parent.left*s-("fixed"===this.cssPosition?-this.scrollParent.scrollLeft():this.offset.scroll.left)*s}},_generatePosition:function(e){var i,s,n,a,o=this.options,r="absolute"!==this.cssPosition||this.scrollParent[0]!==document&&t.contains(this.scrollParent[0],this.offsetParent[0])?this.scrollParent:this.offsetParent,l=e.pageX,h=e.pageY;return this.offset.scroll||(this.offset.scroll={top:r.scrollTop(),left:r.scrollLeft()}),this.originalPosition&&(this.containment&&(this.relative_container?(s=this.relative_container.offset(),i=[this.containment[0]+s.left,this.containment[1]+s.top,this.containment[2]+s.left,this.containment[3]+s.top]):i=this.containment,e.pageX-this.offset.click.left<i[0]&&(l=i[0]+this.offset.click.left),e.pageY-this.offset.click.top<i[1]&&(h=i[1]+this.offset.click.top),e.pageX-this.offset.click.left>i[2]&&(l=i[2]+this.offset.click.left),e.pageY-this.offset.click.top>i[3]&&(h=i[3]+this.offset.click.top)),o.grid&&(n=o.grid[1]?this.originalPageY+Math.round((h-this.originalPageY)/o.grid[1])*o.grid[1]:this.originalPageY,h=i?n-this.offset.click.top>=i[1]||n-this.offset.click.top>i[3]?n:n-this.offset.click.top>=i[1]?n-o.grid[1]:n+o.grid[1]:n,a=o.grid[0]?this.originalPageX+Math.round((l-this.originalPageX)/o.grid[0])*o.grid[0]:this.originalPageX,l=i?a-this.offset.click.left>=i[0]||a-this.offset.click.left>i[2]?a:a-this.offset.click.left>=i[0]?a-o.grid[0]:a+o.grid[0]:a)),{top:h-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+("fixed"===this.cssPosition?-this.scrollParent.scrollTop():this.offset.scroll.top),left:l-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+("fixed"===this.cssPosition?-this.scrollParent.scrollLeft():this.offset.scroll.left)}},_clear:function(){this.helper.removeClass("ui-draggable-dragging"),this.helper[0]===this.element[0]||this.cancelHelperRemoval||this.helper.remove(),this.helper=null,this.cancelHelperRemoval=!1},_trigger:function(e,i,s){return s=s||this._uiHash(),t.ui.plugin.call(this,e,[i,s]),"drag"===e&&(this.positionAbs=this._convertPositionTo("absolute")),t.Widget.prototype._trigger.call(this,e,i,s)},plugins:{},_uiHash:function(){return{helper:this.helper,position:this.position,originalPosition:this.originalPosition,offset:this.positionAbs}}}),t.ui.plugin.add("draggable","connectToSortable",{start:function(e,i){var s=t(this).data("ui-draggable"),n=s.options,a=t.extend({},i,{item:s.element});s.sortables=[],t(n.connectToSortable).each(function(){var i=t.data(this,"ui-sortable");i&&!i.options.disabled&&(s.sortables.push({instance:i,shouldRevert:i.options.revert}),i.refreshPositions(),i._trigger("activate",e,a))})},stop:function(e,i){var s=t(this).data("ui-draggable"),n=t.extend({},i,{item:s.element});t.each(s.sortables,function(){this.instance.isOver?(this.instance.isOver=0,s.cancelHelperRemoval=!0,this.instance.cancelHelperRemoval=!1,this.shouldRevert&&(this.instance.options.revert=this.shouldRevert),this.instance._mouseStop(e),this.instance.options.helper=this.instance.options._helper,"original"===s.options.helper&&this.instance.currentItem.css({top:"auto",left:"auto"})):(this.instance.cancelHelperRemoval=!1,this.instance._trigger("deactivate",e,n))})},drag:function(e,i){var s=t(this).data("ui-draggable"),n=this;t.each(s.sortables,function(){var a=!1,o=this;this.instance.positionAbs=s.positionAbs,this.instance.helperProportions=s.helperProportions,this.instance.offset.click=s.offset.click,this.instance._intersectsWith(this.instance.containerCache)&&(a=!0,t.each(s.sortables,function(){return this.instance.positionAbs=s.positionAbs,this.instance.helperProportions=s.helperProportions,this.instance.offset.click=s.offset.click,this!==o&&this.instance._intersectsWith(this.instance.containerCache)&&t.contains(o.instance.element[0],this.instance.element[0])&&(a=!1),a})),a?(this.instance.isOver||(this.instance.isOver=1,this.instance.currentItem=t(n).clone().removeAttr("id").appendTo(this.instance.element).data("ui-sortable-item",!0),this.instance.options._helper=this.instance.options.helper,this.instance.options.helper=function(){return i.helper[0]},e.target=this.instance.currentItem[0],this.instance._mouseCapture(e,!0),this.instance._mouseStart(e,!0,!0),this.instance.offset.click.top=s.offset.click.top,this.instance.offset.click.left=s.offset.click.left,this.instance.offset.parent.left-=s.offset.parent.left-this.instance.offset.parent.left,this.instance.offset.parent.top-=s.offset.parent.top-this.instance.offset.parent.top,s._trigger("toSortable",e),s.dropped=this.instance.element,s.currentItem=s.element,this.instance.fromOutside=s),this.instance.currentItem&&this.instance._mouseDrag(e)):this.instance.isOver&&(this.instance.isOver=0,this.instance.cancelHelperRemoval=!0,this.instance.options.revert=!1,this.instance._trigger("out",e,this.instance._uiHash(this.instance)),this.instance._mouseStop(e,!0),this.instance.options.helper=this.instance.options._helper,this.instance.currentItem.remove(),this.instance.placeholder&&this.instance.placeholder.remove(),s._trigger("fromSortable",e),s.dropped=!1)})}}),t.ui.plugin.add("draggable","cursor",{start:function(){var e=t("body"),i=t(this).data("ui-draggable").options;e.css("cursor")&&(i._cursor=e.css("cursor")),e.css("cursor",i.cursor)},stop:function(){var e=t(this).data("ui-draggable").options;e._cursor&&t("body").css("cursor",e._cursor)}}),t.ui.plugin.add("draggable","opacity",{start:function(e,i){var s=t(i.helper),n=t(this).data("ui-draggable").options;s.css("opacity")&&(n._opacity=s.css("opacity")),s.css("opacity",n.opacity)},stop:function(e,i){var s=t(this).data("ui-draggable").options;s._opacity&&t(i.helper).css("opacity",s._opacity)}}),t.ui.plugin.add("draggable","scroll",{start:function(){var e=t(this).data("ui-draggable");e.scrollParent[0]!==document&&"HTML"!==e.scrollParent[0].tagName&&(e.overflowOffset=e.scrollParent.offset())},drag:function(e){var i=t(this).data("ui-draggable"),s=i.options,n=!1;i.scrollParent[0]!==document&&"HTML"!==i.scrollParent[0].tagName?(s.axis&&"x"===s.axis||(i.overflowOffset.top+i.scrollParent[0].offsetHeight-e.pageY<s.scrollSensitivity?i.scrollParent[0].scrollTop=n=i.scrollParent[0].scrollTop+s.scrollSpeed:e.pageY-i.overflowOffset.top<s.scrollSensitivity&&(i.scrollParent[0].scrollTop=n=i.scrollParent[0].scrollTop-s.scrollSpeed)),s.axis&&"y"===s.axis||(i.overflowOffset.left+i.scrollParent[0].offsetWidth-e.pageX<s.scrollSensitivity?i.scrollParent[0].scrollLeft=n=i.scrollParent[0].scrollLeft+s.scrollSpeed:e.pageX-i.overflowOffset.left<s.scrollSensitivity&&(i.scrollParent[0].scrollLeft=n=i.scrollParent[0].scrollLeft-s.scrollSpeed))):(s.axis&&"x"===s.axis||(e.pageY-t(document).scrollTop()<s.scrollSensitivity?n=t(document).scrollTop(t(document).scrollTop()-s.scrollSpeed):t(window).height()-(e.pageY-t(document).scrollTop())<s.scrollSensitivity&&(n=t(document).scrollTop(t(document).scrollTop()+s.scrollSpeed))),s.axis&&"y"===s.axis||(e.pageX-t(document).scrollLeft()<s.scrollSensitivity?n=t(document).scrollLeft(t(document).scrollLeft()-s.scrollSpeed):t(window).width()-(e.pageX-t(document).scrollLeft())<s.scrollSensitivity&&(n=t(document).scrollLeft(t(document).scrollLeft()+s.scrollSpeed)))),n!==!1&&t.ui.ddmanager&&!s.dropBehaviour&&t.ui.ddmanager.prepareOffsets(i,e)}}),t.ui.plugin.add("draggable","snap",{start:function(){var e=t(this).data("ui-draggable"),i=e.options;e.snapElements=[],t(i.snap.constructor!==String?i.snap.items||":data(ui-draggable)":i.snap).each(function(){var i=t(this),s=i.offset();this!==e.element[0]&&e.snapElements.push({item:this,width:i.outerWidth(),height:i.outerHeight(),top:s.top,left:s.left})})},drag:function(e,i){var s,n,a,o,r,l,h,c,u,d,p=t(this).data("ui-draggable"),g=p.options,f=g.snapTolerance,m=i.offset.left,_=m+p.helperProportions.width,v=i.offset.top,b=v+p.helperProportions.height;for(u=p.snapElements.length-1;u>=0;u--)r=p.snapElements[u].left,l=r+p.snapElements[u].width,h=p.snapElements[u].top,c=h+p.snapElements[u].height,r-f>_||m>l+f||h-f>b||v>c+f||!t.contains(p.snapElements[u].item.ownerDocument,p.snapElements[u].item)?(p.snapElements[u].snapping&&p.options.snap.release&&p.options.snap.release.call(p.element,e,t.extend(p._uiHash(),{snapItem:p.snapElements[u].item})),p.snapElements[u].snapping=!1):("inner"!==g.snapMode&&(s=f>=Math.abs(h-b),n=f>=Math.abs(c-v),a=f>=Math.abs(r-_),o=f>=Math.abs(l-m),s&&(i.position.top=p._convertPositionTo("relative",{top:h-p.helperProportions.height,left:0}).top-p.margins.top),n&&(i.position.top=p._convertPositionTo("relative",{top:c,left:0}).top-p.margins.top),a&&(i.position.left=p._convertPositionTo("relative",{top:0,left:r-p.helperProportions.width}).left-p.margins.left),o&&(i.position.left=p._convertPositionTo("relative",{top:0,left:l}).left-p.margins.left)),d=s||n||a||o,"outer"!==g.snapMode&&(s=f>=Math.abs(h-v),n=f>=Math.abs(c-b),a=f>=Math.abs(r-m),o=f>=Math.abs(l-_),s&&(i.position.top=p._convertPositionTo("relative",{top:h,left:0}).top-p.margins.top),n&&(i.position.top=p._convertPositionTo("relative",{top:c-p.helperProportions.height,left:0}).top-p.margins.top),a&&(i.position.left=p._convertPositionTo("relative",{top:0,left:r}).left-p.margins.left),o&&(i.position.left=p._convertPositionTo("relative",{top:0,left:l-p.helperProportions.width}).left-p.margins.left)),!p.snapElements[u].snapping&&(s||n||a||o||d)&&p.options.snap.snap&&p.options.snap.snap.call(p.element,e,t.extend(p._uiHash(),{snapItem:p.snapElements[u].item})),p.snapElements[u].snapping=s||n||a||o||d)}}),t.ui.plugin.add("draggable","stack",{start:function(){var e,i=this.data("ui-draggable").options,s=t.makeArray(t(i.stack)).sort(function(e,i){return(parseInt(t(e).css("zIndex"),10)||0)-(parseInt(t(i).css("zIndex"),10)||0)});s.length&&(e=parseInt(t(s[0]).css("zIndex"),10)||0,t(s).each(function(i){t(this).css("zIndex",e+i)}),this.css("zIndex",e+s.length))}}),t.ui.plugin.add("draggable","zIndex",{start:function(e,i){var s=t(i.helper),n=t(this).data("ui-draggable").options;s.css("zIndex")&&(n._zIndex=s.css("zIndex")),s.css("zIndex",n.zIndex)},stop:function(e,i){var s=t(this).data("ui-draggable").options;s._zIndex&&t(i.helper).css("zIndex",s._zIndex)}})})(jQuery);(function(t){function e(t,e,i){return t>e&&e+i>t}t.widget("ui.droppable",{version:"1.10.4",widgetEventPrefix:"drop",options:{accept:"*",activeClass:!1,addClasses:!0,greedy:!1,hoverClass:!1,scope:"default",tolerance:"intersect",activate:null,deactivate:null,drop:null,out:null,over:null},_create:function(){var e,i=this.options,s=i.accept;this.isover=!1,this.isout=!0,this.accept=t.isFunction(s)?s:function(t){return t.is(s)},this.proportions=function(){return arguments.length?(e=arguments[0],undefined):e?e:e={width:this.element[0].offsetWidth,height:this.element[0].offsetHeight}},t.ui.ddmanager.droppables[i.scope]=t.ui.ddmanager.droppables[i.scope]||[],t.ui.ddmanager.droppables[i.scope].push(this),i.addClasses&&this.element.addClass("ui-droppable")},_destroy:function(){for(var e=0,i=t.ui.ddmanager.droppables[this.options.scope];i.length>e;e++)i[e]===this&&i.splice(e,1);this.element.removeClass("ui-droppable ui-droppable-disabled")},_setOption:function(e,i){"accept"===e&&(this.accept=t.isFunction(i)?i:function(t){return t.is(i)}),t.Widget.prototype._setOption.apply(this,arguments)},_activate:function(e){var i=t.ui.ddmanager.current;this.options.activeClass&&this.element.addClass(this.options.activeClass),i&&this._trigger("activate",e,this.ui(i))},_deactivate:function(e){var i=t.ui.ddmanager.current;this.options.activeClass&&this.element.removeClass(this.options.activeClass),i&&this._trigger("deactivate",e,this.ui(i))},_over:function(e){var i=t.ui.ddmanager.current;i&&(i.currentItem||i.element)[0]!==this.element[0]&&this.accept.call(this.element[0],i.currentItem||i.element)&&(this.options.hoverClass&&this.element.addClass(this.options.hoverClass),this._trigger("over",e,this.ui(i)))},_out:function(e){var i=t.ui.ddmanager.current;i&&(i.currentItem||i.element)[0]!==this.element[0]&&this.accept.call(this.element[0],i.currentItem||i.element)&&(this.options.hoverClass&&this.element.removeClass(this.options.hoverClass),this._trigger("out",e,this.ui(i)))},_drop:function(e,i){var s=i||t.ui.ddmanager.current,n=!1;return s&&(s.currentItem||s.element)[0]!==this.element[0]?(this.element.find(":data(ui-droppable)").not(".ui-draggable-dragging").each(function(){var e=t.data(this,"ui-droppable");return e.options.greedy&&!e.options.disabled&&e.options.scope===s.options.scope&&e.accept.call(e.element[0],s.currentItem||s.element)&&t.ui.intersect(s,t.extend(e,{offset:e.element.offset()}),e.options.tolerance)?(n=!0,!1):undefined}),n?!1:this.accept.call(this.element[0],s.currentItem||s.element)?(this.options.activeClass&&this.element.removeClass(this.options.activeClass),this.options.hoverClass&&this.element.removeClass(this.options.hoverClass),this._trigger("drop",e,this.ui(s)),this.element):!1):!1},ui:function(t){return{draggable:t.currentItem||t.element,helper:t.helper,position:t.position,offset:t.positionAbs}}}),t.ui.intersect=function(t,i,s){if(!i.offset)return!1;var n,a,o=(t.positionAbs||t.position.absolute).left,r=(t.positionAbs||t.position.absolute).top,l=o+t.helperProportions.width,h=r+t.helperProportions.height,c=i.offset.left,u=i.offset.top,d=c+i.proportions().width,p=u+i.proportions().height;switch(s){case"fit":return o>=c&&d>=l&&r>=u&&p>=h;case"intersect":return o+t.helperProportions.width/2>c&&d>l-t.helperProportions.width/2&&r+t.helperProportions.height/2>u&&p>h-t.helperProportions.height/2;case"pointer":return n=(t.positionAbs||t.position.absolute).left+(t.clickOffset||t.offset.click).left,a=(t.positionAbs||t.position.absolute).top+(t.clickOffset||t.offset.click).top,e(a,u,i.proportions().height)&&e(n,c,i.proportions().width);case"touch":return(r>=u&&p>=r||h>=u&&p>=h||u>r&&h>p)&&(o>=c&&d>=o||l>=c&&d>=l||c>o&&l>d);default:return!1}},t.ui.ddmanager={current:null,droppables:{"default":[]},prepareOffsets:function(e,i){var s,n,a=t.ui.ddmanager.droppables[e.options.scope]||[],o=i?i.type:null,r=(e.currentItem||e.element).find(":data(ui-droppable)").addBack();t:for(s=0;a.length>s;s++)if(!(a[s].options.disabled||e&&!a[s].accept.call(a[s].element[0],e.currentItem||e.element))){for(n=0;r.length>n;n++)if(r[n]===a[s].element[0]){a[s].proportions().height=0;continue t}a[s].visible="none"!==a[s].element.css("display"),a[s].visible&&("mousedown"===o&&a[s]._activate.call(a[s],i),a[s].offset=a[s].element.offset(),a[s].proportions({width:a[s].element[0].offsetWidth,height:a[s].element[0].offsetHeight}))}},drop:function(e,i){var s=!1;return t.each((t.ui.ddmanager.droppables[e.options.scope]||[]).slice(),function(){this.options&&(!this.options.disabled&&this.visible&&t.ui.intersect(e,this,this.options.tolerance)&&(s=this._drop.call(this,i)||s),!this.options.disabled&&this.visible&&this.accept.call(this.element[0],e.currentItem||e.element)&&(this.isout=!0,this.isover=!1,this._deactivate.call(this,i)))}),s},dragStart:function(e,i){e.element.parentsUntil("body").bind("scroll.droppable",function(){e.options.refreshPositions||t.ui.ddmanager.prepareOffsets(e,i)})},drag:function(e,i){e.options.refreshPositions&&t.ui.ddmanager.prepareOffsets(e,i),t.each(t.ui.ddmanager.droppables[e.options.scope]||[],function(){if(!this.options.disabled&&!this.greedyChild&&this.visible){var s,n,a,o=t.ui.intersect(e,this,this.options.tolerance),r=!o&&this.isover?"isout":o&&!this.isover?"isover":null;r&&(this.options.greedy&&(n=this.options.scope,a=this.element.parents(":data(ui-droppable)").filter(function(){return t.data(this,"ui-droppable").options.scope===n}),a.length&&(s=t.data(a[0],"ui-droppable"),s.greedyChild="isover"===r)),s&&"isover"===r&&(s.isover=!1,s.isout=!0,s._out.call(s,i)),this[r]=!0,this["isout"===r?"isover":"isout"]=!1,this["isover"===r?"_over":"_out"].call(this,i),s&&"isout"===r&&(s.isout=!1,s.isover=!0,s._over.call(s,i)))}})},dragStop:function(e,i){e.element.parentsUntil("body").unbind("scroll.droppable"),e.options.refreshPositions||t.ui.ddmanager.prepareOffsets(e,i)}}})(jQuery);(function(t){function e(t,e,i){return t>e&&e+i>t}function i(t){return/left|right/.test(t.css("float"))||/inline|table-cell/.test(t.css("display"))}t.widget("ui.sortable",t.ui.mouse,{version:"1.10.4",widgetEventPrefix:"sort",ready:!1,options:{appendTo:"parent",axis:!1,connectWith:!1,containment:!1,cursor:"auto",cursorAt:!1,dropOnEmpty:!0,forcePlaceholderSize:!1,forceHelperSize:!1,grid:!1,handle:!1,helper:"original",items:"> *",opacity:!1,placeholder:!1,revert:!1,scroll:!0,scrollSensitivity:20,scrollSpeed:20,scope:"default",tolerance:"intersect",zIndex:1e3,activate:null,beforeStop:null,change:null,deactivate:null,out:null,over:null,receive:null,remove:null,sort:null,start:null,stop:null,update:null},_create:function(){var t=this.options;this.containerCache={},this.element.addClass("ui-sortable"),this.refresh(),this.floating=this.items.length?"x"===t.axis||i(this.items[0].item):!1,this.offset=this.element.offset(),this._mouseInit(),this.ready=!0},_destroy:function(){this.element.removeClass("ui-sortable ui-sortable-disabled"),this._mouseDestroy();for(var t=this.items.length-1;t>=0;t--)this.items[t].item.removeData(this.widgetName+"-item");return this},_setOption:function(e,i){"disabled"===e?(this.options[e]=i,this.widget().toggleClass("ui-sortable-disabled",!!i)):t.Widget.prototype._setOption.apply(this,arguments)},_mouseCapture:function(e,i){var s=null,n=!1,o=this;return this.reverting?!1:this.options.disabled||"static"===this.options.type?!1:(this._refreshItems(e),t(e.target).parents().each(function(){return t.data(this,o.widgetName+"-item")===o?(s=t(this),!1):undefined}),t.data(e.target,o.widgetName+"-item")===o&&(s=t(e.target)),s?!this.options.handle||i||(t(this.options.handle,s).find("*").addBack().each(function(){this===e.target&&(n=!0)}),n)?(this.currentItem=s,this._removeCurrentsFromItems(),!0):!1:!1)},_mouseStart:function(e,i,s){var n,o,a=this.options;if(this.currentContainer=this,this.refreshPositions(),this.helper=this._createHelper(e),this._cacheHelperProportions(),this._cacheMargins(),this.scrollParent=this.helper.scrollParent(),this.offset=this.currentItem.offset(),this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-this.margins.left},t.extend(this.offset,{click:{left:e.pageX-this.offset.left,top:e.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()}),this.helper.css("position","absolute"),this.cssPosition=this.helper.css("position"),this.originalPosition=this._generatePosition(e),this.originalPageX=e.pageX,this.originalPageY=e.pageY,a.cursorAt&&this._adjustOffsetFromHelper(a.cursorAt),this.domPosition={prev:this.currentItem.prev()[0],parent:this.currentItem.parent()[0]},this.helper[0]!==this.currentItem[0]&&this.currentItem.hide(),this._createPlaceholder(),a.containment&&this._setContainment(),a.cursor&&"auto"!==a.cursor&&(o=this.document.find("body"),this.storedCursor=o.css("cursor"),o.css("cursor",a.cursor),this.storedStylesheet=t("<style>*{ cursor: "+a.cursor+" !important; }</style>").appendTo(o)),a.opacity&&(this.helper.css("opacity")&&(this._storedOpacity=this.helper.css("opacity")),this.helper.css("opacity",a.opacity)),a.zIndex&&(this.helper.css("zIndex")&&(this._storedZIndex=this.helper.css("zIndex")),this.helper.css("zIndex",a.zIndex)),this.scrollParent[0]!==document&&"HTML"!==this.scrollParent[0].tagName&&(this.overflowOffset=this.scrollParent.offset()),this._trigger("start",e,this._uiHash()),this._preserveHelperProportions||this._cacheHelperProportions(),!s)for(n=this.containers.length-1;n>=0;n--)this.containers[n]._trigger("activate",e,this._uiHash(this));return t.ui.ddmanager&&(t.ui.ddmanager.current=this),t.ui.ddmanager&&!a.dropBehaviour&&t.ui.ddmanager.prepareOffsets(this,e),this.dragging=!0,this.helper.addClass("ui-sortable-helper"),this._mouseDrag(e),!0},_mouseDrag:function(e){var i,s,n,o,a=this.options,r=!1;for(this.position=this._generatePosition(e),this.positionAbs=this._convertPositionTo("absolute"),this.lastPositionAbs||(this.lastPositionAbs=this.positionAbs),this.options.scroll&&(this.scrollParent[0]!==document&&"HTML"!==this.scrollParent[0].tagName?(this.overflowOffset.top+this.scrollParent[0].offsetHeight-e.pageY<a.scrollSensitivity?this.scrollParent[0].scrollTop=r=this.scrollParent[0].scrollTop+a.scrollSpeed:e.pageY-this.overflowOffset.top<a.scrollSensitivity&&(this.scrollParent[0].scrollTop=r=this.scrollParent[0].scrollTop-a.scrollSpeed),this.overflowOffset.left+this.scrollParent[0].offsetWidth-e.pageX<a.scrollSensitivity?this.scrollParent[0].scrollLeft=r=this.scrollParent[0].scrollLeft+a.scrollSpeed:e.pageX-this.overflowOffset.left<a.scrollSensitivity&&(this.scrollParent[0].scrollLeft=r=this.scrollParent[0].scrollLeft-a.scrollSpeed)):(e.pageY-t(document).scrollTop()<a.scrollSensitivity?r=t(document).scrollTop(t(document).scrollTop()-a.scrollSpeed):t(window).height()-(e.pageY-t(document).scrollTop())<a.scrollSensitivity&&(r=t(document).scrollTop(t(document).scrollTop()+a.scrollSpeed)),e.pageX-t(document).scrollLeft()<a.scrollSensitivity?r=t(document).scrollLeft(t(document).scrollLeft()-a.scrollSpeed):t(window).width()-(e.pageX-t(document).scrollLeft())<a.scrollSensitivity&&(r=t(document).scrollLeft(t(document).scrollLeft()+a.scrollSpeed))),r!==!1&&t.ui.ddmanager&&!a.dropBehaviour&&t.ui.ddmanager.prepareOffsets(this,e)),this.positionAbs=this._convertPositionTo("absolute"),this.options.axis&&"y"===this.options.axis||(this.helper[0].style.left=this.position.left+"px"),this.options.axis&&"x"===this.options.axis||(this.helper[0].style.top=this.position.top+"px"),i=this.items.length-1;i>=0;i--)if(s=this.items[i],n=s.item[0],o=this._intersectsWithPointer(s),o&&s.instance===this.currentContainer&&n!==this.currentItem[0]&&this.placeholder[1===o?"next":"prev"]()[0]!==n&&!t.contains(this.placeholder[0],n)&&("semi-dynamic"===this.options.type?!t.contains(this.element[0],n):!0)){if(this.direction=1===o?"down":"up","pointer"!==this.options.tolerance&&!this._intersectsWithSides(s))break;this._rearrange(e,s),this._trigger("change",e,this._uiHash());break}return this._contactContainers(e),t.ui.ddmanager&&t.ui.ddmanager.drag(this,e),this._trigger("sort",e,this._uiHash()),this.lastPositionAbs=this.positionAbs,!1},_mouseStop:function(e,i){if(e){if(t.ui.ddmanager&&!this.options.dropBehaviour&&t.ui.ddmanager.drop(this,e),this.options.revert){var s=this,n=this.placeholder.offset(),o=this.options.axis,a={};o&&"x"!==o||(a.left=n.left-this.offset.parent.left-this.margins.left+(this.offsetParent[0]===document.body?0:this.offsetParent[0].scrollLeft)),o&&"y"!==o||(a.top=n.top-this.offset.parent.top-this.margins.top+(this.offsetParent[0]===document.body?0:this.offsetParent[0].scrollTop)),this.reverting=!0,t(this.helper).animate(a,parseInt(this.options.revert,10)||500,function(){s._clear(e)})}else this._clear(e,i);return!1}},cancel:function(){if(this.dragging){this._mouseUp({target:null}),"original"===this.options.helper?this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper"):this.currentItem.show();for(var e=this.containers.length-1;e>=0;e--)this.containers[e]._trigger("deactivate",null,this._uiHash(this)),this.containers[e].containerCache.over&&(this.containers[e]._trigger("out",null,this._uiHash(this)),this.containers[e].containerCache.over=0)}return this.placeholder&&(this.placeholder[0].parentNode&&this.placeholder[0].parentNode.removeChild(this.placeholder[0]),"original"!==this.options.helper&&this.helper&&this.helper[0].parentNode&&this.helper.remove(),t.extend(this,{helper:null,dragging:!1,reverting:!1,_noFinalSort:null}),this.domPosition.prev?t(this.domPosition.prev).after(this.currentItem):t(this.domPosition.parent).prepend(this.currentItem)),this},serialize:function(e){var i=this._getItemsAsjQuery(e&&e.connected),s=[];return e=e||{},t(i).each(function(){var i=(t(e.item||this).attr(e.attribute||"id")||"").match(e.expression||/(.+)[\-=_](.+)/);i&&s.push((e.key||i[1]+"[]")+"="+(e.key&&e.expression?i[1]:i[2]))}),!s.length&&e.key&&s.push(e.key+"="),s.join("&")},toArray:function(e){var i=this._getItemsAsjQuery(e&&e.connected),s=[];return e=e||{},i.each(function(){s.push(t(e.item||this).attr(e.attribute||"id")||"")}),s},_intersectsWith:function(t){var e=this.positionAbs.left,i=e+this.helperProportions.width,s=this.positionAbs.top,n=s+this.helperProportions.height,o=t.left,a=o+t.width,r=t.top,h=r+t.height,l=this.offset.click.top,c=this.offset.click.left,u="x"===this.options.axis||s+l>r&&h>s+l,d="y"===this.options.axis||e+c>o&&a>e+c,p=u&&d;return"pointer"===this.options.tolerance||this.options.forcePointerForContainers||"pointer"!==this.options.tolerance&&this.helperProportions[this.floating?"width":"height"]>t[this.floating?"width":"height"]?p:e+this.helperProportions.width/2>o&&a>i-this.helperProportions.width/2&&s+this.helperProportions.height/2>r&&h>n-this.helperProportions.height/2},_intersectsWithPointer:function(t){var i="x"===this.options.axis||e(this.positionAbs.top+this.offset.click.top,t.top,t.height),s="y"===this.options.axis||e(this.positionAbs.left+this.offset.click.left,t.left,t.width),n=i&&s,o=this._getDragVerticalDirection(),a=this._getDragHorizontalDirection();return n?this.floating?a&&"right"===a||"down"===o?2:1:o&&("down"===o?2:1):!1},_intersectsWithSides:function(t){var i=e(this.positionAbs.top+this.offset.click.top,t.top+t.height/2,t.height),s=e(this.positionAbs.left+this.offset.click.left,t.left+t.width/2,t.width),n=this._getDragVerticalDirection(),o=this._getDragHorizontalDirection();return this.floating&&o?"right"===o&&s||"left"===o&&!s:n&&("down"===n&&i||"up"===n&&!i)},_getDragVerticalDirection:function(){var t=this.positionAbs.top-this.lastPositionAbs.top;return 0!==t&&(t>0?"down":"up")},_getDragHorizontalDirection:function(){var t=this.positionAbs.left-this.lastPositionAbs.left;return 0!==t&&(t>0?"right":"left")},refresh:function(t){return this._refreshItems(t),this.refreshPositions(),this},_connectWith:function(){var t=this.options;return t.connectWith.constructor===String?[t.connectWith]:t.connectWith},_getItemsAsjQuery:function(e){function i(){r.push(this)}var s,n,o,a,r=[],h=[],l=this._connectWith();if(l&&e)for(s=l.length-1;s>=0;s--)for(o=t(l[s]),n=o.length-1;n>=0;n--)a=t.data(o[n],this.widgetFullName),a&&a!==this&&!a.options.disabled&&h.push([t.isFunction(a.options.items)?a.options.items.call(a.element):t(a.options.items,a.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),a]);for(h.push([t.isFunction(this.options.items)?this.options.items.call(this.element,null,{options:this.options,item:this.currentItem}):t(this.options.items,this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),this]),s=h.length-1;s>=0;s--)h[s][0].each(i);return t(r)},_removeCurrentsFromItems:function(){var e=this.currentItem.find(":data("+this.widgetName+"-item)");this.items=t.grep(this.items,function(t){for(var i=0;e.length>i;i++)if(e[i]===t.item[0])return!1;return!0})},_refreshItems:function(e){this.items=[],this.containers=[this];var i,s,n,o,a,r,h,l,c=this.items,u=[[t.isFunction(this.options.items)?this.options.items.call(this.element[0],e,{item:this.currentItem}):t(this.options.items,this.element),this]],d=this._connectWith();if(d&&this.ready)for(i=d.length-1;i>=0;i--)for(n=t(d[i]),s=n.length-1;s>=0;s--)o=t.data(n[s],this.widgetFullName),o&&o!==this&&!o.options.disabled&&(u.push([t.isFunction(o.options.items)?o.options.items.call(o.element[0],e,{item:this.currentItem}):t(o.options.items,o.element),o]),this.containers.push(o));for(i=u.length-1;i>=0;i--)for(a=u[i][1],r=u[i][0],s=0,l=r.length;l>s;s++)h=t(r[s]),h.data(this.widgetName+"-item",a),c.push({item:h,instance:a,width:0,height:0,left:0,top:0})},refreshPositions:function(e){this.offsetParent&&this.helper&&(this.offset.parent=this._getParentOffset());var i,s,n,o;for(i=this.items.length-1;i>=0;i--)s=this.items[i],s.instance!==this.currentContainer&&this.currentContainer&&s.item[0]!==this.currentItem[0]||(n=this.options.toleranceElement?t(this.options.toleranceElement,s.item):s.item,e||(s.width=n.outerWidth(),s.height=n.outerHeight()),o=n.offset(),s.left=o.left,s.top=o.top);if(this.options.custom&&this.options.custom.refreshContainers)this.options.custom.refreshContainers.call(this);else for(i=this.containers.length-1;i>=0;i--)o=this.containers[i].element.offset(),this.containers[i].containerCache.left=o.left,this.containers[i].containerCache.top=o.top,this.containers[i].containerCache.width=this.containers[i].element.outerWidth(),this.containers[i].containerCache.height=this.containers[i].element.outerHeight();return this},_createPlaceholder:function(e){e=e||this;var i,s=e.options;s.placeholder&&s.placeholder.constructor!==String||(i=s.placeholder,s.placeholder={element:function(){var s=e.currentItem[0].nodeName.toLowerCase(),n=t("<"+s+">",e.document[0]).addClass(i||e.currentItem[0].className+" ui-sortable-placeholder").removeClass("ui-sortable-helper");return"tr"===s?e.currentItem.children().each(function(){t("<td>&#160;</td>",e.document[0]).attr("colspan",t(this).attr("colspan")||1).appendTo(n)}):"img"===s&&n.attr("src",e.currentItem.attr("src")),i||n.css("visibility","hidden"),n},update:function(t,n){(!i||s.forcePlaceholderSize)&&(n.height()||n.height(e.currentItem.innerHeight()-parseInt(e.currentItem.css("paddingTop")||0,10)-parseInt(e.currentItem.css("paddingBottom")||0,10)),n.width()||n.width(e.currentItem.innerWidth()-parseInt(e.currentItem.css("paddingLeft")||0,10)-parseInt(e.currentItem.css("paddingRight")||0,10)))}}),e.placeholder=t(s.placeholder.element.call(e.element,e.currentItem)),e.currentItem.after(e.placeholder),s.placeholder.update(e,e.placeholder)},_contactContainers:function(s){var n,o,a,r,h,l,c,u,d,p,f=null,g=null;for(n=this.containers.length-1;n>=0;n--)if(!t.contains(this.currentItem[0],this.containers[n].element[0]))if(this._intersectsWith(this.containers[n].containerCache)){if(f&&t.contains(this.containers[n].element[0],f.element[0]))continue;f=this.containers[n],g=n}else this.containers[n].containerCache.over&&(this.containers[n]._trigger("out",s,this._uiHash(this)),this.containers[n].containerCache.over=0);if(f)if(1===this.containers.length)this.containers[g].containerCache.over||(this.containers[g]._trigger("over",s,this._uiHash(this)),this.containers[g].containerCache.over=1);else{for(a=1e4,r=null,p=f.floating||i(this.currentItem),h=p?"left":"top",l=p?"width":"height",c=this.positionAbs[h]+this.offset.click[h],o=this.items.length-1;o>=0;o--)t.contains(this.containers[g].element[0],this.items[o].item[0])&&this.items[o].item[0]!==this.currentItem[0]&&(!p||e(this.positionAbs.top+this.offset.click.top,this.items[o].top,this.items[o].height))&&(u=this.items[o].item.offset()[h],d=!1,Math.abs(u-c)>Math.abs(u+this.items[o][l]-c)&&(d=!0,u+=this.items[o][l]),a>Math.abs(u-c)&&(a=Math.abs(u-c),r=this.items[o],this.direction=d?"up":"down"));if(!r&&!this.options.dropOnEmpty)return;if(this.currentContainer===this.containers[g])return;r?this._rearrange(s,r,null,!0):this._rearrange(s,null,this.containers[g].element,!0),this._trigger("change",s,this._uiHash()),this.containers[g]._trigger("change",s,this._uiHash(this)),this.currentContainer=this.containers[g],this.options.placeholder.update(this.currentContainer,this.placeholder),this.containers[g]._trigger("over",s,this._uiHash(this)),this.containers[g].containerCache.over=1}},_createHelper:function(e){var i=this.options,s=t.isFunction(i.helper)?t(i.helper.apply(this.element[0],[e,this.currentItem])):"clone"===i.helper?this.currentItem.clone():this.currentItem;return s.parents("body").length||t("parent"!==i.appendTo?i.appendTo:this.currentItem[0].parentNode)[0].appendChild(s[0]),s[0]===this.currentItem[0]&&(this._storedCSS={width:this.currentItem[0].style.width,height:this.currentItem[0].style.height,position:this.currentItem.css("position"),top:this.currentItem.css("top"),left:this.currentItem.css("left")}),(!s[0].style.width||i.forceHelperSize)&&s.width(this.currentItem.width()),(!s[0].style.height||i.forceHelperSize)&&s.height(this.currentItem.height()),s},_adjustOffsetFromHelper:function(e){"string"==typeof e&&(e=e.split(" ")),t.isArray(e)&&(e={left:+e[0],top:+e[1]||0}),"left"in e&&(this.offset.click.left=e.left+this.margins.left),"right"in e&&(this.offset.click.left=this.helperProportions.width-e.right+this.margins.left),"top"in e&&(this.offset.click.top=e.top+this.margins.top),"bottom"in e&&(this.offset.click.top=this.helperProportions.height-e.bottom+this.margins.top)},_getParentOffset:function(){this.offsetParent=this.helper.offsetParent();var e=this.offsetParent.offset();return"absolute"===this.cssPosition&&this.scrollParent[0]!==document&&t.contains(this.scrollParent[0],this.offsetParent[0])&&(e.left+=this.scrollParent.scrollLeft(),e.top+=this.scrollParent.scrollTop()),(this.offsetParent[0]===document.body||this.offsetParent[0].tagName&&"html"===this.offsetParent[0].tagName.toLowerCase()&&t.ui.ie)&&(e={top:0,left:0}),{top:e.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:e.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if("relative"===this.cssPosition){var t=this.currentItem.position();return{top:t.top-(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:t.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}return{top:0,left:0}},_cacheMargins:function(){this.margins={left:parseInt(this.currentItem.css("marginLeft"),10)||0,top:parseInt(this.currentItem.css("marginTop"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var e,i,s,n=this.options;"parent"===n.containment&&(n.containment=this.helper[0].parentNode),("document"===n.containment||"window"===n.containment)&&(this.containment=[0-this.offset.relative.left-this.offset.parent.left,0-this.offset.relative.top-this.offset.parent.top,t("document"===n.containment?document:window).width()-this.helperProportions.width-this.margins.left,(t("document"===n.containment?document:window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top]),/^(document|window|parent)$/.test(n.containment)||(e=t(n.containment)[0],i=t(n.containment).offset(),s="hidden"!==t(e).css("overflow"),this.containment=[i.left+(parseInt(t(e).css("borderLeftWidth"),10)||0)+(parseInt(t(e).css("paddingLeft"),10)||0)-this.margins.left,i.top+(parseInt(t(e).css("borderTopWidth"),10)||0)+(parseInt(t(e).css("paddingTop"),10)||0)-this.margins.top,i.left+(s?Math.max(e.scrollWidth,e.offsetWidth):e.offsetWidth)-(parseInt(t(e).css("borderLeftWidth"),10)||0)-(parseInt(t(e).css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left,i.top+(s?Math.max(e.scrollHeight,e.offsetHeight):e.offsetHeight)-(parseInt(t(e).css("borderTopWidth"),10)||0)-(parseInt(t(e).css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top])},_convertPositionTo:function(e,i){i||(i=this.position);var s="absolute"===e?1:-1,n="absolute"!==this.cssPosition||this.scrollParent[0]!==document&&t.contains(this.scrollParent[0],this.offsetParent[0])?this.scrollParent:this.offsetParent,o=/(html|body)/i.test(n[0].tagName);return{top:i.top+this.offset.relative.top*s+this.offset.parent.top*s-("fixed"===this.cssPosition?-this.scrollParent.scrollTop():o?0:n.scrollTop())*s,left:i.left+this.offset.relative.left*s+this.offset.parent.left*s-("fixed"===this.cssPosition?-this.scrollParent.scrollLeft():o?0:n.scrollLeft())*s}},_generatePosition:function(e){var i,s,n=this.options,o=e.pageX,a=e.pageY,r="absolute"!==this.cssPosition||this.scrollParent[0]!==document&&t.contains(this.scrollParent[0],this.offsetParent[0])?this.scrollParent:this.offsetParent,h=/(html|body)/i.test(r[0].tagName);return"relative"!==this.cssPosition||this.scrollParent[0]!==document&&this.scrollParent[0]!==this.offsetParent[0]||(this.offset.relative=this._getRelativeOffset()),this.originalPosition&&(this.containment&&(e.pageX-this.offset.click.left<this.containment[0]&&(o=this.containment[0]+this.offset.click.left),e.pageY-this.offset.click.top<this.containment[1]&&(a=this.containment[1]+this.offset.click.top),e.pageX-this.offset.click.left>this.containment[2]&&(o=this.containment[2]+this.offset.click.left),e.pageY-this.offset.click.top>this.containment[3]&&(a=this.containment[3]+this.offset.click.top)),n.grid&&(i=this.originalPageY+Math.round((a-this.originalPageY)/n.grid[1])*n.grid[1],a=this.containment?i-this.offset.click.top>=this.containment[1]&&i-this.offset.click.top<=this.containment[3]?i:i-this.offset.click.top>=this.containment[1]?i-n.grid[1]:i+n.grid[1]:i,s=this.originalPageX+Math.round((o-this.originalPageX)/n.grid[0])*n.grid[0],o=this.containment?s-this.offset.click.left>=this.containment[0]&&s-this.offset.click.left<=this.containment[2]?s:s-this.offset.click.left>=this.containment[0]?s-n.grid[0]:s+n.grid[0]:s)),{top:a-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+("fixed"===this.cssPosition?-this.scrollParent.scrollTop():h?0:r.scrollTop()),left:o-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+("fixed"===this.cssPosition?-this.scrollParent.scrollLeft():h?0:r.scrollLeft())}},_rearrange:function(t,e,i,s){i?i[0].appendChild(this.placeholder[0]):e.item[0].parentNode.insertBefore(this.placeholder[0],"down"===this.direction?e.item[0]:e.item[0].nextSibling),this.counter=this.counter?++this.counter:1;var n=this.counter;this._delay(function(){n===this.counter&&this.refreshPositions(!s)})},_clear:function(t,e){function i(t,e,i){return function(s){i._trigger(t,s,e._uiHash(e))}}this.reverting=!1;var s,n=[];if(!this._noFinalSort&&this.currentItem.parent().length&&this.placeholder.before(this.currentItem),this._noFinalSort=null,this.helper[0]===this.currentItem[0]){for(s in this._storedCSS)("auto"===this._storedCSS[s]||"static"===this._storedCSS[s])&&(this._storedCSS[s]="");this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper")}else this.currentItem.show();for(this.fromOutside&&!e&&n.push(function(t){this._trigger("receive",t,this._uiHash(this.fromOutside))}),!this.fromOutside&&this.domPosition.prev===this.currentItem.prev().not(".ui-sortable-helper")[0]&&this.domPosition.parent===this.currentItem.parent()[0]||e||n.push(function(t){this._trigger("update",t,this._uiHash())}),this!==this.currentContainer&&(e||(n.push(function(t){this._trigger("remove",t,this._uiHash())}),n.push(function(t){return function(e){t._trigger("receive",e,this._uiHash(this))}}.call(this,this.currentContainer)),n.push(function(t){return function(e){t._trigger("update",e,this._uiHash(this))}}.call(this,this.currentContainer)))),s=this.containers.length-1;s>=0;s--)e||n.push(i("deactivate",this,this.containers[s])),this.containers[s].containerCache.over&&(n.push(i("out",this,this.containers[s])),this.containers[s].containerCache.over=0);if(this.storedCursor&&(this.document.find("body").css("cursor",this.storedCursor),this.storedStylesheet.remove()),this._storedOpacity&&this.helper.css("opacity",this._storedOpacity),this._storedZIndex&&this.helper.css("zIndex","auto"===this._storedZIndex?"":this._storedZIndex),this.dragging=!1,this.cancelHelperRemoval){if(!e){for(this._trigger("beforeStop",t,this._uiHash()),s=0;n.length>s;s++)n[s].call(this,t);this._trigger("stop",t,this._uiHash())}return this.fromOutside=!1,!1}if(e||this._trigger("beforeStop",t,this._uiHash()),this.placeholder[0].parentNode.removeChild(this.placeholder[0]),this.helper[0]!==this.currentItem[0]&&this.helper.remove(),this.helper=null,!e){for(s=0;n.length>s;s++)n[s].call(this,t);this._trigger("stop",t,this._uiHash())}return this.fromOutside=!1,!0},_trigger:function(){t.Widget.prototype._trigger.apply(this,arguments)===!1&&this.cancel()},_uiHash:function(e){var i=e||this;return{helper:i.helper,placeholder:i.placeholder||t([]),position:i.position,originalPosition:i.originalPosition,offset:i.positionAbs,item:i.currentItem,sender:e?e.element:null}}})})(jQuery);;!function(a){function f(a,b){if(!(a.originalEvent.touches.length>1)){a.preventDefault();var c=a.originalEvent.changedTouches[0],d=document.createEvent("MouseEvents");d.initMouseEvent(b,!0,!0,window,1,c.screenX,c.screenY,c.clientX,c.clientY,!1,!1,!1,!1,0,null),a.target.dispatchEvent(d)}}if(a.support.touch="ontouchend"in document,a.support.touch){var e,b=a.ui.mouse.prototype,c=b._mouseInit,d=b._mouseDestroy;b._touchStart=function(a){var b=this;!e&&b._mouseCapture(a.originalEvent.changedTouches[0])&&(e=!0,b._touchMoved=!1,f(a,"mouseover"),f(a,"mousemove"),f(a,"mousedown"))},b._touchMove=function(a){e&&(this._touchMoved=!0,f(a,"mousemove"))},b._touchEnd=function(a){e&&(f(a,"mouseup"),f(a,"mouseout"),this._touchMoved||f(a,"click"),e=!1)},b._mouseInit=function(){var b=this;b.element.bind({touchstart:a.proxy(b,"_touchStart"),touchmove:a.proxy(b,"_touchMove"),touchend:a.proxy(b,"_touchEnd")}),c.call(b)},b._mouseDestroy=function(){var b=this;b.element.unbind({touchstart:a.proxy(b,"_touchStart"),touchmove:a.proxy(b,"_touchMove"),touchend:a.proxy(b,"_touchEnd")}),d.call(b)}}}(jQuery);;var app = angular.module('app', ['ngRoute', 'ngResource', 'ngSanitize', 'ui.bootstrap', 'dialogs', 'angular-growl', 'ngUtil']);

app.run(function() {

});

app.config(['growlProvider', function(growlProvider) {
	growlProvider.globalTimeToLive(5000);
}]);


;app
	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider
			// SignIn
			.when('/', {
				templateUrl: 'partials/signin/signin.html',
				controller: 'SignInCtrl',
				resolve: {
					authenticated: ['AuthenticationService', '$location', function onAuthenticated(AuthenticationService, $location) {
						if( AuthenticationService.isLoggedIn() ) {
							$location.path("dashboard");
						}
					}]
				}
			})
			// External Login
			.when('/loginExternal/:sessionId', {
				templateUrl: 'partials/signin/signin-external.html',
				controller: 'SignInExternalCtrl',
				resolve: {
					scopeInfo: ['$route', function onLoginExternal($route) {
						//console.log("resolving", $route.current.params, $route.current.params.sessionId);
						var sessionId = $route.current.params && $route.current.params.sessionId;
						return sessionId;
					}]
				}
			})
			// Signup/Registration
			.when('/signup', {
				templateUrl: 'partials/signup/signup.html',
				controller: 'SignUpCtrl'
			})
			//Message after 
			.when('/signupSucces', {
				templateUrl: 'partials/signup/success.html'
			})
			.when('/actfailed', {
				templateUrl: 'partials/signup/activation-failed.html'
			})
			.when('/dashboard', {
				templateUrl: 'partials/dashboard/dashboard.html',
				controller: 'DashboardCtrl',
				resolve: {
					authenticated: ['AuthenticationService', '$location', function onAuthenticated(AuthenticationService, $location) {
						if( !AuthenticationService.isLoggedIn() ) {
							$location.path("/");
						}
					}],
					userInfo: ['SessionStorageService', function onSession(SessionStorageService) {
						return SessionStorageService.getUserInfo();
					}],
					companies: ['CompanyService', function onCompanies(CompanyService) {
						return CompanyService.all();
					}]
				}
			})
			.when('/board/:accountId/:boardId/:showAll?', {
				templateUrl: 'partials/boards/board.html',
				controller: 'ViewBoardCtrl',
				resolve: {
					authenticated: ['AuthenticationService', '$location', function onAuthenticated(AuthenticationService, $location) {
						if( !AuthenticationService.isLoggedIn() ) {
							$location.path("/");
						}
					}],
					boardInfo: ['$route', 'BoardService', function onBoardInfo($route, BoardService) {
						var boardId = $route.current.params && $route.current.params.boardId;
						return BoardService.expand(boardId);
					}],
					boardListing: ['$route', 'CompanyService', function onBoard($route, CompanyService) {
						var accountId = $route.current.params && $route.current.params.accountId;
						return CompanyService.boards(accountId);
					}],
					accountInfo: ['$route', 'AccountService', function($route, AccountService) {
						var accountId = $route.current.params && $route.current.params.accountId;
						return AccountService.get(accountId);
					}],
					coyMembers: ['$route', 'CompanyService', function onCoyMembers($route, CompanyService) {
						var accountId = $route.current.params && $route.current.params.accountId;
						return CompanyService.members(accountId);
					}],
					boardMembers: ['$route', 'BoardMemberService', function onBoardMembers($route, BoardMemberService) {
						var boardId = $route.current.params && $route.current.params.boardId;
						return BoardMemberService.get(boardId);
					}],
					showAll: ['$route', function onBoardMembers($route) {
						return $route.current.params && $route.current.params.showAll;
					}],
					activities: ['$route', 'BoardService', 'CONFIG', function onActivities($route, BoardService, CONFIG) {
						var boardId = $route.current.params && $route.current.params.boardId;
						return BoardService.activity(boardId, {
							offset: 0,
							limit: CONFIG.ACTIVITY_PAGE_LIMIT,
							sort: 'activityDate',
							order: 'desc'
						});
					}]
				}
			})
			.when('/profile/:accountId/:id', {
				templateUrl: 'partials/profile/view-profile.html',
				controller: 'ProfileCtrl',
				resolve: {
					user: ['$route', 'MemberService', function onUser($route, MemberService){
						var userId = $route.current.params && $route.current.params.id;
						var accountId = $route.current.params && $route.current.params.accountId;
						return MemberService.get({accountId: accountId, id: userId});
					}]
				}
			})
			.when('/notifications', {
				templateUrl: 'partials/notification/notification.html',
				controller: 'NotificationCtrl',
				resolve: {
					notifications: ['NotificationService', 'CONFIG', function onNotification(NotificationService, CONFIG) {
						return NotificationService.all({
							offset: 0,
							limit: CONFIG.NOTIFICATION_PAGE_LIMIT,
							sort: 'createdDate',
							order: 'desc'
						});
					}]
				}
			})
			.when('/signout', {
				resolve: {
					clearSession: ['SessionStorageService','LocalStorageService', 'CONFIG', '$location', function onClearSession(SessionStorageService, LocalStorageService, CONFIG, $location) {
						var referrer = SessionStorageService.getReferrer();
						if(referrer) {
							window.location.href = CONFIG.CMS_URL;
						} else {
							$location.path("/");
						}
						LocalStorageService.clearLoginSession();
						SessionStorageService.clearUserSession();
					}]
				}
			})
			.otherwise({ redirectTo: '/' });
	}]);
;app
	.filter('characters', [function () {
		return function (input, chars, breakOnWord) {
			if (isNaN(chars)) return input;
			if (chars <= 0) return '';
			if (input && input.length > chars) {
				input = input.substring(0, chars);

				if (!breakOnWord) {
					var lastspace = input.lastIndexOf(' ');
					//get last space
					if (lastspace !== -1) {
						input = input.substr(0, lastspace);
					}
				}else{
					while(input.charAt(input.length-1) === ' '){
						input = input.substr(0, input.length -1);
					}
				}
				return input + '...';
			}
			return input;
		};
	}])
	.filter('words', [function () {
		return function (input, words) {
			if (isNaN(words)) return input;
			if (words <= 0) return '';
			if (input) {
				var inputWords = input.split(/\s+/);
				if (inputWords.length > words) {
					input = inputWords.slice(0, words).join(' ') + '...';
				}
			}
			return input;
		};
	}])
	.filter('activityMessage', [function () {
		return function (input) {
			var message = "";
			var hasInputName = (input.name && typeof input.name != "undefined");
			if(input.field){
				message = "{0} {1} {2} {3}".format(input.action, input.type, input.field, (hasInputName ? "of " + input.name : ""));
			}
			else{
				message = "{0} {1} {2}".format(input.action, input.type, (hasInputName ? input.name : ""));
			}
			return message;
		};
	}])
	.filter('filterByImage', [function () {
		return function (input) {
			var attachedImage = null;
			angular.forEach(input, function onEachAttached(attachment) {
				if( Util.isImage({name: attachment.relativePath}) && !attachedImage ) {
					attachedImage = attachment;
					return;
				}
			});
			return [attachedImage];
		};
	}])
	.filter('formatDate', ['$filter',function ($filter) {
		return function (input, format) {
			var date =input.replace('T',' ').replace('Z','').split('.')[0];
			return $filter('date')(date, format);
		};
	}])
;
;app.controller('AssignBoardMemberCtrl', ['$scope', '$timeout', 'BoardMemberService','UserService', function($scope, $timeout, BoardMemberService,UserService) {
	$scope.search = {};

	$scope.addBoardMember = function onAddBoardMember(memberId, role) {
		BoardMemberService.save($scope.boardInfo.id,{
			memberId: memberId,
			role: role
		}).then(function(resp){
			if(resp.success){
				$scope.members = $scope.members.findAndSet("userId",memberId,"boardRole", role);
				$scope.$broadcast("refreshMemberList");
				//console.log("Member successfully added to the board");
			}
		});
	}

	$scope.updateBoardMemberRole = function onUpdateBoardMemberRole(memberId, role) {
		return BoardMemberService.update($scope.boardInfo.id,{
			memberId: memberId,
			role: role
		}).then(function(resp){
			if(resp.success){
				$scope.members = $scope.members.findAndSet("userId",memberId,"boardRole", role);
				$scope.$broadcast("refreshMemberList");
				//console.log("Member successfully updated the role in the board");
			}
		});
	}

	$scope.removeBoardMember = function onRemoveBoardMember(memberId) {
		BoardMemberService.delete($scope.boardInfo.id,{ memberId: memberId})
		.then(function(resp){
			if(resp.success){
				$scope.members.findAndSet("userId",memberId,"boardRole", null);
				$scope.$broadcast("refreshMemberList");
				//console.log("Member removed from the board");
			}
		});
	}

	$scope.getAccessMatrix = function onGetAccessMatrix(projectRole, boardRole){
		return UserService.getAccessMatrix($scope.userInfo, projectRole, boardRole);
	}

	$scope.showManageMembers = function showManageMembers(){
		$scope.coyToggled = !$scope.coyToggled;
		$timeout(function(){
			$(".coy-members").css("display", $scope.coyToggled ? "block" : "none");
		}, 700);
	}

}]);
;app.controller('AssignCardMemberCtrl', ['$scope', '$rootScope', 'CardService', 'growl', function($scope, $rootScope, CardService, growl) {

	$scope.search = {};

	$scope.addCardMember = function onAddCardMember(memberId) {
		CardService
			.assignMember($scope.card.id, {memberId:memberId})
			.then(function onAssign(resp) {
				if(resp.success) {
					growl.addSuccessMessage(resp.message);
					$rootScope.$broadcast("card:updated", angular.extend({}, $scope.card, {assignedUsers:resp.data}));
					$scope.$broadcast("refreshMemberList");
				} else {
					growl.addErrorMessage(resp.message);
				}
			});
	}

	$scope.removeCardMember = function onRemoveCardMember(memberId) {
		CardService
			.unAssignMember($scope.card.id, {memberId:memberId})
			.then(function onUnAssign(resp) {
				if(resp.success) {
					growl.addSuccessMessage(resp.message);
					$rootScope.$broadcast("card:updated", angular.extend({}, $scope.card, {assignedUsers:resp.data}));
					$scope.$broadcast("refreshMemberList");
				} else {
					growl.addErrorMessage(resp.message);
				}
			});
	}

}]);
;app.controller('ForgotPasswordCtrl', ['$scope', '$modalInstance', 'data', '$dialogs', 'CONFIG', 'UserService', function($scope, $modalInstance, data, $dialogs, CONFIG, UserService) {

	$scope.user = {
		email: ""
	};

	$scope.save = function onSave() {
		UserService
			.passwordReset($scope.user)
			.then(function onResponse(resp) {
				if(resp.success){
					dialog = $dialogs.notify(CONFIG.APP_NAME, resp.message);
				}
				else {
					dialog = $dialogs.error(CONFIG.APP_NAME, resp.message);
				}
				$modalInstance.dismiss('canceled');
			});
	}

	$scope.cancel = function onCancel(){
		$modalInstance.dismiss('canceled');
	};

}]);;app.controller('HeaderCtrl', ['$rootScope', '$scope', '$timeout', 'CONFIG', 'AuthenticationService', 'NotificationService', function($rootScope, $scope, $timeout, CONFIG, AuthenticationService, NotificationService) {

	$scope.$on('header.authenticated', function(scope, data) {
		$scope.userInfo = data;
	});

	$rootScope.$on("userInfo:updated", function(events, userInfo) {
		$scope.getUnreadCount();
		$scope.userInfo = userInfo;
	});

	$scope.getUnreadCount = function onGetUnreadCount() {
		if(AuthenticationService.isLoggedIn()){
			NotificationService
				.getUnreadCount()
				.then(function onGet(resp) {
					$scope.unReadCount = resp.data;
					$timeout($scope.getUnreadCount, CONFIG.POLL_NOTIFICATION_UNREAD_COUNT);
					
				});
		}
	}

	$scope.getNewNotifications = function onGet() {

		NotificationService.all({
				offset: 0,
				limit: CONFIG.NOTIFICATION_POPOVER_LIMIT,
				sort: 'createdDate',
				order: 'desc'
			})
			.then(function(resp) {
				$scope.notifications = resp.data;
				if($scope.notifications.length) {
					$scope.setAsRead(resp.data);
				}
				
			});
	}

	$scope.setAsRead = function onSetAsRead(notifications) {
		var notificationIds = [];
		angular.forEach(notifications, function onEachNotification(notification) {
			if(notification.status === "NEW") {
				//console.log(notification.id);
				notificationIds.push(notification.id);
			}
		});

		NotificationService
			.setAsRead({ids:notificationIds})
			.then(function onSetRead() {
				$scope.unReadCount -= notificationIds.length;
			});
	}

	$rootScope.$on("notification:unread:update", function onUnread(event, notifications) {
		$scope.setAsRead(notifications);
	});

	if(AuthenticationService.isLoggedIn()) {
		$scope.getUnreadCount();
	}

}]);;app.controller('ProfileCtrl', ['$scope', '$rootScope', '$timeout', '$upload', '$dialogs', '$location', 'CONFIG', 'SessionStorageService', 'UserService', 'user', 'growl', 
	function($scope, $rootScope, $timeout, $upload, $dialogs, $location, CONFIG, SessionStorageService, UserService, user, growl) {

	$scope.detailsOn = true;
	$scope.emailOn = false;
	$scope.passwordOn = false;
	$scope.systemParams = CONFIG.SYS_PARAMS;
	var userInfo = SessionStorageService.getUserInfo();

	var mode = {VIEW:"VIEW", EDIT:"EDIT", ERROR:"ERROR"};
	$scope.mode = mode.ERROR;
	$scope.progress = new Array();

	if(user.success){
		$scope.profile = user.data;
		$scope.mode = mode.VIEW;
		if(SessionStorageService.getUserInfo().id == $scope.profile.id){
			$scope.mode = mode.EDIT;
		}
	}else{
		showNotificationMessage({
			success: false,
			message: user.message,
			show: true
		});
	}

	$scope.fileUpload = function onFileUpload($files){
		if($files.length ===  0) return;

		var index=0, file = $files[index];
		$scope.progress[index] = {
			percentage: 0,
			text:""
		};

		$upload.upload({
			url : 'user/{0}/saveAvatar'.format($scope.profile.id),
			method: 'POST',
			headers: {userId: userInfo.id, sessionId: userInfo.sessionId},
			data : {
				id : $scope.profile.id,
				filename: file.name,
				useDefault: false
			},
			file: file,
			fileFormDataName: 'filedata'
		}).then(function(response) {
			var resp = response.data;
			if(resp.success){
				$timeout(function(){
					$scope.profile.avatar = userInfo.avatar = resp.data.avatar;
					$scope.profile.useAvatar = userInfo.useAvatar = true;
					SessionStorageService.setUserInfo(userInfo);
					$scope.progress[index].text = "Uploaded successfully!";
					$rootScope.$broadcast("userInfo:updated", resp.data);
				}, 1500);
			}else{
				$scope.progress[index].text = "Uploaded failed.";
			}
		}, function() {
			$scope.progress[index].text = "Uploaded failed.";
		}, function(evt) {
			$scope.progress[index].percentage = parseInt(100.0 * evt.loaded / evt.total);
			if($scope.progress[index].percentage <= 99)
				$scope.progress[index].text = $scope.progress[index].percentage + "%";
		});
	}

	$scope.updateDetails = function onUpdateDetails() {

		// Update full name and initials
		UserService
			.update($scope.profile.id, {
				fullname : $scope.profile.fullname,
				initials : $scope.profile.initials
			})
			.then(function(response) {

				if(response.success){
					userInfo.fullname = $scope.profile.fullname;
					userInfo.initials = $scope.profile.initials;
					SessionStorageService.setUserInfo(userInfo);
					$rootScope.$broadcast("userInfo:updated", userInfo);
				}

				// Show message
				showNotificationMessage({
					success: response.success,
					message: response.message,
					show: true
				});
		});
	}

	$scope.changeEmail = function onChangeEmail(){

		// Update email address, then signout
		UserService
			.changeEmail($scope.profile.id, {
				newemail : $scope.profile.newemail
			})
			.then(function(response){
				if(response.success) signout(response);
				else {
					showNotificationMessage({
						success: response.success,
						message: response.message,
						show: true
					});
				}
			});
	}

	$scope.changePassword = function onChangePassword(){

		if($scope.profile.newpassword != $scope.profile.confirmpassword) {
			showNotificationMessage({
				success: false,
				message: "New passwords do not match. Please enter again.",
				show: true
			});
			return;
		}

		// Update password, then signout
		UserService
			.changePassword($scope.profile.id, {
				oldpassword : $scope.profile.oldpassword,
				newpassword : $scope.profile.newpassword,
				confirmpassword : $scope.profile.confirmpassword
			})
			.then(function(response){
				if(response.success) signout(response);
				else {
					showNotificationMessage({
						success: response.success,
						message: response.message,
						show: true
					});
				}
			});
	}

	$scope.toggleTab = function onToggleTab(which) {
		$scope.detailsOn = false;
		$scope.emailOn = false;
		$scope.passwordOn = false;

		if(which == 'details') {
			$scope.detailsOn = true;
		} else if(which == 'email') {
			$scope.emailOn = true;
		} else if(which == 'password') {
			$scope.passwordOn = true;
		}

		// Ugly fix to reset form when switching tabs
		$('form:not(:first)').each(function(i, form) {
			$(form).parsley().reset();
			$('input',form).each(function(y, input) {
				$(input).val("");
			});
		});
	}

	function signout(resp) {
		if(resp.success) {
			dialog = $dialogs
				.notify(CONFIG.APP_NAME,'Update successful. The system will log you out for the changes to take effect.')
				.result.then(function() {
					$location.path("signout");
				});
		} else {
			growl.addSuccessMessage(resp.message);
		}
	}

	function showNotificationMessage(params) {
		//console.log(params.success);
		if(params.success) {
			growl.addSuccessMessage(params.message);
		} else {
			growl.addErrorMessage(params.message);
		}
	}

	$scope.$on('$viewContentLoaded', function() {
		$timeout(function(){
			$scope.profile.oldpassword = "";
		}, 250);
	});
}]);;app.controller('ResendEmailCtrl', ['$scope', '$modalInstance', 'data', '$dialogs', 'CONFIG', 'UserService', function($scope, $modalInstance, data, $dialogs, CONFIG, UserService) {

	$scope.user = {
		email: data.email
	};

	$scope.resend = function onResendConfirmation() {
		UserService
			.resendEmail($scope.user)
			.then(function onResponse(resp) {
				if(resp.success){
					dialog = $dialogs.notify(CONFIG.APP_NAME, "Resend email successful.");
				}
				else {
					dialog = $dialogs.error(CONFIG.APP_NAME, resp.message);
				}
				$modalInstance.dismiss('canceled');
			});
	}

	$scope.cancel = function onCancel(){
		$modalInstance.dismiss('canceled');
	};

}]);;app.controller('SignInCtrl', ['$scope', '$rootScope', '$location', '$dialogs', 'CONFIG', 'AuthenticationService', 'SessionStorageService', 'LocalStorageService', 'SystemParamsService', '$timeout', 'MESSAGES', 
	function($scope, $rootScope, $location, $dialogs, CONFIG, AuthenticationService, SessionStorageService, LocalStorageService, SystemParamsService, $timeout, MESSAGES) {

	var INVALID_ACCOUNT_CODE = "0102";

	$scope.account = { email: "", password:"" };
	$scope.errorMessage = "";

	var TPL_FORGOT_PASSWORD = '/partials/signin/forgot-password.html';
	var TPL_RESEND_EMAIL = '/partials/signin/resend-email.html';

	//Check for auto-login
	var autoLogin = LocalStorageService.getLoginSession();
	if(autoLogin){
		AuthenticationService
		.signin({sessionId: autoLogin.id, autoLogin: true})
		.then(function(resp){
			if(resp.success){
				signinSuccess(resp);
			}else
				LocalStorageService.clearLoginSession();
		});
	}

	$scope.signin = function onSignIn() {
		//Workaround for auto-complete selected values
		$scope.account = {
			email: $("#email").val(),
			password: $("#password").val()
		};

		AuthenticationService
			.signin($scope.account)
			.then(function onSuccess(resp) {
				if(resp.success) {
					signinSuccess(resp);
				} else {
					if(INVALID_ACCOUNT_CODE === resp.code) {
						$scope.showResendEmailForm();
						return;
					}
					$scope.errorMessage = resp.message;
				}
			},
			function onError(res) {
				$scope.errorMessage = MESSAGES.SYSERROR;
				//console.log("Error Status:" + res.status);
			});
	}

	$scope.showResendEmailForm = function onShowResendEmailForm() {
		resetForm();
		dialog = $dialogs
			.create(TPL_RESEND_EMAIL,'ResendEmailCtrl', {email: $scope.account.email});
	}

	$scope.forgotPassword = function onForgotPassword() {
		dialog = $dialogs
			.create(TPL_FORGOT_PASSWORD,'ForgotPasswordCtrl', {});
	}

	$scope.signup = function onSignUp() {
		$location.path('signup');
	}

	function resetForm() {
		$("form:first").parsley().reset();
	}

	function signinSuccess(resp){
		SessionStorageService.setUserInfo(resp.data);
		SystemParamsService
			.all()
			.then(function onGetAllParams(params) {
				SessionStorageService.setSystemParams(params.data);
				CONFIG.refreshSystemParams();

				if($scope.autoLogin) {
					LocalStorageService.setLoginSession({id: resp.data.sessionId});
				}
				$location.path('dashboard');
				$rootScope.$broadcast("userInfo:updated", resp.data);
			});
	}
}]);;
app.controller('SignInExternalCtrl', ['$scope', '$rootScope', '$location', '$dialogs', 'CONFIG', 'AuthenticationService', 'SessionStorageService', 'LocalStorageService', 'SystemParamsService', '$timeout', 'MESSAGES', 'scopeInfo',
	function($scope, $rootScope, $location, $dialogs, CONFIG, AuthenticationService, SessionStorageService, LocalStorageService, SystemParamsService, $timeout, MESSAGES, scopeInfo, $route) {
		$scope.errorMessage = "";
		$scope.sessionId = scopeInfo;

		//console.log("$scope.sessionId", scopeInfo);
		//console.log($scope.sessionId, $route);

		if($scope.sessionId!=""){
			AuthenticationService
				.signin({sessionId: $scope.sessionId, autoLogin: true})
				.then(function(resp){
					if(resp.success){
						signInSuccess(resp);
					}else
						LocalStorageService.clearLoginSession();
				});
		}

		function signInSuccess(resp){

			SessionStorageService.setUserInfo(resp.data);
			SessionStorageService.setReferrer({ref:'external'});

			SystemParamsService
				.all()
				.then(function onGetAllParams(params) {
					SessionStorageService.setSystemParams(params.data);
					CONFIG.refreshSystemParams();

					if($scope.autoLogin) {
						LocalStorageService.setLoginSession({id: resp.data.sessionId});
					}
					window.location.replace('#/dashboard');
					$rootScope.$broadcast("userInfo:updated", resp.data);
				});
		}
	}]);;app.controller('SignUpCtrl', ['$scope', '$location', 'AccountService', function($scope, $location, AccountService) {

	$scope.account = {
		// companyName: "",
		// companyDescription: "-",
		displayName: "",
		email: "",
		password: ""
	};

	$scope.errorMessage = "";

	$scope.signup = function onSignUp() {
		//Workaround for auto-complete selected values
		$scope.account.password = $("#password").val();

		AccountService
			.create($scope.account)
			.then(function onCreateSuccess(resp) {
				
				if(!resp.success) {
					$scope.errorMessage = resp.message;
					return;
				}

				// Acount has been created, redirect to a confirmation page
				var account = resp.data;

				$location.path("signupSucces");

			});

	}

}]);;app.controller('CardMembersCtrl', ['$scope', '$rootScope', 'CONFIG', function($scope, $rootScope, CONFIG) {

}]);;app.controller('ContextMenuColumnCtrl', ['$scope', '$dialogs', 'CONFIG', 'ColumnService', function($scope, $dialogs, CONFIG, ColumnService) {

	var TPL_COLUMN_MAXCARDS = '/partials/boards/column-max-cards.html';

	$scope.deleteColumn = function onDeleteColumn() {
		function remove() {
			ColumnService
				.delete($scope.column.id)
				.then(function onResponse(resp) {

					if(!resp.success) {
						console.warn("Something went wrong deleting a column.");
						return;
					}

					var col = resp.data;
					angular.forEach($scope.columns, function onEachColumn(column, i) {
						if(col.id == column.id) {
							$scope.columns.splice(i, 1);
						}
					})
				});
		}

		confirmDialog = $dialogs
			.confirm(CONFIG.APP_NAME,'Are you sure you want to delete this column?')
			.result.then(function(btn){
				if(btn === "yes") {
					remove();
				}
			});
	}

	$scope.updateMaxCards = function onUpdateMaxCards($event) {
		dialog = $dialogs
			.create(TPL_COLUMN_MAXCARDS, 'MaxCardColumnCtrl', $scope.column);
	}

	$scope.subcribeColumn = function onSubscribeColumn($event) {
		ColumnService
			.subscribe($scope.column.id)
			.then(function onSubscribe(resp) {
				$scope.column.subscribed = true;
			});
	}

	$scope.unSubcribeColumn = function onUnSubscribeColumn($event) {
		ColumnService
			.unsubscribe($scope.column.id)
			.then(function onSubscribe(resp) {
				$scope.column.subscribed = false;
			});
	}

}]);
;app.controller('MaxCardColumnCtrl', ['$scope', '$rootScope', '$modalInstance', 'data', 'ColumnService', function($scope, $rootScope, $modalInstance, data, ColumnService) {

	$scope.column = data;

	$scope.save = function onSave() {
			ColumnService
			.update($scope.column.id, {max: $scope.column.max})
			.then(function onUpdate(resp) {
				$rootScope.$broadcast("column:updated", angular.extend({}, $scope.column, {max: $scope.column.max}));
				$modalInstance.dismiss('canceled');
			});
	}

	$scope.cancel = function onCancel(){
		$modalInstance.dismiss('canceled');
	};

}]);
;app.controller('NewCardCtrl', ['$scope', 'CardService', '$dialogs', 'CONFIG', 'getMaxPos', 'growl', function($scope, CardService, $dialogs, CONFIG, getMaxPos, growl) {

	$scope.card = {
		name: "",
		boardId: $scope.boardInfo.id, //Injected thru ng-repeat
		columnId: $scope.column.id //Injected thru ng-repeat
	};

	$scope.createNewCard = function onCreateNewCard($event) {

		if(!$scope.card.name) {
			dialog = $dialogs.error(CONFIG.APP_NAME, "Invalid card name.");
			return;
		}

		//Get the max position and assign with higher one
		$scope.column.cards = $scope.column.cards || [];
		var maxPos = getMaxPos($scope.column.cards, 'pos');
		var position =  maxPos + CONFIG.CARD_POSITION_INTERVAL;

		CardService
			.create(angular.extend($scope.card, {pos: position}))
			.then(function onSuccess(resp) {
				if(resp.success) {
					$scope.column.cards.push(resp.data);

					// Reset form
					$scope.card.name = "";
					$scope.hideCreateCardForm($event);
					$scope.$emit("newCardCreated");
					growl.addSuccessMessage(resp.message);
				} else {
					console.warn("Someting went wrong in creating card.");
				}
			});
	}

	$scope.cancelCreateCard = function onCancelCreateCard(){
		$scope.card.name='';
	}

}]);;app.controller('SortableCardCtrl', ['$scope', 'CardService', function($scope, CardService) {

	$scope.updateCardPosition = function onUpdateCardPosition(id, params) {
		// Card was added
		if(params.columnId === $scope.column.id) {
			CardService
				.update(id, params)
				.then(function onUpdate(resp) {
					$scope.$emit("card:updated");
				});
		}
		// Card item was removed from the lists, remove from the columns array
		else {}

	}

}]);;app.controller('SortableColumnCtrl', ['$scope', 'ColumnService', function($scope, ColumnService) {

	$scope.updatePosition = function onUpdatePosition(id, newPos) {
		ColumnService
			.update(id, {pos: newPos})
			.then(function onUpdate(resp) {

				angular.forEach($scope.columns, function onEachColumn(column, i) {
					if(column.id === id) {
						angular.extend(column, resp.data);
					}
				});

				$scope.$emit("column:updated");

			});
	}

}]);;app.controller('UpdateCardCtrl', ['$scope', '$rootScope', '$modalInstance', 'data', '$dialogs', '$filter', '$upload', '$timeout', 'SessionStorageService', 'CONFIG', 'CardService', 'growl', 
	function($scope, $rootScope, $modalInstance, data, $dialogs, $filter, $upload, $timeout, SessionStorageService, CONFIG, CardService, growl) {

	$scope.config = CONFIG;
	$scope.Util = Util;
	$scope.userInfo = data.userInfo;
	$scope.card = data.cardInfo;
	$scope.card.dueDate = $filter('date')($scope.card.dueDate, 'yyyy/MM/dd HH:mm');
	$scope.projLabels = data.projLabels;
	$scope.boardMembers = filterBoardMembers(data.members, $scope.card.assignedUsers);

	delete $scope.card.columnId;
	delete $scope.card.boardId;

	var originalCard = angular.extend({}, $scope.card);

	$scope.editName = false;
	$scope.editDesc = false;

	$scope.save = function onSave() {
		CardService
			.update($scope.card.id, $scope.card)
			.then(function onUpdate(resp) {
				growl.addSuccessMessage("Card has been updated.");
				$scope.showEditName(false);
				$scope.showEditDesc(false);
				$rootScope.$broadcast("card:updated", resp.data);
				originalCard = angular.extend({}, $scope.card, resp.data);
			});
	}

	$scope.deleteCard = function onDelete() {
		function remove() {
			CardService
				.delete($scope.card.id)
				.then(function onDelete(resp) {

					// TODO: Alternative for $rootScope???
					growl.addSuccessMessage("Card has been deleted.");
					$rootScope.$broadcast("card:deleted", resp.data);
					$modalInstance.dismiss('canceled');
				});
		}

		confirmDialog = $dialogs
			.confirm(CONFIG.APP_NAME,'Are you sure you want to delete this card?')
			.result.then(function(btn){
				if(btn === "yes") {
					remove()
				}
			});
	}

	$scope.saveDueDate = function onSaveDueDate(dueDate) {
		$scope.card.dueDate = dueDate;
		$scope.save();
	}

	$scope.removeDueDate = function onRemoveDueDate() {
		$scope.card.dueDate = null;
		$scope.save();
	}

	$scope.subcribeToCard = function onSubcribeToCard() {
		CardService
			.subscribe($scope.card.id)
			.then(function onSuccess() {
				growl.addSuccessMessage("You are now subscribed to this card and will start receiving notification for any updates for this card.");
				$rootScope.$broadcast("card:updated", angular.extend($scope.card, {subscribed:true}));
			});
	}

	$scope.unSubcribeToCard = function onUnSubscribeToCard() {
		CardService
			.unsubscribe($scope.card.id)
			.then(function onSuccess() {
				growl.addSuccessMessage("You are now unsubscribed to this card.");
				$rootScope.$broadcast("card:updated", angular.extend($scope.card, {subscribed:false}));
			});
	}

	$scope.assignLabel = function onAsssignLabel(labelId) {
		CardService
			.assignLabel($scope.card.id, {labelId:labelId})
			.then(function onAssignLabel(resp) {
				if(resp.success){
					growl.addSuccessMessage("Successfully assigned label to this card.");
					$rootScope.$broadcast("card:updated", angular.extend($scope.card, {labels:[resp.data]}));
				}
			});
	}

	$scope.unassignLabel = function onUnAssignLabel(labelId) {
		CardService
			.unassignLabel($scope.card.id, {labelId:labelId})
			.then(function onUnAssignLabel(resp) {
				if(resp.success){
					growl.addSuccessMessage("Successfully un-assigned label from this card.");
					$scope.card.labels = resp.data.length != null ? resp.data : [resp.data];
					$rootScope.$broadcast("card:updated", $scope.card);
				}
			});
	}
	

	$scope.showEditName = function onShowEditName(show, cancelled) {
		$scope.editName = show;
		if(!show && cancelled) {
			$scope.card.name = originalCard.name;
		}
	}

	$scope.showEditDesc = function onShowEditDesc(show, cancelled) {
		$scope.editDesc = show;
		if(!show && cancelled) {
			$scope.card.desc = originalCard.desc;
		}
	}

	$scope.cancel = function onCancel(){
		$modalInstance.dismiss('canceled');
	};

	function filterBoardMembers(members, assignedUsers) {
		var boardMembers = [];
		angular.forEach(members, function(bm) {
			bm.id = bm.userId;
			var match = assignedUsers.matchWithIndex("id",bm.id);
			if(bm.boardRole || match){
				bm.assigned = match.value ? true : false;
				boardMembers.push(bm);
			}
		});
		return boardMembers;
	}

	/*Upload Attachements*/
	$scope.progress = new Array();
	$scope.addAttachment = function onAddAttachment($files){
		if($files.length ===  0) return;
		$scope.hideProgress = false;

		var progress = $scope.progress[0] = {};
		progress.percentage = 0;
		progress.text = "";

		$.each($files, function(index, file){
			//Workaround for OptimisticLocking issue on db
			//TODO : Better solutions?
			var interval = 300 * (1+index);
			$timeout(function(){
				CardService.addAttachment($scope.userInfo, $scope.card.id, file)
				.then(function(response) {
					var resp = response.data;
					if(resp.success){
						$timeout(function(){
							progress.text = "Uploaded successfully!";
							$scope.card.attachments.push(resp.data);
							$rootScope.$broadcast("card:updated", $scope.card);
						}, 1500);
					}else{
						progress.text = "Uploaded failed.";
					}
				}, function() {
					progress.text = "Uploaded failed.";
				}, function(evt) {
					progress.percentage = parseInt(100.0 * evt.loaded / evt.total);
					if(progress.percentage <= 99) progress.text = progress.percentage + "%";
				});
			}, interval);
		});
	}

	$scope.deleteAttachment = function onDeleteAttachment(id){

		function remove(){
			CardService.deleteAttachment($scope.card.id, {fileId: id})
			.then(function(response) {
				var resp = response.data;
				if(response.success){
					$scope.card.attachments.findAndRemove("id",id);
					$rootScope.$broadcast("card:updated", $scope.card);
					$scope.selectedFiles = [];
					$scope.hideProgress = true;
				}
			});
		}

		confirmDialog = $dialogs
			.confirm(CONFIG.APP_NAME,'Are you sure you want to delete this attachment?')
			.result.then(function(btn){
				if(btn === "yes") {
					remove();
				}
			});
	}
 }]);
;app.controller('ViewBoardActivitiesCtrl', ['$scope', '$rootScope', '$filter', '$timeout', '$dialogs', 'CONFIG', 'PagingService', 'BoardService', 'CompanyService', 'CardService', 
	function($scope, $rootScope, $filter, $timeout, $dialogs, CONFIG, PagingService, BoardService, CompanyService, CardService) {

	var TPL_CARD_SETTINGS = 'partials/boards/card-settings.html';

	$scope.loading = false;

	//setup pagination
	$scope.page = 1;
	PagingService
		.setPage($scope.page)
		.setLimit(CONFIG.ACTIVITY_PAGE_LIMIT)
		.setTotal($scope.activityData.total);

	$scope.numberOfPages = PagingService.getNoOfPage();

	$scope.refreshActivities = function onRefreshActivities() {
		if($scope.activities.length > 0){
			var time = $filter("date")(new Date($scope.activities[0].time), "yyyy-MM-ddTHH:mm:ss'Z'");
			BoardService.activitylast($scope.boardInfo.id, {time: $scope.activities[0].time})
			.then(function(response){
				if(response.success){
					$.each(response.data, function(i, data){
						$scope.activities.unshift(data);
					});
					$scope.scrollTo('top');
				}
			});
		} else {
			--$scope.page;
			$scope.loadMore();
		}
	}

	$scope.loadMore = function onLoadMore() {
		PagingService.setPage(++$scope.page);

		$scope.loading = true;

		BoardService.activity($scope.boardInfo.id, {
			offset: PagingService.getOffset(),
			limit: PagingService.getLimit(),
			sort: 'activityDate',
			order: 'desc'
		})
		.then(function(response){
			if(response.success){
				$scope.activities = $scope.activities.concat(response.data);
				$scope.scrollTo('bottom');
			}
		});
	}

	$scope.viewItem = function onViewItem(type, id) {
		if(type !== 'CARD') {
			return;
		}

		CompanyService
			.labels($scope.accountInfo.accountId)
			.then(function onGetLabels(labels) {
				CardService
					.get(id)
					.then(function onGetCard(cardInfo) {
						/*dialog = $dialogs
							.create(TPL_CARD_SETTINGS,'UpdateCardCtrl', {cardInfo: cardInfo.data, projLabels: labels.data, boardMembers: $scope.boardMemberData});*/
						dialog = $dialogs
							.create(TPL_CARD_SETTINGS,'UpdateCardCtrl', {cardInfo: cardInfo.data, projLabels: labels.data, userInfo: $scope.userInfo, members: $scope.members});
					});
			});
	}

	$scope.scrollTo = function onScrollTo(w) {
		$timeout(function() {
			// scroll to bottom
			var el = $('[data-scroll="activities"]').get(0);
			el.scrollTop = (w === 'top') ? 0 : el.scrollHeight;
			$scope.loading = false;
		},250);
	}


	$rootScope.$on("column:added", $scope.refreshActivities);
	$rootScope.$on("newCardCreated", $scope.refreshActivities);
	$rootScope.$on("column:updated", $scope.refreshActivities);
	$rootScope.$on("card:updated", $scope.refreshActivities);

}]);;app.controller('ViewBoardCtrl', ['$scope', '$rootScope', '$location', '$filter', 'CONFIG','SessionStorageService','UserService', 'ColumnService', 'boardInfo', 'boardListing', 'accountInfo', 'getMaxPos', 'coyMembers', 'boardMembers', 'showAll', 'activities', 'growl',
	function($scope, $rootScope, $location, $filter, CONFIG, SessionStorageService, UserService, ColumnService, boardInfo, boardListing, accountInfo, getMaxPos, coyMembers, boardMembers, showAll, activities, growl) {

	var DEFAULT_COLUMN_TITLE = "Untitled";
	var ACTIVE = "ACTIVE";

	$scope.userInfo = SessionStorageService.getUserInfo();
	$scope.accountInfo = accountInfo.data;
	$scope.boardMemberData = boardMembers.data;
	$scope.members = mergeBoardMemberRole(coyMembers.data, boardMembers.data);

	var boardData = boardInfo.data;
	$scope.boardInfo = boardData;
	$scope.columns = boardData.columns;
	$scope.showAll = showAll;

	$scope.systemParams = CONFIG.SYS_PARAMS;
	$scope.staticServer = $scope.systemParams.url;

	//Dummy data
	$scope.activities = [];
	if(activities.data) {
		$scope.activityData = activities;
		$scope.activities = activities.data;
	}

	$scope.isSelected = function isSelected(columnId) {
		return (boardData.id === columnId) ? true : false;
	}

	$scope.switchBoard = function onSwitchBoard() {
		if($scope.boardInfo.id != $scope.selectedBoard.id) {
			$location.path("board/" + $scope.accountInfo.accountId + "/" + $scope.selectedBoard.id + ( $scope.showAll ? "/all" : "" ) );
		}
	}

	$scope.initBoard = function onInitBoard() {
		angular.forEach($scope.boardListing, function onEach(board, i){
			if(board.id === boardData.id) {
				$scope.selectedBoard = $scope.boardListing[i];
			}
		});
		
	}

	$scope.showAllToggle = function onShowAllToggle($event) {
		$scope.showAll = $event.target.checked;
		$scope.boardListing = $scope.listBoards($scope.showAll ? true : false);
	}

	$scope.isSuspended = function onSuspended(status) {
		//console.log(status);
		return status === "SUSPENDED";
	}

	$scope.listBoards = function onListBoards(showAll) {
		if(showAll) {
			return boardListing.data;
		} else {
			var lists = [];
			angular.forEach(boardListing.data, function onEachBoard(board) {
				if(board.status === ACTIVE) {
					lists.push(board);
				}
			});
			return lists;
		}
	}

	$scope.boardListing = $scope.listBoards(showAll ? true : false);

	// NEW COLUMN: TODO, separate controller???
	$scope.createNewColumn = function onNewColumn() {

		if( $scope.columns.length >= $scope.systemParams.maxColumns ) {
			growl.addErrorMessage("Only maximum of "+ $scope.systemParams.maxColumns +" columns is allowed on this board.");
			return;
		}

		//Get the max position and assign with higher one
		var maxPos = getMaxPos($scope.columns, 'pos');
		var position =  maxPos + CONFIG.COLUMN_POSITION_INTERVAL;

		ColumnService
			.create({
				title: DEFAULT_COLUMN_TITLE,
				boardId: $scope.boardInfo.id,
				pos: position
			})
			.then(function onCreateSuccess(resp) {
				if(resp.success) {
					$scope.columns.push(resp.data); // Just array push and UI will be updated automagically
					$scope.$broadcast('updateSortableAreaWidth'); //recalculate width
				} else {
					console.warn("Something went wrong in creating the column.");
				}
			});
	}


	$scope.boardClicked = function onBoardClicked($event) {
		var $target = $($event.target);
		if(!$target.is("[data-open='context']")) {
			$scope.$broadcast('hideAllColumnContextMenu');
			$scope.$broadcast('hideAllEditTitleForm');
		}
	}

	$scope.getAccessMatrix = function onGetAccessMatrix(projectRole, boardRole){
		return UserService.getAccessMatrix($scope.userInfo, projectRole, boardRole);
	}

	$rootScope.$on("column:updated", function($event, columnInfo) {
		if(!columnInfo) {
			return;
		}
		$event.preventDefault();
		angular.forEach($scope.columns, function onEachCard(column, i) {
			if(column.id === columnInfo.id) {
				$scope.columns[i] = columnInfo;
			}
		});
	});

	function mergeBoardMemberRole(cm, bm){
		$.each(cm, function(i, e){
			var match = bm.match("id",e.userId);
			e.boardRole = match ? match.role : null;
			//Map Current User Roles
			if(e.userId === $scope.userInfo.id){
				$scope.userInfo.boardRole = e.boardRole;
				$scope.userInfo.projectRole = e.role;
				$scope.userInfo.acl = UserService.getAccessMatrix($scope.userInfo);
			}
		});
		return cm;
	}

	// $rootScope.$on("column:added", $scope.refreshActivities);
	// $rootScope.$on("newCardCreated", $scope.refreshActivities);
	// $rootScope.$on("column:updated", $scope.refreshActivities);
	// $rootScope.$on("card:updated", $scope.refreshActivities);

}]);;app.controller('ViewCardCtrl', ['$scope', '$filter', '$dialogs', 'CompanyService', 'BoardMemberService', 'SessionStorageService', 'CONFIG', 
	function($scope, $filter, $dialogs, CompanyService, BoardMemberService, SessionStorageService, CONFIG) {

	var TPL_CARD_SETTINGS = 'partials/boards/card-settings.html';

	$scope.editCard = function onEditCard(accountId, boardId) {

		$scope.$emit('hideAllColumnContextMenu');
		$scope.$emit('hideAllEditTitleForm');

		CompanyService
			.labels(accountId)
			.then(function onGetLabels(labels) {
				/*BoardMemberService
					.get(boardId)
					.then(function onGetBoardMembers(boardMembers) {
						dialog = $dialogs
							.create(TPL_CARD_SETTINGS,'UpdateCardCtrl', {cardInfo: $scope.card, projLabels: labels.data, boardMembers: boardMembers.data});
					});*/
					dialog = $dialogs
						.create(TPL_CARD_SETTINGS,'UpdateCardCtrl', {cardInfo: $scope.card, projLabels: labels.data, userInfo: $scope.userInfo, members: $scope.members});
			});
	}
}]);;app.controller('ViewColumnCtrl', ['$scope', '$rootScope', 'ColumnService', '$dialogs', 'CONFIG', function($scope, $rootScope, ColumnService, $dialogs, CONFIG) {
	$scope.newCard = false;

	var originalColumn  = angular.extend({}, $scope.column);

	$scope.hideCreateCardForm = function onHideCreateCardForm($event) {
		$scope.newCard = !$scope.newCard;
		$event.preventDefault();
	}

	$scope.toggleContextMenu = function onToggleContextMenu($event) {
		var target = $event.target,
			ddMenu = $(target).parents('li').find('.dropdown-menu');

		$('#sortable-columns .list').find('.dropdown-menu').not(ddMenu).removeClass('show');
		$(ddMenu).toggleClass('show');
	}

	$scope.editTitle = function onEditTitle($event) {
		var target = $event.target,
			paneHeader = $(target).parents('.pane-header');

		// $scope.$emit('hideAllColumnContextMenu');
		// $scope.$emit('hideAllEditTitleForm');

		$(paneHeader).find('a, h2').addClass('hide');
		$(paneHeader).find('.edit-title-group').removeClass('hide');

		$('input').focus();
	}

	$scope.cancelEditTitle = function onCancelEditTitle($event) {
		var target = $event.target,
			paneHeader = $(target).parents('.pane-header');

		$(paneHeader).find('a, h2').removeClass('hide');
		$(paneHeader).find('.edit-title-group').addClass('hide');

		$scope.column.title = originalColumn.title;
	}

	$scope.editColumnTitle = function onEditColumnTitle() {

		if(!$scope.column.title) {
			dialog = $dialogs.error(CONFIG.APP_NAME, "Invalid column title.");
			return;
		}

		ColumnService
			.update($scope.column.id, {title: $scope.column.title})
			.then(function onUpdate(resp) {
				originalColumn  = angular.extend({}, resp.data, $scope.column);
				$scope.$emit('hideAllEditTitleForm');
			});
	}

	$scope.contextNewCard = function onContextNewCard($event) {
		$scope.newCard = true;
		$scope.toggleContextMenu($event);
	}
	
	$scope.newCardTrigger = function onNewCard($event) {
		var pane = $($event.target).parents('.pane'),
			 cards = $(pane).find('.cards');

		$scope.newCard = !$scope.newCard;
		$(cards).animate({scrollTop: $(cards).height()}, {
			duration: 500,
			complete: function() {
				$("textarea", pane).focus();
			}
		});
		
	}

	// LISTENER FOR EVENTS
	// TODO: Alternative for $rootScope???
	$rootScope.$on("card:updated", function($event, cardInfo) {
		if(!cardInfo) {
			return;
		}
		$event.preventDefault();
		angular.forEach($scope.column.cards, function onEachCard(card, i) {
			if(card.id === cardInfo.id) {
				$.extend($scope.column.cards[i],cardInfo);
				//$scope.column.cards[i] = cardInfo;
			}
		});
	});

	$rootScope.$on("card:deleted", function($event, id) {
		if(!id) {
			return;
		}
		$event.preventDefault();
		angular.forEach($scope.column.cards, function onEachCard(card, i) {
			if(card.id === id) {
				$scope.column.cards.splice(i,1);
			}
		});
	});

}]);;app.controller('DashboardCtrl', ['$scope', '$rootScope', '$dialogs', '$filter', 'CONFIG', 'AccountService', 'CompanyService', 'BoardService', 'MemberService', 'BoardMemberService', 'userInfo', 'companies', 'growl', 
	function($scope, $rootScope, $dialogs, $filter, CONFIG, AccountService, CompanyService, BoardService, MemberService, BoardMemberService, userInfo, companies, growl) {

	var TPL_MANAGE_BOARD = '/partials/dashboard/board-manage.html';
	var TPL_PROJECT_SETTINGS = '/partials/dashboard/project-settings.html';

	$scope.userInfo = userInfo;
	$scope.projects = companies.data;
	$scope.maxProjects = CONFIG.SYS_PARAMS.maxProjects;
	$scope.maxBoardsPerProject = CONFIG.SYS_PARAMS.maxBoards;
	$scope.ownedProj = $filter('filter')($scope.projects,  {role:'OWNER'}) || [];


	function getCompanyMembers(accountId, callback) {
		CompanyService
			.members(accountId)
			.then(callback);
	}

	$scope.projectSettings = function onProjectSettings(accountId){
		getCompanyMembers(accountId, function onGetProjectMembers(projMembers) {
			CompanyService
				.labels(accountId)
				.then(function onGetLabels(labels) {
					AccountService
						.get(accountId)
						.then(function onGetAccountInfo(account) {
							var project = $scope.projects.match("accountId", accountId);
							userInfo.projectRole = project.role;
							dialog = $dialogs
								.create(TPL_PROJECT_SETTINGS, 'ManageProjectCtrl', {
									userInfo: userInfo,
									account: account.data, 
									labels: labels.data || [], 
									projMembers: projMembers.data || []
								});
						});
				});
		});
	};

	$scope.createBoard = function onCreateBoard(accountId) {
		getCompanyMembers(accountId, function onGetProjectMembers(projMembers) {
			dialog = $dialogs
				.create(TPL_MANAGE_BOARD, 'ManageBoardCtrl', {
					userInfo: userInfo,
					accountId: accountId,
					projMembers: projMembers.data || [], 
					isNew: true
				});
		});
	}

	$scope.manageBoard = function onManageBoard(accountId, boardId, boardIndex, aclByBoard) {
		getCompanyMembers(accountId, function onGetProjectMembers(projMembers) {
				BoardMemberService
					.get(boardId)
					.then(function onGetBoardMembers(boardMembers) {
						BoardService
								.settings(boardId)
								.then(function onGetBoard(boardInfo) {
									var params = {
										userInfo: userInfo,
										accountId: accountId,
										boardInfo: boardInfo.data,
										boardIndex: boardIndex,
										projMembers: projMembers.data || [],
										boardMembers: boardMembers.data || [],
										aclByBoard: aclByBoard
									};
									dialog = $dialogs
										.create(TPL_MANAGE_BOARD, 'ManageBoardCtrl', params);
								});
					});
			});
	}

	$rootScope.$on("project:deleted", function onProjectDeleted($event, id) {
		angular.forEach($scope.projects, function onEachProject(project, idx) {
			if(project.accountId === id) {
				$scope.projects.splice(idx, 1);
			}
		});
		
	});

}]);;app.controller('NewProjectCtrl', ['$rootScope', '$scope', '$dialogs', '$filter', 'CONFIG', 'AccountService', 'growl', function($rootScope, $scope, $dialogs, $filter, CONFIG, AccountService, growl) {

	var RE_ALPHANUMERIC = /^[\w\d_\s\(\)\!]*$/;

	$scope.project = {
		companyName: ""
	};

	$scope.saveProject = function onSave() {

		if(!$scope.project.companyName || !RE_ALPHANUMERIC.test($scope.project.companyName)) {
			dialog = $dialogs.error(CONFIG.APP_NAME, "Please enter a valid name for the project.");
			return;
		}

		if($scope.ownedProj.length === $scope.maxProjects) {
			dialog = $dialogs.error(CONFIG.APP_NAME, "You have reach the maximum number of projects per account.");
			return;
		}

		//This is a callback when there is an httpinterceptor error
		httpInterceptorCallBack = function httpInterceptorCallBack(){
			$scope.newProject = !$scope.newProject;
		}

		AccountService
			.create(angular.extend($scope.project, {userId: $scope.userInfo.id}))
			.then(function onCreateSuccess(resp) {
				if(resp.success) {
					growl.addSuccessMessage(resp.message);
					$scope.projects.push(resp.data);
				} else {
					growl.addErrorMessage(resp.message);
				}
				$scope.project.companyName = "";
				$scope.newProject = !$scope.newProject;
				$scope.ownedProj = $filter('filter')($scope.projects,  {role:'OWNER'}) || [];
			});
	}
	$rootScope.$on("project:deleted", function onProjectDeleted($event, id) {
		$scope.ownedProj = $filter('filter')($scope.projects,  {role:'OWNER'}) || [];
	});
	

}]);;app.controller('ProjectCtrl', ['$scope', '$rootScope', '$dialogs', '$filter', 'CONFIG','UserService', 'MemberService', 'BoardService', 'growl', 
	function($scope, $rootScope, $dialogs, $filter, CONFIG, UserService, MemberService, BoardService, growl) {

	$scope.acceptInvite = function onAcceptInvite(projectId) {
		MemberService
			.accept(projectId)
			.then(function onAcceptInvite(resp) {
				$scope.project.status = "ACTIVE";
				 growl.addSuccessMessage("You have accepted the invitation to the project.");
			});
	}

	$scope.declineInvite = function onDeclineInvite(projectId) {
		function decline() {
			MemberService
				.decline({accountId: projectId, userId: $scope.userInfo.id })
				.then(function onDeclineInvite() {
					angular.forEach($scope.projects, function onEach(proj, i) {
						if(projectId === proj.accountId) {
							growl.addSuccessMessage("You have declined the invitation to the project.");
							$scope.projects.splice(i, 1);
						}
					});
				});
		}

		confirmDialog = $dialogs
			.confirm(CONFIG.APP_NAME,'Are you sure you want to decline this invitation?')
			.result.then(function(btn){
				if(btn === "yes") {
					decline()
				}
			});
	}

	$scope.filterActiveBoards = function onFilterActiveBoards() {
		var active = $filter('filter')($scope.project.boards,  {status:'ACTIVE'}) || [];
		var completed =  $filter('filter')($scope.project.boards,  {status:'COMPLETED'}) || [];
		return active.concat(completed);
	}

	$scope.numOfActiveBoard = function onNumOfActiveBoards() {
		var activeBoards = $scope.filterActiveBoards();
		return activeBoards.length;
	}

	$scope.activeBoardsLen = $scope.numOfActiveBoard();

	$scope.deleteBoard = function onDeleteBoard(projectId, boardId, index) {
		function remove() {
			BoardService
				.delete(boardId)
				.then(function onRemove(resp) {
					//$scope.project.boards[index].status = resp.data.status;
					$scope.project.boards = $scope.project.boards.findAndSet('id', boardId, 'status', resp.data.status);
					$rootScope.$broadcast("board:deleted", {accountId:projectId});
					growl.addSuccessMessage("The board has been successfully deleted.");
				});
		}
		confirmDialog = $dialogs
			.confirm(CONFIG.APP_NAME,'Are you sure you want to delete this board? This action cannot be undone.')
			.result.then(function(btn){
				if(btn === "yes") {
					remove();
				}
			});
	}

	$scope.getAccessMatrix = function onGetAccessMatrix(userProjectRole, userBoardRole){
		$scope.userInfo.projectRole = userProjectRole;
		$scope.userInfo.boardRole = userBoardRole;
		return UserService.getAccessMatrix($scope.userInfo);
	}

	// Listening to new board creation then add to the list
	var onBoardCreated = function onBoardCreated(event, params) {
		if(params.accountId === $scope.project.accountId) {
			$scope.project.boards = angular.isArray($scope.project.boards) ? $scope.project.boards : [];
			$scope.project.boards.push(params);
		}
	}

	// Listening to new board updates
	var onBoardUpdated = function onBoardUpdated(event, params) {
		if(params.accountId === $scope.project.accountId) {
			angular.forEach($scope.project.boards, function onEachBoard(board, i) {
				if(board.id === params.id) {
					$.extend($scope.project.boards[i],params);
				}
			});
		}
	}

	$rootScope.$on("board:created", onBoardCreated);
	$rootScope.$on("board:updated", onBoardUpdated);

}]);;app.controller('ManageBoardCtrl', ['$scope', '$rootScope', 'CONFIG', '$modalInstance', 'data', '$dialogs', 'SessionStorageService', 'BoardService', 'growl', function($scope, $rootScope, CONFIG, $modalInstance, data, $dialogs, SessionStorageService, BoardService, growl) {

	$scope.mergeBoardMemberRole = function onMerge(cm, bm){
		$.each(cm, function(i, e){
			var match = bm.match("id",e.userId);
			e.boardRole = match ? match.role : null;
			//Map Current User Roles
			if(e.userId === $scope.userInfo.id){
				$scope.userInfo.boardRole = e.boardRole;
				$scope.userInfo.projectRole = e.role;
			}
		});
		return cm;
	}

	$scope.TAB_SETTINGS_INDEX = 1;
	$scope.TAB_MEMBERS_INDEX = 2;

	$scope.userInfo = SessionStorageService.getUserInfo();
	$scope.members = $scope.mergeBoardMemberRole(data.projMembers, data.boardMembers || []);
	$scope.projMembers = data.projMembers;

	$scope.accountId = data.accountId;
	$scope.boardIndex = angular.isDefined(data.boardIndex)  ? data.boardIndex : null;
	$scope.boardInfo = data.boardInfo || null;
	$scope.isNew = data.isNew || false;
	$scope.aclByBoard = data.aclByBoard;

	$scope.tabSettings = true;

	$scope.boardMemberTabEnabled = data.isNew ? false : true;
	$scope.boardSettingsTabEnabled = true;

	$scope.toggleTabs = function onToggleTabs(index, enableBoardSettingsTab, enableBoardMemberTab) {
		$scope.boardSettingsTabEnabled = angular.isDefined(enableBoardSettingsTab) ? enableBoardSettingsTab : $scope.boardSettingsTabEnabled;
		$scope.boardMemberTabEnabled = angular.isDefined(enableBoardMemberTab) ? enableBoardMemberTab : $scope.boardMemberTabEnabled;
		$scope.tabSettings = (index === $scope.TAB_SETTINGS_INDEX) ? true : false;
	}

	$scope.DEFAULT_COLUMNS = [];
	var systemParams = CONFIG.SYS_PARAMS;
	angular.forEach(CONFIG.DEFAULT_COLUMN_NAMES, function onEachName(colName, i) {
		$scope.DEFAULT_COLUMNS.push({
			title: colName,
			pos: (i+1) * CONFIG.COLUMN_POSITION_INTERVAL,
			max: systemParams.maxCardsPerColumn, 
			status:'ACTIVE'
		});
	});

	$scope.deleteBoard = function onDeleteBoard($event) {
		$event.preventDefault();
		function remove() {
			BoardService
				.delete($scope.boardInfo.id)
				.then(function onRemove(resp) {
					$rootScope.$broadcast("board:deleted", {accountId:$scope.accountId});
					growl.addSuccessMessage("The board has been successfully deleted.");
					$scope.cancel();
				});
		}
		confirmDialog = $dialogs
			.confirm(CONFIG.APP_NAME,'Are you sure you want to delete this board? This action cannot be undone.')
			.result.then(function(btn){
				if(btn === "yes") {
					remove();
				}
			});
	}

	$scope.cancel = function onCancel(){
		$scope.columns = !$scope.isNew ? $scope.boardInfo.columns : $scope.DEFAULT_COLUMNS;
		$modalInstance.dismiss('canceled');
	};

	$rootScope.$on("board:created", function onBoardCreated(events, board) {
		$scope.boardInfo = board;
		$scope.$broadcast("refreshMemberList");
	});

}]);;app.controller('NewBoardCtrl', ['$scope', '$rootScope', '$dialogs', 'CONFIG', 'BoardService', 'BoardMemberService', 'getMaxPos', 'growl', 
	function($scope, $rootScope, $dialogs, CONFIG, BoardService, BoardMemberService, getMaxPos, growl) {
	var columnIndex = 0;
	var systemParams = CONFIG.SYS_PARAMS;

	$scope.columns = !$scope.isNew ? $scope.boardInfo.columns : $scope.DEFAULT_COLUMNS;

	$scope.board = {
		title: !$scope.isNew ? $scope.boardInfo.title : "",
		description: !$scope.isNew ? $scope.boardInfo.description : "",
		accountId: $scope.accountId,
		status: !$scope.isNew ? $scope.boardInfo.status : 'ACTIVE',
		columns: $scope.columns
	};

	$scope.board.description = ($scope.board.description && $scope.board.description !== "null")
								? $scope.board.description
								: "";


	$scope.boardStatusList= ['ACTIVE','COMPLETED'];

	$scope.saveBoard = function onSaveBoard() {

		$scope.isNew
			? $scope.addBoard() 
			: $scope.updateBoard();
	}

	$scope.addBoard = function onAddBoard() {
		BoardService
			.create($scope.board)
			.then(function onCreateSuccess(resp) {

				if(!resp.success) {
					growl.addErrorMessage(resp.message);
					return;
				}

				// Reset
				$scope.board.title = "";
				$scope.board.description = "";

				// Publish for new board
				$rootScope.$broadcast("board:created", angular.extend(resp.data, {accountId:$scope.accountId}));
				// Alert the user
				growl.addSuccessMessage(resp.message);

				BoardMemberService
					.get($scope.boardInfo.id)
					.then(function onGetBoardMembers(boardMembers) {
						$scope.members = $scope.mergeBoardMemberRole($scope.projMembers, boardMembers.data || []);
						//Toggle tabs
						$scope.toggleTabs($scope.TAB_MEMBERS_INDEX, false, true);
					});

			});
	}

	$scope.updateBoard = function onSaveBoard() {
		BoardService
			.update($scope.boardInfo.id, angular.extend($scope.board))
			.then(function onUpdate(resp) {
				if(!resp.success) {
					//$scope.errorMessage = resp.message;
					growl.addErrorMessage(resp.message);
					return;
				}
				$rootScope.$broadcast("board:updated", angular.extend(resp.data, {accountId:$scope.accountId}));
				$scope.toggleTabs($scope.TAB_MEMBERS_INDEX);
				growl.addSuccessMessage(resp.message);
			});
	}

	$scope.updateColumns = function onSortColumns(columns) {
		$scope.$apply(function() {
			$scope.board.columns = $scope.columns = columns;
		});
		
	}

	$scope.addColumn = function onAddColumn() {
		var activeColumnsLength = 0;
		$.each($scope.board.columns, function(i,e){
			if(e.status === 'ACTIVE') activeColumnsLength ++;
		});
		//if( $scope.board.columns.length === systemParams.maxColumns ) {
		if(activeColumnsLength >= systemParams.maxColumns){
			growl.addErrorMessage("Only maximum of "+systemParams.maxColumns+" columns is allowed on this board.");
			return;
		}

		var maxPos = getMaxPos($scope.board.columns);
		$scope.columns.push({
			_id: (new Date()).getTime(),
			title: "Column " + ++columnIndex,
			pos: maxPos + CONFIG.COLUMN_POSITION_INTERVAL,
			max: systemParams.maxCardsPerColumn,
			status: 'ACTIVE'
		});
		//Refresh for validation
		$rootScope.$broadcast("parsleyValidation:refresh");
	}

	$scope.removeColumn = function onRemoveColumn(index) {
		$scope.columns.splice(index, 1);
	}

	$scope.updateColumn = function onUpdate(column, attr, val) {
		var searchField = (column.id ? {name:'id', val:column.id } : {name:'_id', val:column._id});
		$scope.columns = $scope.columns.findAndSet(searchField.name,searchField.val, attr, val);
	}

	$scope.toggleAdvanced = function onToggleAdvanced() {
		$scope.advancedToggleShown = !$scope.advancedToggleShown;
		$scope.advancedToggleIcon = !$scope.advancedToggleShown ? "glyphicon-expand" : "glyphicon-collapse-down";
	}

}]);;app.controller('NotificationCtrl', ['$scope', '$rootScope', '$filter', '$timeout', 'CONFIG', 'AuthenticationService', 'NotificationService', 'PagingService', 'notifications', 
	function($scope, $rootScope, $filter, $timeout, CONFIG, AuthenticationService, NotificationService, PagingService, notifications) {

	$scope.notifications = notifications.data;
	$scope.page = 1;
	$scope.loading = false;

	//setup pagination
	PagingService
		.setPage($scope.page)
		.setLimit(CONFIG.NOTIFICATION_PAGE_LIMIT)
		.setTotal(notifications.total);

	$scope.numberOfPages = PagingService.getNoOfPage();

	// Load More
	$scope.loadMore = function onLoadMore() {

		$scope.loading = true;

		PagingService.setPage(++$scope.page);

		NotificationService
			.all({
				offset: PagingService.getOffset(),
				limit: PagingService.getLimit(),
				sort: 'createdDate',
				order: 'desc'
			})
			.then(function onPage(resp) {
				$scope.notifications = $scope.notifications.concat(resp.data);
				$rootScope.$broadcast("notification:unread:update", resp.data);
				$scope.loading = false;
			});
	}

	$rootScope.$broadcast("notification:unread:update", notifications.data);

}]);;app.controller('AddMemberCtrl', ['$scope', '$dialogs', '$timeout', 'CONFIG', 'MemberService', 'CompanyService', 'growl', function($scope, $dialogs, $timeout, CONFIG, MemberService, CompanyService, growl) {
	var TPL_INVITE_MEMBER = '/partials/dashboard/invite-member.html';

	$scope.addMember = function onAddMember() {
		MemberService
			.create($.extend($scope.member, {accountId: $scope.project.accountId}))
			.then(function onCreate(resp) {
				// Everything is smooth, new user
				if(resp.success){
					growl.addSuccessMessage(resp.message);
					$scope.reset();
					$scope.appendAddedMember(resp);

					$("#newMember form").parsley().reset();
					$("#newMember form :input:not(:button)").val("")

				}
				// User is an existing member, show the invite form
				else if(parseInt(resp.code) === 1102) {	
					confirmDialog = $dialogs
						.confirm('Please Confirm', resp.message)
						.result.then(function(btn){
							var credentials = {
								accountId: $scope.project.accountId,
								email: $scope.member.email
							};						
							$scope.InviteMember(credentials);
							//$scope.inviteExisting();
							$scope.reset();
							//$scope.member.existingEmail = $scope.member.email;
						});
				}
				else {
					//$scope.errorMessage = resp.message;
					growl.addErrorMessage(resp.message);
				}
			});
	};

	$timeout(function(){
		$scope.member = {
			confirmEmail: "",
			email: "",
			password: ""
		}
	}, 800);
}]);;app.controller('EditDetailsCtrl', ['$scope', '$modalInstance', 'data', function($scope, $modalInstance, data) {
	$scope.company = data;

	$scope.save = function(){
		$modalInstance.dismiss('canceled');
	};

	$scope.cancel = function(){
		$modalInstance.dismiss('canceled');
	};
}]);;app.controller('AccountInfoCtrl', ['$scope', '$timeout', '$dialogs', 'AccountService', 'MemberService', 'BoardService', 'CompanyService', 'CONFIG', 'growl', function($scope, $timeout, $dialogs, AccountService, MemberService, BoardService, CompanyService, CONFIG, growl) {

	//$scope.members = members.data || [];
	//$scope.boards = boards.data || [];
	//$scope.account = account.data;

	var TPL_ADD_MEMBER = '/partials/dashboard/add-member.html';

	$scope.addMember = function onAddMember() {

		dialog = $dialogs
			.create(TPL_ADD_MEMBER,'AddMemberCtrl', account.data, {});
	}

	$scope.deleteMember = function onDeleteMember(userId) {
		function remove() {
			MemberService
				.delete({
					accountId: $scope.project.accountId, 
					userId: userId
				})
				.then(function onSuccess(resp) {
					// Everything is smooth, delete/decline of invitation successful
					if(resp.success){
						//$dialogs.notify(CONFIG.APP_NAME, resp.message);
						$("#member-"+userId).fadeOut();
						growl.addSuccessMessage(resp.message);
						$timeout(function(){
							$scope.members.findAndRemove("userId", userId);
						}, 500);
					}
					else {
						dialog = $dialogs.error(CONFIG.APP_NAME, resp.message);
					}
				});
		}

		confirmDialog = $dialogs
			.confirm(CONFIG.APP_NAME,'Removing this member will also removed him/her from the assigned boards and cards. Would you like to continue?')
			.result.then(function(btn){
				if(btn === "yes") {
					remove()
				}
			});
	}


	$scope.setMemberRole = function onSetMemberRole(member) {
		var newRole = $scope.toggleRole(member.role);
		confirmDialog = $dialogs
			.confirm(CONFIG.APP_NAME,'Are you sure you want to set {0} as {1}?'.format(member.fullname, newRole))
			.result.then(function(btn){
				if(btn === "yes") {
					MemberService
					.setRole({
						accountId: $scope.project.accountId, 
						memberId: member.userId,
						memberRole: newRole.toUpperCase()
					})
					.then(function onSuccess(resp) {
						if(resp.success){
							//Refresh Member list
							CompanyService.members($scope.project.accountId)
							.then(function(response){
								$scope.members = response.data || [];
							})
							dialog = $dialogs.notify(CONFIG.APP_NAME, resp.message);
						}
						else {
							dialog = $dialogs.error(CONFIG.APP_NAME, resp.message);
						}
					});
				}
			});
	}

	$scope.resendInvite = function onResendInvite(member) {
		function resendInvitation() {
			MemberService
				.reInvite({
					accountId: $scope.project.accountId, 
					userId: member.userId,
					email: member.email
				})
				.then(function onSuccess(resp) {
					// Everything is smooth, delete/decline of invitation successful
					if(resp.success){
						//$dialogs.notify(CONFIG.APP_NAME, resp.message);
						//$("#member-"+userId).fadeOut();
						growl.addSuccessMessage(resp.message);
					}
					else {
						dialog = $dialogs.error(CONFIG.APP_NAME, resp.message);
					}
				});
		}

		confirmDialog = $dialogs
			.confirm(CONFIG.APP_NAME,'Are you sure you want to re-send invite to ' + member.fullname + ' ?' )
			.result.then(function(btn){
				if(btn === "yes") {
					resendInvitation()
				}
			});
	};


	$scope.deleteBoard = function onDeleteBoard(boardId) {
		function remove() {
			BoardService
				.delete(boardId)
				.then(function onSuccess(resp) {
					if(resp.success){
						dialog = $dialogs.notify(CONFIG.APP_NAME, resp.message);
					}
					else {
						dialog = $dialogs.error(CONFIG.APP_NAME, resp.message);
					}
				});
		}

		confirmDialog = $dialogs
			.confirm(CONFIG.APP_NAME,'Deleting this board could affect the Project, Are you sure you want to delete this board?')
			.result.then(function(btn){
				if(btn === "yes") {
					remove()
				}
			});
	}

	$scope.isAccountOwner = function onIsAdmin() {
		return userInfo.id === account.data.ownerId;
	}

	$scope.isOwnerRow = function onIsOwnerRow(memberId) {
		return account.data.ownerId === memberId;
	}

	$scope.toggleRole = function onToggleRole(role){
		var result, USERROLE = {
			ADMIN: "ADMIN",
			MEMBER: "MEMBER"
		}
		switch(role.toUpperCase()){
			case USERROLE.ADMIN:
				result = USERROLE.MEMBER;
				break;
			case USERROLE.MEMBER:
				result = USERROLE.ADMIN;
				break;
			default:
				result = role;
				break;
		}
		return result.toPascalCase();
	};

}]);;app.controller('InviteMemberCtrl', ['$scope', '$dialogs', 'CONFIG', 'MemberService', 'growl', function($scope, $dialogs, CONFIG, MemberService, growl ) {
	//$scope.member = data.member;
	//$scope.account = data.account;

	$scope.credentials = {
		accountId: $scope.project.accountId,
		email: $scope.member.existingEmail
	};

	$scope.inviteMember = function onInviteMember() {
		$scope.credentials.email = $scope.member.existingEmail;

		$scope.InviteMember($scope.credentials);
		
	}

	/*$scope.cancel = function onCancel(){
		//$modalInstance.dismiss('canceled');
	};*/

}]);;app.controller('LabelCtrl', ['$scope', '$rootScope', '$timeout', 'CONFIG', '$dialogs', 'LabelService', 'growl', function($scope, $rootScope, $timeout, CONFIG, $dialogs, LabelService, growl) {


	$scope.submitLabel = function(editMode){
		if(editMode)
			$scope.updateLabel();
		else
			$scope.addLabel();
	}

	$scope.addLabel = function() {
		if(!$scope.label || !$scope.color) {
			//$scope.errorMessage = "Please select a color and enter a name for the label.";
			growl.addErrorMessage("Please select a color and enter a name for the label.");
			return;
		}

		var params = {
			name: $scope.label,
			color: $scope.color,
			userId: $scope.project.userId,
			accountId: $scope.project.accountId
		};

		LabelService
			.create(params)
			.then(function onSuccess(resp) {
				if (!resp.success) {
					$scope.errorMessage = resp.message;
				}
				else {
					growl.addSuccessMessage(resp.message);
					$scope.labels.push(resp.data)
					$rootScope.$broadcast("labels:updated", $scope.labels);
					$scope.reset();
				}
			});
	}

	$scope.displayLabel = function(label) {
		$scope.editMode = true;
		$scope.label = label.name;
		$scope.color = label.color;
		$scope.id = label.id;
		$("[name='label']").focus();
		deselectLabel();
	}

	$timeout(function(){
		$scope.colorSelector = function(index,color){
			$scope.color = color;
			$scope.colorIndex = index;
			deselectLabel();
			$("[name='label']").focus();
			$('label .check-'+index).css('opacity','1');
		};
	},200);
	
	$scope.updateLabel = function(id) {

		if(!$scope.label || !$scope.color) {
			//$scope.errorMessage = "Please select a color and enter a name for the label.";
			growl.addErrorMessage("Please select a color and enter a name for the label.");
			return;
		}

		var params = {
			//id: $scope.id,
			name: $scope.label,
			color: $scope.color,
			//userId: $rootScope.userInfo.id,
			//companyId: $rootScope.companyInfo.id
		};

		LabelService
			.update($scope.id, params)
			.then(function onSuccess(resp) {
				if (!resp.success) {
					$scope.errorMessage = resp.message;
				} else {
					for(var i=$scope.labels.length-1; i>=0; i--) {
						if ($scope.labels[i].id == $scope.id) {
							$scope.labels[i] = resp.data;
							break;
						}
					}
					growl.addSuccessMessage(resp.message);
					$rootScope.$broadcast("labels:updated", $scope.labels);
					$scope.reset();
				}
			});
	}
	
	$scope.reset = function() {
		$scope.editMode = false;
		$scope.label = "";
		$scope.color = "";
		$(".clr-opt").removeClass('active');
		$('label .check-'+$scope.colorIndex).css('opacity','0');		
	}

	$scope.deleteLabel = function(id) {

		function remove() {
			LabelService
				.delete(id)
				.then(function onSuccess(resp) {
					if (!resp.success) {
						//$scope.errorMessage = resp.message;
						growl.addErrorMessage(resp.message);
					} else {
						for(var i=$scope.labels.length-1; i>=0; i--) {
							if ($scope.labels[i].id == id) {
								$scope.labels.splice(i,1);
								break;
							}
						}
						growl.addSuccessMessage(resp.message);
						$rootScope.$broadcast("labels:updated", $scope.labels);
						$scope.reset();
					}
				});
		}

		confirmDialog = $dialogs
			.confirm(CONFIG.APP_NAME,'Deleting this label will also remove all the the label assigned to this card. Would you like to continue?')
			.result.then(function(btn){
				if(btn === "yes") {
					remove()
				}
			});
	}

	$scope.cancelEdit = function(){
		$scope.reset();
		$scope.editMode=false;
	}

	function deselectLabel(){
		for(var i in $scope.colors){
			$('label .check-'+i).css('opacity','0');
		}
	}
}]);

;app.controller('ManageProjectCtrl', ['$scope', '$rootScope', '$modalInstance', '$timeout', 'data', '$dialogs', '$location', 'CONFIG','SessionStorageService', 'BoardService', 'AccountService', 'CompanyService', 'MemberService', 'LabelService', 'growl', 
	function($scope, $rootScope, $modalInstance, $timeout, data, $dialogs, $location, CONFIG, SessionStorageService, BoardService, AccountService, CompanyService, MemberService, LabelService, growl) {

	
	$scope.toggleIcon = 'fa fa-plus-square';
	$scope.colors = CONFIG.DEFAULT_LABEL_COLOURS;
	$scope.labels = data.labels;
	$scope.members = data.projMembers;
	$scope.userInfo = data.userInfo;

	$scope.project = {
		accountId: data.account.accountId,
		userId: data.id,
		companyName: data.account.name,
		companyDescription: data.account.description
	}

	$scope.member = {
		accountId: data.account.accountId,
		displayName: "",
		email: "",
		password: ""
	};

	/* Project */
	$scope.updateProject = function onUpdate() {

		if(!$scope.project.companyName) return;

		AccountService
			.update(data.account.accountId, $scope.project)
			.then(function onCreateSuccess(resp) {


				if(!resp.success) {
					growl.addErrorMessage(resp.message);
					return;
				}

				growl.addSuccessMessage(resp.message);
				$scope.setProjectAlignment();
				$rootScope.$broadcast("project:updated", angular.extend(resp.data, {accountId:data.account.accountId}));
				$modalInstance.dismiss('canceled');
			});
	}

	$scope.cancel = function(){
		$modalInstance.dismiss('canceled');
	};

	$scope.toggleTab = function(view){
		$('#project, #label, #team').hide();
		$('#'+view).fadeIn();
	};

	$scope.toggleMember = function(view){
		if(view == 1){
			$scope.inviteExisting();
		}else{		
			$('#existingMember').hide();
			$('#newMember').fadeIn();
		}
	};

	$scope.inviteExisting = function(){
		$('#newMember').hide();
		$('#existingMember').fadeIn();
	};

	$scope.toggleAdvanced = function onToggleAdvanced() {
		$scope.advancedToggleShown = !$scope.advancedToggleShown;
		$scope.toggleIcon = !$scope.advancedToggleShown ? "fa fa-plus-square" : "fa fa-minus-square";
	}

	$scope.InviteMember = function(credentials){
		MemberService
			.invite(credentials)
			.then(function onSuccess(resp) {
				if(resp.success) {
					growl.addSuccessMessage(resp.message);
					$scope.appendAddedMember(resp);
					$scope.member.existingEmail = '';
					$("#existingMember form").parsley().reset();
					$("#existingMember form :input:not(:button)").val("")
					return;
				}else {
					//$scope.errorMessage = resp.message;
					growl.addErrorMessage(resp.message);
				}
			});
	};	

	$scope.appendAddedMember = function(resp){
		var newMember = {
			fullname: resp.data.fullname,
			userId: resp.data.id,
			role: 'MEMBER',
			status: 'PENDING'
		}
		$scope.members.push(newMember);
	};

	/* Label */

	$scope.onSelect = function onSelect(color) {
		$scope.$apply(function() {
			$scope.color = color;
		});
	};

	$scope.reset = function(){
		$scope.member = {};
	};

	$scope.setProjectAlignment = function(){
		var projectName = $("#projectName-"+data.account.accountId);
		var projectDesc = $("#projectDesc-"+data.account.accountId);

		if($scope.project.companyDescription != ''){
			projectName.removeClass('centered');
		}else{
			projectName.addClass('centered');
		}

		projectName.text($scope.project.companyName);
		projectDesc.text($scope.project.companyDescription);
	};

	$scope.deleteProject = function onDeleteProject($event) {
		function remove() {
			AccountService
				.delete($scope.project.accountId)
				.then(function onDelete() {
					$rootScope.$broadcast("project:deleted", $scope.project.accountId);
					$modalInstance.dismiss('canceled');
				});
		}

		confirmDialog = $dialogs
			.confirm(CONFIG.APP_NAME,'Are you sure you want to delete this project? All boards under this project will be removed as well.')
			.result.then(function(btn){
				if(btn === "yes") {
					remove()
				}
			});
	}

}]);;app.directive('assignMembers', ['$timeout','UserService', function($timeout, UserService) {
	var BOARD = "board",
		CARD = "card",
		boardRoleIcon = {
			template: "<a href='javascript:;' title='{0}' class='fa fa-user role-{1} member-role-icon {2}' nopopover='true'></a>",
			selector: "a.member-role-icon",
			parent: "a.member"
		}
	return {
	link: function(scope, element, attrs) {
		var $element = $(element[0]);

		function init(){
			var $projectlist = $(".coy-members .member-list", $element),
				$boardlist = $(".board-members .member-list", $element),
				draggableConfig = {
					cancel: "",
					revert: "invalid",
					containment: "document",
					helper: "clone",
					cursor: "move"
				}

			$( "li", $projectlist ).draggable(draggableConfig);
			$( "li:not([data-draggable='false'])", $boardlist ).draggable(draggableConfig);

			$projectlist.droppable({
				accept: ".board-members .member-list li",
				activeClass: "coy-members-highlight",
				drop: function(event,ui) {
					removeMember(ui.draggable, $projectlist);
				}
			});

			 $boardlist.droppable({
				accept: ".coy-members .member-list li",
				activeClass: "board-members-highlight",
				drop: function(event,ui) {
					addMember(ui.draggable, $boardlist, $projectlist);
				}
			});
			
			 //Assign to cards
			//makeCardsDroppable();

			var boardlistitems = $boardlist.find("li");
			$.each(boardlistitems, function(i, e){
				var mem = getMemberJson($(e));
				if(mem) addRoleIconOnAvatar($(e), mem);
			})
		}

		scope.$on("refreshMemberList", function(){
			scope.search.fullname = "";
			$timeout(init,250);
		});

		function addMember(item, destination, source) {
			var mem = getMemberJson(item);
			item.fadeOut(function() {
				var $list = $(destination).find("ul");
				item.appendTo($list).fadeIn(function(){
					$timeout(function(){
						if(attrs.assignMembers === BOARD) {
							scope.addBoardMember(mem.userId, mem.boardRole = mem.role);
						} else {
							scope.addCardMember(mem.id);
						}
					}, 0);
				});
			});
		}

		function removeMember(item, destination) {
			var mem = getMemberJson(item);
			item.fadeOut(function() {
				item.find(boardRoleIcon.selector).remove();

				item.appendTo(destination).fadeIn(function(){
					$timeout(function(){
						if(attrs.assignMembers === BOARD) {
							scope.removeBoardMember(mem.userId);
						} else {
							scope.removeCardMember(mem.id);
						}
					}, 0);
				});
			});
		}

		
		function addRoleIconOnAvatar(item, mem){
			var roleIconInfo = UserService.getAccessMatrix(scope.userInfo, mem.role,mem.boardRole); //getRoleIconInfo(mem.role,mem.boardRole, mem.boardRole);
			item.find(boardRoleIcon.selector).remove();
			if(roleIconInfo.board.assignRole){
				item.find(boardRoleIcon.parent).prepend(boardRoleIcon.template.format("Set as " + roleIconInfo.toggleRole, roleIconInfo.icon, "pointer")).end();
				item.find(boardRoleIcon.parent + ' > a').click(function(){
					scope.updateBoardMemberRole(mem.userId, mem.boardRole = roleIconInfo.toggleRole);
				});
			}else
				item.find(boardRoleIcon.parent).prepend(boardRoleIcon.template.format("Board " + mem.boardRole.toPascalCase(), roleIconInfo.icon, "")).end();
		}

		function getMemberJson(item){
			var $el = item.find(boardRoleIcon.parent),
				m = $el.attr("data-member");
			if(m) return JSON.parse(m ? m : {});
			return false;
		}

		/*Assign to Cards*/
		/*
		scope.$on("newCardCreated", function(){
			//$timeout(makeCardsDroppable,250);
		});

		function makeCardsDroppable(){
			$(".card-details:not(.ui-droppable)").droppable({
				accept: ".board-members .member-list li",
				activeClass: "coy-members-highlight",
				drop: function(event,ui) {
					assignMemberToCards($(ui.draggable).clone(), $(this).find(".card-assignee"))
				}
			});
		}

		function assignMemberToCards(item, destination){
			var itemId = item.find("a.member").attr("id"), isClone = false;

			$.each(destination.find("a.member"), function(i,e){
				if(e.id == itemId) return isClone = true;
			});
			if(isClone) return false;
			//item.find("a.member-role-icon" ).remove();
			item.appendTo(destination).fadeIn();
		}
		*/

		$timeout(init,250);
	}
	}
}]);;app.directive('autoFill', ['$timeout', function($timeout) {
	//This directive to sync auto-fill values with the angular model
	return {
	require: 'ngModel',
	link: function(scope, elem, attrs, ngModel) {
		var origVal = elem.val();
		$timeout(function () {
			var newVal = elem.val();
			if(ngModel.$pristine && origVal !== newVal) {
					ngModel.$setViewValue(newVal);
				}
			}, 500);
		}
	}
}]);;app.directive('avatar', ['$timeout', '$rootScope', 'CONFIG', 'AuthenticationService', 'SessionStorageService',  function($timeout, $rootScope, CONFIG, AuthenticationService, SessionStorageService){
	return {
		restrict: 'A',
		scope: {
			user: "=data"
		},
		link: function(scope, element, attrs) {
			
			var noavatar = 'images/avatar-blank.jpg';
			function init(){

				// Only logged-in user should have access to the avatars
				if(!AuthenticationService.isLoggedIn()){
					return;
				}

				if(!scope.user) {
					$(element).attr("src", noavatar);
					return;
				}

				var src = scope.user.useAvatar ?  scope.user.avatar : noavatar;
				var ts = new Date();
				$(element).attr("src",  CONFIG.SYS_PARAMS.url + src + "?" + ts.getTime());

				if($(element).attr('nopopover') == 'true') {
					return false;
				}

				$(element).parent().attr("data-title", scope.user.fullname);
				$(element).parent().popover();
			}

			scope.$watch("user", function(newVal, oldVal) {
				if ((newVal && oldVal && newVal.avatar != oldVal.avatar) || (newVal && !oldVal) ) {
					init();
				}
			}, true);

			$rootScope.$on("userInfo:updated", function(events, userInfo) {
				//systemParams = SessionStorageService.getSystemParams();
				init();
			});

			$timeout(init, 10);
		}
	}
}]);;app.directive('dateTimePicker', [function() {
	return {
		scope: true,
		restrict: 'A',
		link: function (scope, element, attrs) {
			$('.bootstrap-datetimepicker-widget').remove();
			$(element[0])
				.datetimepicker({
					defaultDate: scope.card.dueDate || "",
					language: 'en',
					format: 'YYYY/MM/DD HH:mm:ss',
					pickDate: true, //en/disables the date picker
					//pickTime: false, //en/disables the time picker
					startDate: new Date()
				})
				.on('dp.change', function (e){

					// if(!e.date) {
					// 	return;
					// }

					var dueDate = $("[data-dueDate]", this).val();
					scope.saveDueDate(dueDate);
				});

		}
	};
}]);;app.directive('labelPicker', ['$compile', '$timeout', function($compile, $timeout) {

	var templateNotEmpty = '<ul class="list-style-clear label-picker">' +
						'<li ng-repeat="label in projLabels">' +
							'<div ng-click="assignLabel(label.id)" class="btn btn-info ng-binding" ng-style="{backgroundColor: ' + "'#'" + ' + label.color}">' +
								'<i class="icon icon-ok"></i>{{label.name}}' +
							'</div>' +
						'</li>' +
					'</ul>';
	var templateEmpty = '<span class="no-members-popover">No labels were created for this project yet. Please go to project settings to manage labels.</span>';

	return {
		scope: true,
		restrict: 'A',
		link: function (scope, element, attrs) {
			function init(){
				$(element).parent().append( scope.projLabels.length == 0 ? templateEmpty : templateNotEmpty);
				$compile($(element).next())(scope);
				
				var options = {
					html: true,
					placement: "right",
					title: function() {
						return attrs.title;
					},
					content:$(element).next()
				};

				$(element).popover(options);
				$(element).next().remove();
			}
			$timeout(init, 100);
		}
	};
}]);;app.directive('parsleyValidator', ['$rootScope', '$timeout', '$parse', function($rootScope, $timeout, $parse) {

	var RE_ALPHANUMERIC_SPACE = /^[\w\d_\s]*$/;

	return {
		restrict: 'A',
		requrie: 'form',
		link: function (scope, element, attrs) {

			function init(){
				var $form = $(element[0]);
				var func = $parse(attrs.submit);
				var inst = $form.parsley({
					errorClass: 'parsley-error',
					validators: {
						notequalto: function () {
							return {
								validate: function ( val, elem, self ) {
									self.options.validateIfUnchanged = true;
									return val !== $( elem ).val();
								}
								, priority: 64
							}
						},
						alphanumspace: function () {
							return {
								validate: function ( prop, value ) {
									return RE_ALPHANUMERIC_SPACE.test(value);
								}
								, priority: 32
							}
						}
					},
					listeners: {
						onFormValidate: function( isFormValid, event, ParsleyForm ) {
							if(isFormValid) {
								scope.$apply(function() {
									func(scope, {$event:event});
								});
							}
						}
					}
				});
			}

			$timeout(init, 100);

			$rootScope.$on("parsleyValidation:refresh", function(){
				$timeout(function(){
					$(element[0]).parsley('destroy');
					init();
				},500)

			});
		}
	}

}]);;app.directive('postCardsLoop', [function() {
	return  function(scope, element, attrs) {
		if (scope.$last){
			scope.$emit('adjustColumnHeight');
		}
	}
}]);;app.directive('resizeableListing', ['$timeout', 'CONFIG', function($timeout, CONFIG) {

	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			var $element = $(element[0]);

			var resize = function onResize() {
				var bodyHeight = $(window).height();
				var footerHeight = $(".footer").height();
				var subHeaderHeight = (attrs.resizeableListing==="projects") ? 55 : 125;
				var navBarHeight = 55;
				var computedHeight  = bodyHeight - (footerHeight + subHeaderHeight + navBarHeight);

				$element.css("max-height",computedHeight);
			}

			$(window).resize(function() {
				$timeout(resize,0);
			});

			resize();

		}
	}

}]);;app.directive('responseMessage', ['$timeout', function($timeout) {
	return {
		restrict: 'A',
		scope: {
			data:"=data"
		},
		link: function (scope, element, attrs) {
			var $element = $(element[0]);

			function init(){
				$element.attr("class", "alert alert-{0} error-msg".format(scope.data.success ? "success" : "danger"));
				$element.html(scope.data.message);
				scope.data.show ? $element.show() : $element.hide();

				var $close = $element.find(".close-message");
				if($close.length === 0){
					$close = $("<i class='close-message pointer pull-right fa fa-times-circle'></i>").on("click", function(event){
						$(event.target).parent().hide();
						scope.data.show = false;
						scope.data.message = "";
					}).appendTo($element);
				}
			}

			scope.$watch("data", function(newVal, oldVal){
				init();
			}, true);

			$timeout(init, 10);
		}
	}

}]);;app.directive('routeChangeListener', ['$timeout', 'CONFIG', function($timeout, CONFIG) {

	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			var $element = $(element[0]);

			function routeChanged(event, route) { 
				if(route.params.accountId && route.params.boardId) {
					$element.addClass("board");
				} else {
					$element.removeClass("board");
				}
			}

			scope.$on("$routeChangeSuccess", routeChanged);

		}
	}

}]);;app.directive('sortableCards', ['CONFIG', '$timeout', function(CONFIG, $timeout) {
	return {
		restrict: 'A',
		require: '?ngModel',
		link: function (scope, element, attrs, ngModel) {
			var $element = $(element[0]);

			var timeout;
			function getColumnPosition(id) {
				var pos = 0;
				angular.forEach(scope.column.cards, function onEachColumn(card) {
					if(card.id === id) {
						pos = card.pos;
					}
				});
				return pos;
			}


			$(element).sortable({
				connectWith: ".cards",
				opacity: 0.9,
				placeholder: "highlight",
				start: function (event, ui) {
					$('.highlight', $element).css({
						'height':  $(ui.item).outerHeight(),
						'margin-bottom': 10
					})

					ui.item.toggleClass("highlight");

					scope.$emit('hideAllColumnContextMenu');
					scope.$emit('hideAllEditTitleForm');
				},
				stop: function (event, ui) {
					ui.item.toggleClass("highlight");
				},
				update: function(event, ui) {
					var $target = $(ui.item);

					var $prev = $target.prev();
					var $next = $target.next();
					var $last = $target.siblings(".card:last"); // In case moving to the last, needed the last element
					var prevPos = +getColumnPosition( $prev.attr("data-id") );
					var nextPos = +getColumnPosition( $next.attr("data-id") );
					var lastPos = +getColumnPosition( $last.attr("data-id") );
					var prevVal = ($prev.length && prevPos) || 0;
					var nextVal = ($next.length && nextPos) || (lastPos + CONFIG.CARD_POSITION_INTERVAL);
					var newPos = Math.ceil((prevVal + nextVal) / 2);
					var columnId = $target.closest("li.list").attr("data-id");
					scope.updateCardPosition($target.attr("data-id"), {pos: newPos, columnId: columnId});

				}
			}).disableSelection();
			
			$(element).bind('click.sortable mousedown.sortable',function(ev){
				ev.target.focus();
			});
		}
	}
}]);;app.directive('sortableColumns', ['CONFIG', function(CONFIG) {

	var COLUMN_WIDTH = 320;

	return {
		restrict: 'A',
		scope: true,
		link: function (scope, element, attrs) {
			var $element = $(element[0]);

			function updateSortableAreaWidth() {
				if(!scope.columns) return;
				var newWidth = (scope.columns.length + 1) * COLUMN_WIDTH; // +1 For create column button
				var windowWidth = $(window).width();

				if(newWidth > windowWidth) {
					$element.css({width:newWidth});
				} else {
					$element.css({width:windowWidth});
				}
			}

			function hideAllColumnContextMenu() {
				$('#sortable-columns .list').find('.dropdown-menu').removeClass('show');
			}

			function hideAllEditTitleForm() {
				var paneHeader = $('#sortable-columns .list').find('.pane-header');

				$(paneHeader).find('a, h2').removeClass('hide');
				$(paneHeader).find('.edit-title-group').addClass('hide');
			}

			function getColumnPosition(id) {
				var pos = 0;
				angular.forEach(scope.columns, function onEachColumn(column) {
					if(column.id === id) {
						pos = column.pos;
					}
				});
				return pos;
			}

			function adjustColumnHeight() {
				var boardArea = $('.board-area').height(),
					navBar = $('.board-area .navbar').height(),
					maxColumnHeight = boardArea - (navBar + 185) ;

				$('.cards').css({'max-height':maxColumnHeight});
				$("[data-scroll='activities']").css({'max-height':maxColumnHeight-30});
			}

			scope.$on('updateSortableAreaWidth', updateSortableAreaWidth);
			scope.$on('hideAllColumnContextMenu', hideAllColumnContextMenu);
			scope.$on('hideAllEditTitleForm', hideAllEditTitleForm);
			scope.$on('adjustColumnHeight', adjustColumnHeight);

			updateSortableAreaWidth();
			adjustColumnHeight();

			$(window).resize(function() {
				adjustColumnHeight();
			});

			$element.sortable({
				handle: '.pane-header',
				placeholder: 'highlight',
				opacity: 0.9,
				start: function onStart(event, ui) { //Mousedown
					$('.highlight', $element).css({
						height: $(ui.item).height()
					})
					ui.item.toggleClass("highlight");

					hideAllColumnContextMenu();
					hideAllEditTitleForm();
					
					$element.find('.create-column-action').hide();
				},
				stop: function onStop(event, ui) { //Mouseupdate
					ui.item.toggleClass("highlight");
					$element.find('.create-column-action').show();
				},
				change: function onOver(event, ui) {},
				update: function onUpdate(event, ui) { //Update within the same sortable
					scope.$apply();
					var $target = $(ui.item);

					if(typeof scope.updatePosition === 'function') {
						
						var $prev = $target.prev();
						var $next = $target.next();
						var $last = $target.siblings(".list:last"); // In case moving to the last, needed the last element

						var prevPos =  +getColumnPosition( $prev.attr("data-id") );
						var nextPos =  +getColumnPosition( $next.attr("data-id") );
						var lastPos = +getColumnPosition( $last.attr("data-id") );

						var prevVal = ($prev.length && prevPos) || 0;
						var nextVal = ($next.length && nextPos) || (lastPos + CONFIG.COLUMN_POSITION_INTERVAL);
						var newPos = Math.ceil((prevVal + nextVal) / 2);

						scope.updatePosition($target.attr("data-id"), newPos);
					}
				}
			});
		}
	}
}]);;app.directive('sortableTableRows', ['$timeout', 'CONFIG', function($timeout, CONFIG) {

	return {
		restrict: 'A',
		scope: true,
		require: '?ngModel',
		link: function (scope, element, attrs, ngModel) {

			var $element = $(element[0]);

			function init() {
				$element.sortable({
					cursor: "move",
					handle: ".handle",
					update: function onUpdate(event, ui) {
						var columns = [];
						$element.find("tr").each(function onEachTr(i, tr) {
							var column = $(tr).attr("data-column");
							columns.push(angular.extend(JSON.parse(column) || $.parseJSON(column), {pos: (i+1) * CONFIG.COLUMN_POSITION_INTERVAL}));
						});
						scope.updateColumns(columns)
					}
				});
			}

			$timeout(init,0);
		}
	}

}]);;app.directive('toggleActionButton', [function() {
	return {
		link: function (scope, element, attrs) {
			$( element ).hover(
				function() {
					$(this).find('.manageMember').fadeIn('fast');
				}, function() {
					$(this).find('.manageMember').fadeOut('fast');
				}
			);	
		}
	};
}]);

;app.directive('toggleActionsSet', ['$timeout', '$rootScope', 'throttle', function($timeout, $rootScope, throttle) {

	return {
		restrict: 'A',
		link: function (scope, element, attrs) {

			function init() {
				$(element).find('.board-row').off('mouseover').mouseover(function() {
					$(this).addClass('over');
					$(this).find('.board').removeClass('hide');
				})
				$(element).find('.board-row').off('mouseout').mouseout(function() {
					$(this).removeClass('over');
					$(this).find('.board').addClass('hide');
				})
			}
			$timeout(init,0);

			var fn = throttle(0, function() { $timeout(init,500); });
			$rootScope.$on("board:created", fn);
			$rootScope.$on("board:updated", fn);
			$rootScope.$on("board:deleted", fn);
		}
	}
}]);;app.directive('toggleBoardLists', ['$timeout', '$rootScope', 'CONFIG', function($timeout, $rootScope, CONFIG) {

	var currTarget = null;

	return {
		restrict: 'A',
		scope: true,
		link: function (scope, element, attrs) {

			var $element = $(element[0]);

			function click($event) {
				var $target = $($event.target);
				if(!$target.is(".trigger")) {
					return;
				}
				var	$li = $target.closest("li"),
					$group = $li.find('.board-group'),
					height = scope.activeBoardsLen * 28,
					currentSetHeight = $group.height(),
					opacity = 1;

				if(currentSetHeight > 0) {
					height = 0;
					opacity = 0;
				} else {
					//$('.company-list').find('.board-group').css({height:0, opacity: 0});
					if(height == 0) {
						height =  28;
						opacity = 1;
					}
				}
				$group.css({height: height, opacity: opacity});
			}

			function init() {
				$element.click(click);
			}


			function adjustHeight(event, board) {
				if(board.accountId !== scope.project.accountId) {
					return;
				}
				var len = board.id ? ++scope.activeBoardsLen : --scope.activeBoardsLen;

				var $li = $("[data-id='"+board.accountId+"']"),
					height = len * 28,
					$group = $li.find('.board-group'),
					currentSetHeight = $group.height();
				if(currentSetHeight > 0) {
					$group.css({height: height});
				}
			}

			$timeout(init,0);
			$rootScope.$on("board:created", adjustHeight);
			$rootScope.$on("board:deleted", adjustHeight);
		}
	}

}]);;app.directive('toggleOnAuthenticated', ['$rootScope', 'AuthenticationService', function($rootScope, AuthenticationService) {

	return {
		restrict: 'A',
		link: function (scope, element, attrs) {

			var $element = $(element[0]);

			function toggleIfAuthenticated() {
				if( (AuthenticationService.isLoggedIn() && attrs.toggleOnAuthenticated === "true") 
					|| (!AuthenticationService.isLoggedIn() && attrs.toggleOnAuthenticated === "false") ) {
					$element.removeClass('hide');
					$rootScope.$broadcast('header.authenticated', AuthenticationService.isLoggedIn());
				} else {
					$element.addClass('hide');
				}
			}

			scope.$on('$routeChangeSuccess', toggleIfAuthenticated);
			toggleIfAuthenticated();
		}
	}

}]);;app.directive('toggleSlideMenu', ['$location', function($location) {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			var $sp = $('.slide-panel'),
				 $membersPane = $('.side-manage-members'),
				 $activityPane = $('.side-activity-stream');

			if($location.path().match(/board/g) == null) {
				$(element).addClass('hide');
				return false;
			}

			$(element).removeClass('hide');

			function resetPanes() {
				$sp.toggleClass('on');
				$membersPane.addClass('hide');
				$activityPane.addClass('hide');
			}
			
			element.bind('click', function() {
				if(attrs.toggleSlideMenu == 'close')  {
					resetPanes();
					return false;
				}
				
				if ($membersPane.hasClass('hide') && $activityPane.hasClass('hide')) {
					resetPanes();
				}
				
				if($sp.hasClass('on')) {
					$membersPane.addClass('hide');
					$activityPane.addClass('hide');
				
					if(attrs.toggleSlideMenu == 'members')  {
						$membersPane.removeClass('hide');
					} else if(attrs.toggleSlideMenu == 'activity')  {
						$activityPane.removeClass('hide');
					}
				}

			})
			
			$(element).tooltip();
		}
	}
}]);;app.directive('toggleSwitch', ['$location', function($location) {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			//console.log(element)
			$(element).bootstrapSwitch();
		}
	}
}]);;app.directive('uiSortable', ['$timeout', '$log', 'CONFIG', function($timeout, $log, CONFIG) {

			return {
				require: '?ngModel',
				link: function(scope, element, attrs, ngModel) {
					var savedNodes;
					element = $(element);


					function combineCallbacks(first,second){
						if(second && (typeof second === 'function')) {
							return function(e, ui) {
								first(e, ui);
								second(e, ui);
							};
						}
						return first;
					}

					function getColumnPosition(id) {
						var pos = 0;
						angular.forEach(ngModel.$modelValue, function onEachCard(card) {
							if(card.id === id) {
								pos = card.pos;
							}
						});
						return pos;
					}


					var opts = {};

					var callbacks = {
						receive: null,
						remove:null,
						start:null,
						stop:null,
						update:null
					};

					angular.extend(opts, {
							connectWith: ".cards",
							items: ".card",
							opacity: 0.9,
							placeholder: "highlight",
							start: function (event, ui) {
								$('.highlight', element).css({
									'height': $(ui.item).outerHeight(),
									'margin-bottom': 10
								});

								ui.item.toggleClass("highlight");
								$(".popover").remove();

								scope.$emit('hideAllColumnContextMenu');
								scope.$emit('hideAllEditTitleForm');
							},
							stop: function (event, ui) {
								ui.item.toggleClass("highlight");
								$(".popover").remove();
							},
							update: function(event, ui) {
								var cardId = $(ui.item).attr("data-id");
								function onUpdate() {
									var $target = $( ui.item.sortable.droptarget.find("> div").get( ui.item.sortable.dropindex ) );

									var $prev = $target.prev();
									var $next = $target.next();
									var $last = $target.siblings(".card:last"); // In case moving to the last, needed the last element

									var prevPos = +getColumnPosition( $prev.attr("data-id") );
									var nextPos = +getColumnPosition( $next.attr("data-id") );
									var lastPos = +getColumnPosition( $last.attr("data-id") );

									var prevVal = ($prev.length && prevPos) || 0;
									var nextVal = ($next.length && nextPos) || (lastPos + CONFIG.CARD_POSITION_INTERVAL);
									var newPos = Math.ceil((prevVal + nextVal) / 2);

									//console.log('prevPos',prevPos,'nextPos',nextPos,'newPos',newPos,'lastPos',lastPos);

									var columnId = ui.item.sortable.droptarget.closest("li.list").attr("data-id");
									scope.updateCardPosition(cardId, {pos: newPos, columnId: columnId});
								}
								$timeout(onUpdate,0);
							}

					});

					if (ngModel) {

						// When we add or remove elements, we need the sortable to 'refresh'
						// so it can find the new/removed elements.
						scope.$watch(attrs.ngModel+'.length', function() {
							// Timeout to let ng-repeat modify the DOM
							$timeout(function() {
								if (!!element.data('ui-sortable')) {
									element.sortable('refresh');
								}
							});
						});

						callbacks.start = function(e, ui) {
							// Save the starting position of dragged item
							ui.item.sortable = {
								index: ui.item.index(),
								cancel: function () {
									ui.item.sortable._isCanceled = true;
								},
								isCanceled: function () {
									return ui.item.sortable._isCanceled;
								},
								_isCanceled: false
							};
						};

						callbacks.activate = function(/*e, ui*/) {
							// We need to make a copy of the current element's contents so
							// we can restore it after sortable has messed it up.
							// This is inside activate (instead of start) in order to save
							// both lists when dragging between connected lists.
							savedNodes = element.contents();

							// If this list has a placeholder (the connected lists won't),
							// don't inlcude it in saved nodes.
							var placeholder = element.sortable('option','placeholder');

							// placeholder.element will be a function if the placeholder, has
							// been created (placeholder will be an object).	If it hasn't
							// been created, either placeholder will be false if no
							// placeholder class was given or placeholder.element will be
							// undefined if a class was given (placeholder will be a string)
							if (placeholder && placeholder.element && typeof placeholder.element === 'function') {
								var phElement = placeholder.element();
								// workaround for jquery ui 1.9.x,
								// not returning jquery collection
								if (!phElement.jquery) {
									phElement = angular.element(phElement);
								}

								// exact match with the placeholder's class attribute to handle
								// the case that multiple connected sortables exist and
								// the placehoilder option equals the class of sortable items
								var excludes = element.find('[class="' + phElement.attr('class') + '"]');

								savedNodes = savedNodes.not(excludes);
							}
						};

						callbacks.update = function(e, ui) {

							// Save current drop position but only if this is not a second
							// update that happens when moving between lists because then
							// the value will be overwritten with the old value
							if(!ui.item.sortable.received) {
								ui.item.sortable.dropindex = ui.item.index();
								ui.item.sortable.droptarget = ui.item.parent();

								// Cancel the sort (let ng-repeat do the sort for us)
								// Don't cancel if this is the received list because it has
								// already been canceled in the other list, and trying to cancel
								// here will mess up the DOM.

								element.sortable('cancel');
							}

							// Put the nodes back exactly the way they started (this is very
							// important because ng-repeat uses comment elements to delineate
							// the start and stop of repeat sections and sortable doesn't
							// respect their order (even if we cancel, the order of the
							// comments are still messed up).
							if (element.sortable('option','helper') === 'clone') {
								// restore all the savedNodes except .ui-sortable-helper element
								// (which is placed last). That way it will be garbage collected.
								savedNodes = savedNodes.not(savedNodes.last());
							}
							savedNodes.appendTo(element);


							// If received is true (an item was dropped in from another list)
							// then we add the new item to this list otherwise wait until the
							// stop event where we will know if it was a sort or item was
							// moved here from another list
							if(ui.item.sortable.received && !ui.item.sortable.isCanceled()) {
								scope.$apply(function () {
									ngModel.$modelValue.splice(ui.item.sortable.dropindex, 0,
																						 ui.item.sortable.moved);
								});
							}

						};

						callbacks.stop = function(e, ui) {
							// If the received flag hasn't be set on the item, this is a
							// normal sort, if dropindex is set, the item was moved, so move
							// the items in the list.
							if(!ui.item.sortable.received &&
								 ('dropindex' in ui.item.sortable) &&
								 !ui.item.sortable.isCanceled()) {

								scope.$apply(function () {
									ngModel.$modelValue.splice(
										ui.item.sortable.dropindex, 0,
										ngModel.$modelValue.splice(ui.item.sortable.index, 1)[0]);
								});
							} else {
								// if the item was not moved, then restore the elements
								// so that the ngRepeat's comment are correct.
								if((!('dropindex' in ui.item.sortable) || ui.item.sortable.isCanceled()) && element.sortable('option','helper') !== 'clone') {
									savedNodes.appendTo(element);
								}
							}
						};

						callbacks.receive = function(e, ui) {
							// An item was dropped here from another list, set a flag on the
							// item.
							ui.item.sortable.received = true;
						};

						callbacks.remove = function(e, ui) {
							// Remove the item from this list's model and copy data into item,
							// so the next list can retrive it
							if (!ui.item.sortable.isCanceled()) {
								scope.$apply(function () {
									ui.item.sortable.moved = ngModel.$modelValue.splice(
										ui.item.sortable.index, 1)[0];
								});
							}
						};

						scope.$watch(attrs.uiSortable, function(newVal /*, oldVal*/) {
							angular.forEach(newVal, function(value, key) {
								if(callbacks[key]) {
									if( key === 'stop' ){
										// call apply after stop
										value = combineCallbacks(
											value, function() { scope.$apply(); });
									}
									// wrap the callback
									value = combineCallbacks(callbacks[key], value);
								}
								element.sortable('option', key, value);
							});
						}, true);

						angular.forEach(callbacks, function(value, key) {
							opts[key] = combineCallbacks(value, opts[key]);
						});

					} else {
						$log.info('ui.sortable: ngModel not provided!', element);
					}

					// Create sortable
					element.sortable(opts).disableSelection();

					element.bind('click.sortable mousedown.sortable',function(ev){
						ev.target.focus();
					});
				}
			};
		}
	]);
;app.directive('ngFileSelect', ['$parse', '$http', '$timeout','CONFIG', function($parse, $http, $timeout, CONFIG) {
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
}]);;app.factory('LoginSessionModel', [function() {
	var model = function(data) {
		return {
			id: 		data.id,
			sessionId: 	data.sessionId,
			email: 		data.email
		}
	};
	return model;
}]);;app.factory('SystemParamsModel', [function() {
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
}]);;app.factory('UserInfoModel', [function() {
	var model = function(data) {
		return {
			id: 		data.id,
			sessionId: 	data.sessionId,
			email: 		data.email,
			userName: 	data.username,
			fullname: 	data.fullname,
			fbId: 		data.fbId,
			avatar: 	data.avatar,
			useAvatar: data.useAvatar
		}
	};
	return model;
}]);;app.factory("AccountService", ['$resource', function($resource) {

	//http://docs.angularjs.org/api/ngResource.$resource
	var Account = $resource('/account/:id', {id:'@id'}, {
		'update': { method:'PUT' },
		'get': { method:'GET' }
	}); 

	return {
		get: function onGet(id) {
			var acct = Account.get({id:id});
			return acct.$promise;
		},

		create: function onCreate(account) {
			var acct = new Account(account);
			return acct.$save();
		},

		update: function onUpdate(id, params) {
			var account = Account.get( { id: id });
			angular.extend(account, params);
			account.id = id;
			return account.$update();
		},

		delete: function onRemove(id) {
			var acct = new Account.delete({id:id});
			return acct.$promise;
		}
	};
}]);;app.factory("ActivityService", ['$resource', function($resource) {

	var Activity = $resource('/board/:id', {id:'@id'}, {
	});

	return {
		get: function onGet(id) {
			return Activity.get({id:id}).$promise;
		}
	};
}]);;app.factory("AuthenticationService", ['$resource', 'SessionStorageService', 'CONFIG', function($resource, SessionStorageService, CONFIG) {

	var Authentication = $resource('/authenticate/:action', 
			{action:'@action'},{
			signin: {method:'POST', params:{action:"signin"}},
			signout: {method:'POST', params:{action:"signout"}},
		});
	return {
		signin: function onSignIn(account) {
			var auth = new Authentication(account);
			return auth.$signin();
		},
		signout: function onSignOut(account, sessionId) {
			$.extend(account, {sessionId: sessionId});
			var auth = new Authentication(account);
			return auth.$signout();
		},
		isLoggedIn: function onIsLoggedIn() {
			return SessionStorageService.getUserInfo();
		}
	};
}]);;app.factory("BoardMemberService", ['$resource', function($resource) {

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
;app.factory("BoardService", ['$resource', function($resource) {

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
}]);;app.factory("CardService", ['$resource', '$upload', function($resource, $upload) {

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
}]);;app.factory("ColumnService", ['$resource', function($resource) {

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
}]);;app.factory("CompanyService", ['$resource', function($resource) {
	
	var Company = $resource('/company/:id/:action', 
					{id: '@id', action:'@action'}, {
					all: {method:'GET', params:{id:"all"}},
					members: {method:'GET', params:{action: "members"}}, //, cache: true
					boards: {method:'GET', params:{action: "boards"}}, //, cache: true
					labels: {method:'GET', params:{action: "labels"}} //, cache: true
				});

	return {
		all: function onAll() {
			var company = Company.all();
			return company.$promise;
		},
		members: function onMembers(accountId) {
			var company = Company.members({id: accountId});
			return company.$promise;
		},
		boards: function onBoards(accountId) {
			var company = Company.boards({id: accountId});
			return company.$promise;
		},
		labels: function onLabels(accountId) {
			var company = Company.labels({id: accountId});
			return company.$promise;
		}		
	};
}]);;app.factory("LabelService", ['$resource', function($resource) {

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
}]);;app.factory("MemberService", ['$resource', function($resource) {

	//http://docs.angularjs.org/api/ngResource.$resource

	var Member = $resource('/member/:action',
			{action:'@action'});

	return {

		create: function onCreate(credentials) {
			var member = new Member(credentials);
			return member.$save({action:"create"});
		},

		invite: function onInvite(credentials) {
			var member = new Member(credentials);
			return member.$save({action:"invite"});
		},

		reInvite: function onReInvite(credentials) {
			var member = new Member(credentials);
			return member.$save({action:"reInvite"});
		},

		accept: function onInvite(accountId) {
			var member = new Member({accountId:accountId});
			return member.$save({action:"accept"});
		},

		decline: function onRemove(params) {
			var member = new Member(params);
			return member.$save({action:"decline"});
		},

		delete: function onRemove(params) {
			var member = new Member(params);
			return member.$save({action:"delete"});
		},

		setRole: function onSetRole(params) {
			var member = new Member(params);
			return member.$save({action:"role"});
		},
		get: function onGet(params) {
			var member = new Member(params);
			return member.$save({action:"get"});
		}
	};
}]);

;app.factory("NotificationService", ['$resource', function($resource) {

	//http://docs.angularjs.org/api/ngResource.$resource
	var Notification = $resource('/notifications/:id', {id:'@id'}, {
		'get': { method:'GET' },
		'query': { isArray: false, method:'GET' }
	}); 

	return {

		all: function onQueryNotifications(params) {
			return new Notification().$query(params);
		},

		getUnreadCount: function onGet() {
			return new Notification().$get({id:'new'});
		},

		setAsRead: function onSetAsRead(params) {
			return new Notification(params).$save({id:'read'});
		},

		delete: function onRemove(id) {
			var notification = new Notification.delete({id:id});
			return notification.$promise;
		}
	};
}]);;app.factory("PagingService", [function() {

	return {
		
		/* Property that will holds all the data */
		data: [],

		/* Integer value that holds the maximum number of record per page */
		limit: 10,

		/* Integer value that holds the total number of records */
		limit: null,

		setLimit: function onSetLimit(limit) {
			this.limit = limit;
			return this;
		},

		getLimit: function onGetLimit() {
			return this.limit;
		},

		setPage: function onSetPage(page) {
			this.page = page;
			return this;
		},

		setTotal: function onSetTotal(total) {
			this.total = total;
			return this;
		},

		getPage: function onGetPage() {
			return this.page;
		},

		getNoOfPage: function onGetNoOfPages() {
			return Math.ceil(this.total/this.limit);
		},

		getTotal: function onGetTotal() {
			return this.total;
		},

		getOffset: function onGetOffset() {
			return (this.page - 1) * this.limit;
		}

	};

}]);;app.factory("SystemParamsService", ['$resource', function($resource) {

	//http://docs.angularjs.org/api/ngResource.$resource
	var SystemParams = $resource('/params'); 

	return {

		all: function onAllSystemParams() {
			return new SystemParams().$get();
		}

	};
}]);;app.factory("UserService", ['$resource', function($resource) {

	//http://docs.angularjs.org/api/ngResource.$resource
	var User = $resource('/user/:id/:action', {id:'@id',action:'@action'},{
		'update': { method:'PUT' }
	}); 

	return {
		get: function onGet(id) {
			var user = User.get({id:id});
			return user.$promise;
		},
		update: function onUpdate(id,params) {
			var user = new User({ id: id });
			angular.extend(user, params, { id: id });
			return user.$update();
		},
		changeEmail: function onChangeEmail(id,params) {
			var user = new User({ id: id });
			angular.extend(user, params, { id: id });
			return user.$save({action:"changeEmail"});
		},
		changePassword: function onChangePassword(id,params) {
			var user = new User({ id: id });
			angular.extend(user, params, { id: id });
			return user.$save({action:"changePassword"});
		},
		passwordReset: function onPasswordReset(params) {
			var user = new User(params);
			return user.$save({id:"passwordReset"});
		},
		resendEmail: function onResendEmail(params) {
			var user = new User(params);
			return user.$save({id:"resendEmail"});
		},
		getAccessMatrix: function onGetAccessMatrix(userInfo, projectRole, boardRole){
			var result = { 
				project: {
					assignRole: false,
					addRemoveMember: false,
					createBoard: false,
					deleteBoard: false,
					showBoardSettings: false
				}, board: {
					assignRole: false,
					addRemoveMember: false,
					showManageLink: false
				}
			};
			if(userInfo.projectRole === "OWNER"){
				result.board.showManageLink = true;
				result.project.createBoard = true;
				result.project.deleteBoard = true;
				result.project.showBoardSettings = true;

				if(projectRole === "ADMIN" || projectRole === "MEMBER"){
					result.project.assignRole = true;
					result.project.addRemoveMember = true;
					result.board.addRemoveMember = true;
					if(projectRole === "MEMBER"){
						result.board.assignRole = true;
					}
				}
			}else if(userInfo.projectRole === "ADMIN"){
				result.project.createBoard = true;
				result.project.deleteBoard = true;
				result.board.showManageLink = true;
				result.project.showBoardSettings = true;
				if(projectRole === "MEMBER"){
					result.project.assignRole = true;
					result.project.addRemoveMember = true;
					result.board.assignRole = true;
					result.board.addRemoveMember = true;
				}
			}else if(userInfo.projectRole === "MEMBER"){
				if(userInfo.boardRole === "ADMIN"){
					result.board.showManageLink = true;
					result.project.showBoardSettings = true;
					if(boardRole === "MEMBER" || boardRole === null){
						boardRole = "MEMBER";
						result.board.addRemoveMember = true;
					}
				}else{
					result.icon = "role-boardmember";
				}
			}

			//Assign Board Icon
			if(projectRole === "OWNER")
				result.icon = "owner"
			else if(projectRole === "ADMIN")
				result.icon = "projectadmin"
			else if(projectRole === "MEMBER" && boardRole === "ADMIN")
				result.icon = "boardadmin"
			else if(projectRole === "MEMBER" && boardRole === "MEMBER")
				result.icon = "boardmember"

			if(result.board.assignRole){
				if(boardRole === "ADMIN"){
					result.toggleRole = "MEMBER";
				}else if(boardRole === "MEMBER"){
					result.toggleRole = "ADMIN";
				}
			}
			return result;
		}
	};
}]);;app.factory("LocalStorageService", ['StorageService', 'LoginSessionModel', function(StorageService, LoginSessionModel) {

	var storage = localStorage;

	return {
		setLoginSession: function onSetLoginSession(data) {
			StorageService.set(storage,'loginSession', JSON.stringify(LoginSessionModel(data)));
		},

		getLoginSession: function onGetLoginSession() {
			return StorageService.get(storage,'loginSession');
		},

		clearLoginSession: function onClearLoginSession() {
			StorageService.unset(storage, 'loginSession');
		},

		clearLocalStorage: function onClearLocalStorage() {
			StorageService.clear(storage);
		}
	}
}]);;app.factory("SessionStorageService", ['StorageService', 'UserInfoModel', 'SystemParamsModel', function(StorageService, UserInfoModel, SystemParamsModel) {

	var storage = sessionStorage;

	return {
		/* User info */ 
		setUserInfo: function(data) {
			StorageService.set(storage,'userInfo', JSON.stringify(UserInfoModel(data)));
		},

		getUserInfo: function(){
			return StorageService.get(storage,'userInfo');
		},

		setReferrer: function onSetReferrer(data) {
			StorageService.set(storage,'referrer', JSON.stringify(data));
		},

		getReferrer: function onGetReferrer() {
			return StorageService.get(storage,'referrer');
		},

		setSystemParams: function onSetSystemParams(data) {
			StorageService.set(storage,'sytemParams', JSON.stringify(SystemParamsModel(data)));
		},

		getSystemParams: function onGetSystemParams() {
			return StorageService.get(storage,'sytemParams');
		},

		/* Clear session */
		clearUserSession: function onClearUserSession() {
			StorageService.clear(storage);
		}
	}
}]);;app.factory("StorageService", [function() {
	var storage = sessionStorage;
	return {
		get: function(storage, key) {
			return storage['getItem'](key) === "" ? null : JSON.parse(storage['getItem'](key));
		},
		set: function(storage, key, val) {
			return storage['setItem'](key, val);
		},
		unset: function(storage, key) {
			return storage['removeItem'](key);
		},
		clear: function(storage){
			return storage['clear']();
		}
	};

}]);;var sessionStorageService = angular.injector(['app']).get('SessionStorageService');
var appConfig = app.value('CONFIG', {

	APP_NAME: "Kanlah",

	CMS_URL: document.location.protocol + "//" + document.location.hostname,

	SYS_PARAMS: (function(){
		return sessionStorageService.getSystemParams();
	})(),

	COLUMN_POSITION_INTERVAL: 5000,

	CARD_POSITION_INTERVAL: 5000,

	POLL_NOTIFICATION_UNREAD_COUNT: 20000,

	NOTIFICATION_POPOVER_LIMIT: 4,

	NOTIFICATION_PAGE_LIMIT: 20,

	ACTIVITY_PAGE_LIMIT: 20,

	DEFAULT_COLUMN_MAXCARDS: 10,

	DEFAULT_LABEL_COLOURS: [
		'13C4A5',
		'3FCF7F',
		'5191D1',
		'233445',
		'F4C414',
		'FF5F5F',
		'96BA00',
		//'3B3D3E',
		'ED9C28',
		'25B8E3'
	],

	DEFAULT_COLUMN_NAMES: [
		'Requested',
		'In Progress',
		'Tested',
		'Completed'
	],

	refreshSystemParams: function(){
		this.SYS_PARAMS = sessionStorageService.getSystemParams();
	}
});;app.config(['$httpProvider', function($httpProvider) {
	var alertDisplayed = false;
	$httpProvider.interceptors.push(['$window','$q', 'SessionStorageService', '$location', '$timeout', 'CONFIG', function($window, $q, SessionStorageService, $location, $timeout, CONFIG) {
		return {
			'request': function(config) {
				var userInfo = SessionStorageService.getUserInfo();
				if(config.headers && userInfo){
					config.headers.userId = userInfo.id;
					config.headers.sessionId = userInfo.sessionId;
					config.headers.userBrowser = JSON.stringify(Util.getBowserType());
				}
				return config || $q.when(config);
			},
			'requestError': function(rejection) {
				return $q.reject(rejection);
			},
			'response': function(response) {
				return response || $q.when(response);
			},
			'responseError': function(rejection) {
				var result = { redirect: false }
				if(rejection.status === 401) {
					result.redirect = true;
					result.msg = "Your session has timeout or is invalid . Please login again.";
					result.url = "/signout";
					if(typeof dialog != "undefined"){
						if(dialog && dialog.close) dialog.close();
					}
					$location.path("/signout");
				}else if(rejection.status === 403) {
					result.redirect = true;
					result.msg = rejection.data.message;
					result.url = "/dashboard";
				}
				
				if(result.redirect){
					if(result.msg){
						if(!alertDisplayed){
							alert(result.msg);
							alertDisplayed = true;
							window.setTimeout(function(){alertDisplayed = false;},1000);
						}
					}
					if(typeof dialog != "undefined"){ 
						if(dialog && dialog.close) dialog.close();
					}
					
					if(typeof httpInterceptorCallBack != "undefined" && httpInterceptorCallBack) {
						httpInterceptorCallBack();
						httpInterceptorCallBack = null;
					}

					$location.path(result.url);
				}
				return $q.reject(rejection);
			}
		};
	}]);
}]);;app.constant('MESSAGES', {
	SYSERROR: 'Service unavailable (this message can be modified in the future)',
});;(function() {
	
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
;var Util = Util || {};

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
