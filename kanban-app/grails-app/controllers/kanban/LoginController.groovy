package kanban

import grails.converters.JSON
import org.codehaus.groovy.grails.web.mapping.LinkGenerator

class LoginController {
	def userService
	def sessionService

	LinkGenerator grailsLinkGenerator

	def index() { }
	//
	def signin() {
		def response = new ResponseData(code: message(code:'login.failed.code'),
				message: message(code:'login.failed'))

		def req = request.JSON
		def authInfo

		if(req.autoLogin){
			authInfo = sessionService.autoLogin(req.sessionId);
		}else{
			authInfo = sessionService.authenticate(req.email, req.password)
		}

		if (authInfo) {
			def user = authInfo.user
			if (user.status == Status.ENABLED || user.status == Status.SUSPENDED) {
				response.success = true
				response.data = retUserData(user)
				response.data.sessionId =  authInfo.sessionId
				response.code = message(code:'login.success.code')
				response.message = message(code:'login.success', args:[user.email])
			} else if (user.status == Status.CLOSED) {
				response.code = message(code:'login.account.status.code')
				response.message = message(code:'login.account.status.message', args:[user.status.name().toLowerCase()])
			}else{
				response.code = message(code:'login.validate.code')
				response.message = message(code:'login.validate.message', args:[user.email])
			}
		}

		render response as JSON
	}
	//
	def signinExternal() {
		def response = new ResponseData(code: message(code:'login.failed.code'),
				message: message(code:'login.failed'))

		def req = request.JSON
		def authInfo

		if(req.autoLogin){
			authInfo = sessionService.autoLogin(req.sessionId);
		}else{
			authInfo = sessionService.authenticate(req.email, req.password)
		}

		if (authInfo) {
			def user = authInfo.user

			def url = grailsLinkGenerator.serverBaseURL + "#/loginExternal/" + authInfo.sessionId

			if (user.status == Status.ENABLED || user.status == Status.SUSPENDED) {
				response.success = true
				response.data = [userId: user.id, sessionId: authInfo.sessionId, redirectUrl: url]
				response.code = message(code:'login.success.code')
				response.message = message(code:'login.success', args:[user.email])
			} else if (user.status == Status.CLOSED) {
				response.code = message(code:'login.account.status.code')
				response.message = message(code:'login.account.status.message', args:[user.status.name().toLowerCase()])
			}else {
				response.code = message(code:'login.validate.code')
				response.message = message(code:'login.validate.message', args:[user.email])
			}
		}

		render response as JSON
	}

	def signout() {
		def response = new ResponseData(code: message(code:'logout.failed.code'),
				message: message(code:'logout.failed'))

		def authInfoLogOut = sessionService.invalidate()
		if (authInfoLogOut) {
				response.code = message(code:'logout.success.code')
				response.message = message(code:'logout.success')
		}
		render response as JSON
	}
	
	def retUserData = { user ->
		user.collect {
			[id: user.id,
		    email: user.email,
			username: user.username,
		    fullname: user.fullname,
		    initials: user.initials,
		    fbId: user.fbId,
			emailverified: user.emailverified,
		    createdAt: user.createdAt?:"",
		    updatedAt: user.updatedAt?:"",
			currentSignInAt: user.currentSignInAt?:"",
			lastSignInAt: user.lastSignInAt?:"",
			lastActivityAt: user.lastActivityAt?:"",
			avatar: user.avatar,
			useAvatar: user.useAvatar]
		} [0]
	}
}
