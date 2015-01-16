app
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
