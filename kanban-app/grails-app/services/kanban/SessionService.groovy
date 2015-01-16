package kanban

import groovy.time.TimeCategory
import org.codehaus.groovy.grails.web.util.WebUtils
import org.grails.datastore.mapping.core.OptimisticLockingException
import org.springframework.web.context.request.RequestContextHolder

class SessionService {
	def grailsApplication

	def authenticate(String email, String password){
		def requestSession = RequestContextHolder.currentRequestAttributes().getSession()
		def sessionUUID = UUID.randomUUID().toString().replaceAll('-','').toUpperCase() //requestSession.id
		def authInfo = null
		def passwordSha256 = (password).encodeAsSHA256().toString()
		def user = User.findByEmailAndPassword(email, passwordSha256)
		if(user){
			def sessionInfo = new Session(sessionId: sessionUUID, userId: user.id).save()
			authInfo = [user:user, sessionId: sessionInfo.sessionId]
		}
		authInfo
	}

	def validateUser(){
		def validSession = this.isValidSession()
		if(validSession){
			User.findById(validSession.userId)
		}
		else
			null
	}

	def authorizeAccess() {
		def webUtils = WebUtils.retrieveGrailsWebRequest()

		def isAuthorized = true // by default we authorize all access

		def req = webUtils.request.JSON
		def currentUser = webUtils.request.currentUser
		def controllerName = webUtils.controllerName
		def actionName = webUtils.actionName
		def accountId = req?.accountId?: webUtils.params.get('accountId')
		def userId = currentUser.id
		def paramId = webUtils.params.get('id')

		def authenticatedActions = [
				[controller: 'user', action: 'save,update,delete,changeEmail,changePassword', role: ['OWNER','ADMIN'], status: ['ENABLED']],
				[controller: 'account', action: 'update,delete', role: ['OWNER','ADMIN'], status: ['ENABLED']],
				[controller: 'account', action: 'save', status: ['ENABLED']],
				[controller: 'member', action: 'save,update,delete', role: ['OWNER','ADMIN'], status: ['ENABLED']],
				[controller: 'member', action: 'role', 	role: ['OWNER'], status: ['ENABLED']],
				[controller: 'member', action: 'reInvite, invite, create', 	role: ['OWNER','ADMIN'], status: ['ENABLED']],
				[controller: 'board', action: 'save,update,delete', role: ['OWNER','ADMIN'], board:[action:'update',role:['ADMIN']], status: ['ENABLED']],
				[controller: 'board', action: 'expand', role: ['OWNER','ADMIN','MEMBER'], status: ['ENABLED']],
				[controller: 'boardMember', action: 'save,update,delete', role: ['OWNER','ADMIN'], board:[action:'save,delete',role:['ADMIN']], status: ['ENABLED']],
				[controller: 'column', action: 'save,update,delete', role: ['OWNER','ADMIN'], status: ['ENABLED']],
				[controller: 'label', action: 'save,update,delete', role: ['OWNER','ADMIN'], status: ['ENABLED']]
		]

		def needsAuth = authenticatedActions.find {
			(it.controller == controllerName) &&
					((it.action == '*') || (it.action.contains(actionName)))
		}

		if(paramId && !accountId){
			def account = getAccountId(paramId, controllerName)
			if(account){
				accountId = account.id
			}
		}

		def _accountMember = Account_Member.findByUserIdAndAccountId(userId, accountId)
		
		if(needsAuth){

			if(_accountMember){

				if(needsAuth.board){
					def board = Board.findById(paramId)
					def userBoardRole = Board_Member.findByBoardAndMember(board, User.findById(userId))
					if(userBoardRole && needsAuth.board.role.find { it =~ userBoardRole.role } && needsAuth.board.action.contains(actionName)){
						needsAuth.authorizedByBoardRole = true;
					}
				}
				if((needsAuth.role.find { it =~ _accountMember.role } && needsAuth.status.contains(currentUser.status.name())) || 
					(needsAuth.authorizedByBoardRole && needsAuth.status.contains(currentUser.status.name()))){

					if(controllerName=="board" && actionName=="expand" && _accountMember.role.equals(Account_Member.MemberRole.MEMBER)){
						def boardId = paramId
						def board = Board.findById(boardId)
						def member = User.findById(userId)
						def boardMember = Board_Member.findByBoardAndMember(board, member)
						if(!boardMember){
							isAuthorized = false
						}
					}

					if(controllerName=="member" && actionName=="delete"){
						def accountMemberToDelete = Account_Member.findByUserIdAndAccountId(req?.userId, accountId)
						if(accountMemberToDelete.role.equals(Account_Member.MemberRole.OWNER)) // deleting the owner ?
							isAuthorized = false
						if(req?.userId==userId) // deleting yourself ?
							isAuthorized = false
					}

					if(controllerName=="boardMember" && actionName=="delete"){
						def boardId = paramId
						def board = Board.findById(boardId)
						def memberToDelete = User.findById(req?.memberId)
						def boardMemberToDelete = Board_Member.findByBoardAndMember(board, memberToDelete)
						if(boardMemberToDelete.role.equals(Board_Member.MemberRole.OWNER)) // deleting the owner ?
							isAuthorized = false
						if(req?.memberId==userId) // deleting yourself ?
							isAuthorized = false
					}

					if(controllerName=="boardMember" && actionName=="update" && req?.role){
						def boardId = paramId
						def board = Board.findById(boardId)

						def memberUpdating = User.findById(userId)
						def boardMemberUpdating = Board_Member.findByBoardAndMember(board, memberUpdating)

						def memberToUpdate = User.findById(req?.memberId)
						def boardMemberToUpdate = Board_Member.findByBoardAndMember(board, memberToUpdate)

						if(boardMemberUpdating.role.equals(Board_Member.MemberRole.MEMBER)) // updater is member ?
							isAuthorized = false
						if(boardMemberToUpdate.role.equals(Board_Member.MemberRole.OWNER)) // update the owner ?
							isAuthorized = false
						if(req?.memberId==userId) // update yourself ?
							isAuthorized = false
					}


				}else {
					isAuthorized = false
				}

			}
			else {
				if(!needsAuth.status.contains(currentUser.status.name())) {
					isAuthorized = false
				}
			}
		}

		isAuthorized
	}

