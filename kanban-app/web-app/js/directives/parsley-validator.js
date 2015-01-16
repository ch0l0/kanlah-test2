app.directive('parsleyValidator', ['$rootScope', '$timeout', '$parse', function($rootScope, $timeout, $parse) {

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

}]);