package kanban.bo

import org.apache.shiro.SecurityUtils;

import kanban.Account;
import kanban.BOAccess;
import kanban.Status;
import kanban.User;
import kanban.Account_Member;
import kanban.SystemParameters;
import job.MailData;
import kanban.EmailJob;

class ProjectController {
	
	def accessService
	def appName = SystemParameters.first()?.name?:""

	def index() {
		redirect(action: "list", params: params)
	}

	def list(Integer max) {
		params.max = Math.min(max ?: 10, 100)
		params.sort = params?.sort ?: "createdAt"
		params.order = params?.order ?: "desc"
		
		def accountTotal = User.list().size()
		def listing = User.list(params)
		
		listUsers(max, listing, params, params.searchAccount?:"", accountTotal)
   	}
	
	def allowAction = { boAccess ->
		accessService.allowAction(SecurityUtils.subject?.principal, boAccess)
	}
	
	def enable() {
		
		flash.message = null
		if (allowAction(BOAccess.COMPANY_ACTIVATE)) {
			def user = User.findById(params.userId)
			if (user && user.status != Status.ENABLED) {
				if (user.status == Status.PENDING) user.verifiedDate = new Date()
				user.status = Status.ENABLED
				if (user.validate() && user.save()) flash.message = """User ${user.fullname} enabled"""
			}
		} else flash.message = "You are not allowed to 'Enable'/'Suspend' the account."
		
		redirect (action: "list")
	}
	
	def suspend() {
		
		flash.message = null
		if (allowAction(BOAccess.COMPANY_ACTIVATE)) {
			def user = User.findById(params.userId)
			if (user && user.status != Status.SUSPENDED) {
				user.status = Status.SUSPENDED
				user.suspendedDate = new Date()
				if (user.validate() && user.save()) flash.message = """User ${user.fullname} suspended"""
			}
		} else flash.message = "You are not allowed to 'Enable'/'Suspend' the account."
		
		redirect (action: "list")
	}
	
	def close() {
		
		flash.message = null
		if (allowAction(BOAccess.COMPANY_DEACTIVATE)) {
			def user = User.findById(params.userId)
			if (user && user.status != Status.CLOSED) {
				user.status = Status.CLOSED
				user.closedDate = new Date()
				if (user.validate() && user.save()) flash.message = """User ${user.fullname} closed"""

				//Notification to members
				notifyMembers(user);
			}
		} else flash.message = "You are not allowed to 'Close' the account."
		
		redirect (action: "list")
	}
	
	def search(Integer max) {
		
		flash.message = null
		if (!(params.searchAccount ==~ /([a-zA-Z0-9])+/)) {
			flash.message = "Please enter alphanumeric search string for Display Name only."
			redirect (action: "list")
		}
		
		params.max = Math.min(max ?: 10, 100)
		params.sort = params?.sort ?: "createdAt"
		params.order = params?.order ?: "desc"
		
		def accountTotal = User.findAllByFullnameIlike((params.searchAccount && params.searchAccount!="ALL")?params.searchAccount+"%":"%").size()
		def listing = User.findAllByFullnameIlike((params.searchAccount && params.searchAccount!="ALL")?params.searchAccount+"%":"%", params)
		
		params.fromSearch = true
		listUsers(max, listing, params, params.searchAccount?:"", accountTotal)
	}
	
	def listUsers(Integer max, listing, params, searchedDisplayName, accountTotal) {
		render (view: "list",
			model: [accountList: listing, accountTotal: accountTotal,
			allowActivate: allowAction(BOAccess.COMPANY_ACTIVATE), allowDeactivate: allowAction(BOAccess.COMPANY_DEACTIVATE), fromSearch: params.fromSearch?:false
			, searchedDisplayName: searchedDisplayName?:""]
			)
	}

	def notifyMembers(user) {
		def ownerAccounts = Account_Member.findAllByUserIdAndRole(user.id, "OWNER")
		ownerAccounts.each{ acct ->
			def account = Account.findById(acct.accountId);
			def members = Account_Member.findAllByAccountId(acct.accountId)
			members.each{ it ->
				if(user.id != it.userId){
					def member = User.findById(it.userId)
					sendEmailNotification(member, user, account.companyName);
				}
			}
		}
	}

	def sendEmailNotification(user, owner, projectName){
		def content = """\
					Hello ${user.fullname},<br><br>

					You are receiving this e-mail because ${owner.fullname} has closed their account at Kanlah.com.<br><br>

					All projects and boards under their ownership will be closed and will be removed from your dashboard.<br><br> 

					-The ${appName} Team
					"""
		
		MailData mail = new MailData(
				to: user.email,
				subject: "Project Closure Notice - ${projectName}",
				content: content
		)
		EmailJob.triggerNow([mailData: mail])
	}
}