	def invalidate(){
		def webUtils = WebUtils.retrieveGrailsWebRequest()
		def sessionInfo = this.isValidSession()
		if(sessionInfo!=null){
			webUtils.request.session.invalidate()
			sessionInfo.dateSignOut = new Date()
			sessionInfo.save()
			return true
		}
		return false
	}

	def autoLogin(sessionId){
		def authInfo = null
		def validSession = this.isValidSession(sessionId)
		if(validSession){
			def user = User.findById(validSession.userId)
			authInfo = [user:user, sessionId: validSession.sessionId]
		}
		authInfo
	}

	def updateLastActivity(sessionId){
		def sessionInfo = Session.findBySessionId(sessionId)
		if(sessionInfo)
		try {
			sessionInfo.lastActivity = new Date()
			sessionInfo.save([failOnError: true])
			use(TimeCategory) {
			}
		}
		catch (Exception e){
			log.error "updateLastActivity:Exception(${e})"
		}
	}

	def isValidSession(sessionId = null){
		def sessionInfo

		//check token id / sessionId if is Valid
		sessionId = sessionId?: WebUtils.retrieveGrailsWebRequest().getHeader("sessionId")
		sessionInfo = Session.findBySessionId(sessionId,[sort: 'dateSignIn', order: 'desc'])

		if(sessionInfo){
			def now = new Date()
			def idleMinutes = timeDiff(now, sessionInfo.lastActivity)
			def sessionTimeout = grailsApplication.config.grails.customProperties.sessionTimeout
			def idleSession = idleMinutes > sessionTimeout
			def signedOut = sessionInfo?.dateSignOut != null

			if(!signedOut && idleSession){
				try {
					sessionInfo.dateSignOut = new Date()
					sessionInfo.save([flush: true])
					signedOut = true
				}
				catch (Exception e){
					log.error "isValidSession:Exception(${e})"
				}
			}
			sessionInfo = (signedOut && idleSession) ? null : sessionInfo
		}
		sessionInfo
	}

	static def getAccountId(paramId, controllerName){
		def account

		if(controllerName.equals("board") || controllerName.equals("boardMember")){
			account = Account.withCriteria {
				'in'('boards',[paramId])
			}[0]
		}

		if(controllerName.equals("column")){
			def column = Column.findById(paramId)
			def board = Board.withCriteria{
				'in'('columns',[column])
			}
			account = Account.withCriteria {
				'in'('boards',[board])
			}[0]
		}
		account
	}

	static def timeDiff(Date newDate, Date oldDate){
		Long difference = newDate.time - oldDate.time
		difference = difference / 1000
		def seconds = difference % 60
		difference = (difference - seconds) / 60
		def minutes = difference % 60

		minutes
	}
}
