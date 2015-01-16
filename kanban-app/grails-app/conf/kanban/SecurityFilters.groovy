package kanban

import grails.converters.JSON
import org.apache.commons.logging.LogFactory

class SecurityFilters {
	def sessionService
	def activityService
	
	private static final log = LogFactory.getLog(this)

	/**
	 * Array of controller/action combinations which will be skipped from authentication
	 * if the controller and action names match. The action value can also be '*' if it
	 * encompasses all actions within the controller.
	 */
	static nonAuthenticatedActions = [
			[controller: 'account', action: 'create'],
			[controller: 'account', action: 'save'],
			[controller: 'user', action: 'activate'],
			[controller: 'user', action: 'passwordReset'],
			[controller: 'user', action: 'resendEmail'],
			[controller: 'user', action: 'updateEmail'],
			[controller: 'member', action: 'activate'],
			[controller: 'systemParameters', action: 'index'],
			[controller: 'login', action: '*']
	]

	static nonActivityActions = [
			[controller: 'notification', action: 'countUnread'],
			[controller: 'activity', action: 'list'],
			[controller: 'activity', action: 'last'],
			[controller: 'account', action: 'members'],
			[controller: 'boardMember', action: 'show'],
			[controller: 'account', action: 'show'],
			[controller: 'account', action: 'boards'],
	]

	def filters = {
		all(controller:'*', action:'*', controllerExclude:'', actionExclude:'') {
			before = {
				// Determine if the controller/action belongs is not to be authenticated
				
				log.info ""
				log.info "***ONFILTER:${controllerName}:${actionName}"
				def noNeedAuth = nonAuthenticatedActions.find {
					(it.controller == controllerName) &&
							((it.action == '*') || (it.action == actionName))
				}
				if(noNeedAuth){
					return true
				}

				//Check for browser that require no-cache returned to the response header
				if(request.getHeader("userBrowser")){
					def userBrowser = JSON.parse(request.getHeader("userBrowser"))
					if(userBrowser.browser.toString() == "IE"){
						response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
						response.setHeader("Pragma", "no-cache");
						response.setHeader("Expires","-1");
					}
				}

				// Check the request token id/sessionId if it is valid
				def authorizedUser = sessionService.validateUser()
				request.currentUser = null
				if(authorizedUser){
					request.currentUser = authorizedUser

					// Check the access permission base on the currentUser's action and role
					if (controllerName && actionName) {
						def isAuthorized = sessionService.authorizeAccess()
						if(!isAuthorized){
							log.info "***:Unauthorized access:"
							def response = new ResponseData(message: 'Unauthorized access', code: '') as JSON
							render(status: 403, contentType: "application/json", text: response)
							return false
						}

						else {
							def skipUpdateLastActivity = nonActivityActions.find {
								(it.controller == controllerName) &&
										((it.action == '*') || (it.action == actionName))
							}
							if(!skipUpdateLastActivity){
								log.info "]-----------------------:updateLastActivity ${controllerName}: ${actionName}-------------"
								sessionService.updateLastActivity(request.getHeader("sessionId"))
							}
						}
					}
				}
				else {
					log.info "***:Invalid session:"
					def response = new ResponseData(message: 'Invalid session', code: '') as JSON
					render(status: 401, contentType: "application/json", text: response)
					return false
				}
			}
			after = { Map model ->
				log.info "***:after:ONFILTER"
				activityService.log(controllerName, actionName)
			}
			afterView = { Exception e ->
			}
		}
	}
}
