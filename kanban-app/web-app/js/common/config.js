// define constants
var sessionStorageService = angular.injector(['app']).get('SessionStorageService');
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
});