app.directive('dateTimePicker', [function() {
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
}]);