class UrlMappings {

	static mappings = {
		"500"(view:'/error')
		
		"/authenticate/$action?"(controller: "login") {
			action = [GET: "signout", POST: "signin"]
		}

		"/login/external"(controller: "login") {
			action = [POST: "signinExternal"]
		}

		"/account/$id?"(controller: "account") {
			action = [GET: "show", PUT: "update", DELETE: "delete", POST: "save"]
		}

		"/account/create"(controller: "account") {
			action = [POST: "create"]
		}

		"/user/$id?"(controller: "user"){
			action = [GET: "show", PUT: "update", DELETE: "delete", POST: "save"]
		}
		"/user/passwordReset"(controller: "user"){
			action = [POST: "passwordReset"]
		}
		"/user/resendEmail"(controller: "user"){
			action = [POST: "resendEmail"]
		}
		"/user/$id/activate/$code"(controller: "user") {
			action = [GET: "activate"]
		}
		"/user/$id/changePassword"(controller: "user") {
			action = [POST: "changePassword"]
		}
		"/user/$id/changeEmail"(controller: "user") {
			action = [POST: "changeEmail"]
		}
		"/user/$id/updateEmail"(controller: "user") {
			action = [GET: "updateEmail"]
		}
		"/user/$id/saveAvatar"(controller: "user") {
			action = [POST: "saveAvatar"]
		}
		
		"/company/all"(controller: "account", action: "companies")
		"/company/$companyId/$action?"(controller: "account")
		
		"/member/$action" (controller: "member")
		"/member/activate/$id" (controller: "member") {
			action = [GET: "activate"]
		}
		
		"/board/$id?" (controller: "board") {
			action = [GET: "show", PUT: "update", DELETE: "delete", POST: "save"]
		}
		"/board/$id/settings" (controller: "board") {
			action = [GET: "settings"]
		}
		"/board/$id/expand" (controller: "board") {
			action = [GET: "expand"]
		}
		"/board/$id/activity" (controller: "activity") {
			action = [GET: "list"]
		}
		"/board/$id/activitylast" (controller: "activity") {
			action = [POST: "last"]
		}

		"/boardmember/$id?" (controller: "boardMember") {
			action = [GET: "show", PUT: "update"]
		}
		
		"/boardmember/$id/$action" (controller: "boardMember")
		
		"/column/$id?" (controller: "column") {
			action = [GET: "show", PUT: "update", DELETE: "delete", POST: "save"]
		}
		"/column/$id/subscribe" (controller: "column") {
			action = [POST: "subscribe", DELETE: "unsubscribe"]
		}
		
		"/card/$id?" (controller: "card") {
			action = [GET: "show", PUT: "update", DELETE: "delete", POST: "save"]
		}
		"/card/$id/label" (controller: "card"){
			action = [POST: "removeLabel", PUT: "putLabel"]
		}

		"/card/$id/member" (controller: "card") {
			action = [POST: "assignMember", PUT: "removeMember"]
		}
		"/card/$id/attachment/$accountId" (controller: "card") {
			action = [POST: "saveAttachment"]
		}
		"/card/$id/attachment" (controller: "card") {
			action = [POST: "removeAttachment"]
		}
		"/card/$id/subscribe" (controller: "card") {
			action = [POST: "subscribe", DELETE: "unsubscribe"]
		}
		
		"/label/$id?"(controller: "label") {
			action = [GET: "show", PUT: "update", DELETE: "delete", POST: "save"]
		}
		"/company/$id/labels"(controller: "account") {
			action = [GET: "labels"]
		}
		
		"/notifications" (controller: "notification") {
			action = [GET: "notifications"]
		}
		"/notifications/read" (controller: "notification") {
			action = [POST: "read"]
		}
		"/notifications/delete/$id?" (controller: "notification") {
			action = [DELETE: "delete"]
		}
		"/notifications/new" (controller: "notification") {
			action = [GET: "countUnread"]
		}
		
		"/params" (controller: "systemParameters") {
			action = [GET: "index"]
		}
	}
}
