package kanban

import java.security.MessageDigest;

import org.codehaus.groovy.grails.web.mapping.LinkGenerator;
import grails.converters.JSON;

import kanban.Status;

class MemberController {
	
	def userService
	def accountService
	def boardService
	
	LinkGenerator grailsLinkGenerator
	
	def create() {
		def response = new ResponseData(message: message(code:'user.create.failed'),
			code: message(code:'user.create.failed.code'))
		
		def req = request.JSON
		def user = check(req.email)
		if (!user) {
			user = userService.createUser(req.displayName, req.email, req.password, false)
			addMember(response, req.accountId, user, req.password, true)
		} else if(user && (user.status == Status.CLOSED || user.status == Status.SUSPENDED)){
			response.message = message(code:'member.account.status.failed.message', args:[user.status.name().toLowerCase()])
			response.code = message(code:'member.account.status.failed.code')
		} else {
			def account = Account.findById(req.accountId)
			if (account && account.company && checkInvite(account.company, user)) {
				response.message = message(code: "member.add.invited.message", args:[account.company])
			} else {
				response.code =  message(code: "member.add.registered")
				response.message = message(code: "member.add.registered.message")
			}	
		}	
		
		render response as JSON
	}
	
	def invite() {
		def response = new ResponseData(message: message(code:'member.invite.failed'),
					code: message(code:'member.invite.failed.code'))
		
		def req = request.JSON
		def user = check(req.email)
		if (user) {
			addMember(response, req.accountId, user, req.password, false)
		}else if(user && (user.status == Status.CLOSED || user.status == Status.SUSPENDED)){
			response.message = message(code:'member.account.status.failed.message', args:[user.status.name().toLowerCase()])
			response.code = message(code:'member.account.status.failed.code')
		}else if(user && (user.status == Status.PENDING)){
			response.message = message(code:'member.account.status.pending.message', args:[user.status.name().toLowerCase()])
			response.code = message(code:'member.account.status.pending.code')
		}
		
		render response as JSON
	}
	
	def accept() {
		
		def response = new ResponseData(message: message(code:'member.accept.failed'),
			code: message(code:'member.accept.failed.code'))

		def req = request.JSON
		def userId = request.getHeader("userId")
		def user = User.findById(userId)

		def account_member = Account_Member.findByAccountIdAndUserId(req.accountId, userId)
		if(account_member) {
			account_member.status = Account_Member.MemberStatus.ACTIVE
			if( account_member.save() ) {
				response.success = true
				response.data = retUserData(user)
				response.code = message(code:'member.accept.success.code')
				response.message = message(code:'member.accept.success', args:[userId])
			}
		} else response.message = "No pending invitation for this user."
		
		render response as JSON

	}

	def delete() {

		def response = new ResponseData(message: message(code:'member.delete.failed'),
			code: message(code:'member.delete.failed.code'))
		
		def req = request.JSON
		def userId = req.userId
		def user = User.findById(userId)
		
		def account_member = Account_Member.findByAccountIdAndUserId(req.accountId, userId)
		if(account_member) {
			account_member.delete()
			
			deleteUserAssociations(req.accountId, userId)
			
			response.success = true
			response.data = retUserData(user)
			response.code = message(code:'member.delete.success.code')
			response.message = message(code:'member.delete.success', args:[userId])
		} else response.message = "No pending invitation for this user."
		
		render response as JSON
	}
	
	def deleteUserAssociations = { accountId, userId ->
		def account = Account.findById(accountId)
		if (account) {
			for (board in account.boards) {
				
				//delete board member
				def member = User.findById(userId)
				if (member) {  
					def board_m = Board_Member.findByBoardAndMember(board, member)
					if (board_m) board_m.delete()
				}
				
				boardService.deleteUserAssociations(member, board)
				
			}
		}
	}
	
	def decline() {
		
		def req = request.JSON
		def account_member = Account_Member.findByAccountIdAndRole(req.accountId, "OWNER")
		if(account_member) {
			def member = User.findById(req.userId)
			def owner = User.findById(account_member.userId)
			def account = Account.findById(req.accountId)
			if(account && member && owner) {
				userService.sendDeclineInvite(owner.email, owner.fullname, member.fullname, account.companyName)
			}
		}
		delete()
	}
	
	def get(){
		def response = new ResponseData(message: message(code:'member.found.failed'),
			code: message(code:'member.found.failed.code'))
		
		def req = request.JSON
		def userId = req.id
		def user = User.findById(userId)
		
		if(req.accountId != "me"){
			def account_member = Account_Member.findByAccountIdAndUserId(req.accountId, userId)
			if(account_member) {
				response.success = true
				response.data = retUserData(user)
				response.code = message(code:'member.found.success.code')
				response.message = message(code:'member.found.success', args:[userId])
			} else {
				response.code = message(code:'member.access.failed.code')
				response.message = message(code:'member.access.failed')
			}
		}else{
			if(user){
				response.success = true
				response.data = retUserData(user)
				response.code = message(code:'member.found.success.code')
				response.message = message(code:'member.found.success', args:[userId])
			}
		}
		
		render response as JSON
	}
	
	def check = { email ->
		def user = User.findByEmail(email)
		user
	}
	
	def activate(String id) {
		def member = User.findById(id)
		if (member) {
			
			if (!userService.activate(member)) {
				redirect (uri: "/#actfailed")
				return
			}		
		}
		
		redirect (uri: "/#")
	}
	
	def checkInvite(accountId, userId) {
		def account_member = Account_Member.findByAccountIdAndUserId(accountId, userId)
		account_member
	}
	
	def addMember(response, accountId, userInstance, password, isNewMember) {
		def account = Account.findById(accountId)
		if (account) {
				if (checkInvite(accountId, userInstance.id)) {
					response.message = message(code: "member.add.invited.message", args:[account.companyName])
				} else {
					def account_member = new Account_Member(
						accountId: accountId,
						userId: userInstance.id,
						role: Account_Member.MemberRole.MEMBER
						)
					account_member.save()
						
					def url = grailsLinkGenerator.serverBaseURL + "/member/activate/" + userInstance.id
					userService.sendEmailInvite(userInstance, account, password, url, isNewMember)
					
					log.error "userInstance Invite : validation errors = ${userInstance.errors}"
					response.success = true
					response.data = retUserData(userInstance)
					response.code = message(code:'user.create.success.code')
					response.message = message(code:'user.create.success', args:[userInstance.fullname])
				}
			
		} else {
			response.code = message(code:'account.get.failed.code')
			response.message = message(code:'account.get.failed')
		}
	}

	def reInvite() {
		def response = new ResponseData(message: message(code:'member.reInvite.failed'),
			code: message(code:'member.reInvite.failed.code'))
		
		def req = request.JSON
		def user = check(req.email)
		def account = Account.findById(req.accountId)

		if (account && user) {
			userService.sendEmailInvite(user, account, null, null, false)
			response.success = true
			response.code = message(code:'member.reInvite.success.code')
			response.message = message(code:'member.reInvite.success')		
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

	def role(){
		def response = new ResponseData(message: message(code:'member.update.failed'), code: '')
		def req = request.JSON;
		def accountId = req.accountId?: ""
		def memberId = req.memberId?: ""
		def memberRole = req.memberRole?: "MEMBER"

		def accountMember = accountService.setMemberRole(accountId,memberId,memberRole)

		if (accountMember) {
			response.success = true
			response.data = accountMember
			response.message = message(code:'member.update.success')
		}
		render response as JSON
	}
}
