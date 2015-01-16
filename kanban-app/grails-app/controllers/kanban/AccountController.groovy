package kanban

import java.util.Date;

import org.codehaus.groovy.grails.web.mapping.LinkGenerator;
import grails.validation.ValidationException
import grails.converters.JSON;

class AccountController {

	def accountService
	def userService
	def boardService
	
	LinkGenerator grailsLinkGenerator

	//GET
    def show(String id) {
		def response = new ResponseData(message: message(code:'account.get.failed'),
			code: message(code:'account.get.failed.code'))
		
		def account = Account.findById(id)
		if (account) {
			response.success = true
			response.data = retAccountData(account)
			response.code = message(code:'account.get.success.code')
			response.message = message(code:'account.get.success', args:[account.companyName])
		}
		
		render response as JSON
	}
	
	def update(String id) {
		def response = new ResponseData(message: message(code:'project.update.failed'),
			code: message(code:'account.update.failed.code'))

		def obj = request.JSON

		def account = Account.findById(id)

		if (account) {
			try{
				account.companyName = obj.companyName
				account.companyDescription = obj.companyDescription
				if (account.validate() && account.save(flush: true)){
					response.success = true
					response.code = message(code:'account.update.success.code')
					response.message = message(code:'project.update.success')
					response.data = account
				}
			}catch(ValidationException e){
				response.message = ""
				account.errors.allErrors.each {
					response.message += message(error: it)
				}
			}
		}
		render response as JSON
	}

	//POST
	def save() {
		def response = new ResponseData(message: message(code:'account.create.failed'),
				code: message(code:'account.create.failed.code'))

		def req = request.JSON
		def account
		def user

		try {
			// Member, creating own account
			if(req.userId) {
				user = User.findById(req.userId)
				if(user && (user.status == Status.CLOSED || user.status == Status.SUSPENDED)){
					response.message = message(code:'account.create.unauthorized', args:[user.status.name().toLowerCase()])
					response.code = message(code:'account.create.unauthorized.code')
				} else {
					account = accountService.createAccount( req.companyName, req.companyDescription, req.userId )
				}
			}
			else {
				//Check if duplicate
				user = User.findByEmail(req.email)
				if (!user) {
					user = userService.createUser(req.displayName, req.email, req.password, true)
					if(user) {
						account = accountService.createAccount( "My First Kanlah Project", "My First Kanlah Project", user.id )
					} else {
						response.message = message(code:'user.create.failed', args:[req.displayName])
					}
				} else {
					response.message = message(code:'user.email.unique', args:[req.email])
				}
			}

			if (account) {
				response.success = true
				response.data = retAccountData(account)
				response.code = message(code:'account.create.success.code')
				response.message = message(code:'account.create.success', args:[account.companyName])
			}

		}
		catch (ValidationException e){
			e.errors.allErrors.each {
				response.message += message(error: it)
			}
		}

		render response as JSON
	}

	//POST
	def create() {
		def response = new ResponseData(message: message(code:'account.create.failed'),
				code: message(code:'account.create.failed.code'))

		def req = request.JSON
		def account
		def user

		try {
			// Member, creating own account
			if(req.userId) {
				account = accountService.createAccount( req.companyName, req.companyDescription, req.userId )
			}
			else {
				//Check if duplicate
				user = User.findByEmail(req.email)
				if (!user) {
					user = userService.createUser(req.displayName, req.email, req.password, true)
					if(user) {
						account = accountService.createAccount( "My First Kanlah Project", "My First Kanlah Project", user.id )
					} else {
						response.message = message(code:'user.create.failed', args:[req.displayName])
					}
				} else {
					response.message = message(code:'user.email.unique', args:[req.email])
				}
			}

			if (account) {
				response.success = true
				response.data = retAccountData(account)
				response.code = message(code:'account.create.success.code')
				response.message = message(code:'account.create.success', args:[account.companyName])
			}

		}
		catch (ValidationException e){
			e.errors.allErrors.each {
				response.message += message(error: it)
			}
		}

		render response as JSON
	}


	def testErrorCode(err, str){
		return err.toString().indexOf(str)
	}
	
	//DELETE
	def delete(String id) {
		def account = Account.findById(id)
		if (account) account.delete()
		def resp = [id:id]
		render resp as JSON
	}
	
	def retAccountData = { account ->
		def account_member =  Account_Member.findByAccountIdAndRole(account.id, Account_Member.MemberRole.OWNER)
		account.collect {
			[accountId: account.id,
			ownerId: account_member?.userId,
			name: account.companyName,
			description: account.companyDescription,
			registrationDate: account.registrationDate,
			accountStatus: account.status.name(),
			status: account_member?.status.name(),
			role: account_member?.role.name(),
			verifiedDate: account.verifiedDate?:"",
			closedDate: account.closedDate?:"",
			updateDate: account.updateDate]
		}[0]
	}

	def members (String companyId) {
		def memberList = accountService.listAllMembersByAccountId(companyId)
		
		def response = new ResponseData(message: message(code:'account.members.get.failed'),
							code: message(code:'account.members.get.failed.code'))
		if (memberList) {
			response.success = true
			response.data = memberList
			response.code = message(code:'account.members.get.success.code')
			response.message = message(code:'account.members.get.success')
		}
		render response as JSON
	} 
	
	//GET
	def companies() {
		def userId = request.currentUser.id
		
		def companyList = accountService.listAllCompanyByUserId(userId)

		def response = new ResponseData(message: message(code:'account.companies.get.failed'),
							code: message(code:'account.companies.get.failed.code'))

		if (companyList) {
			response.success = true
			response.data = companyList
			response.code = message(code:'account.companies.get.success.code')
			response.message = message(code:'account.companies.get.success')
		}
		render response as JSON
	}

	//GET
	def boards() {
		def req = request.JSON;
		def userId = request.currentUser.id
		def accountId = req.accountId ? req.accountId : params.get("companyId","")
		def boardList = boardService.getBoardsByCompanyUser(accountId, userId)

		def response = new ResponseData(message: message(code:'account.boards.get.failed'),
								code: message(code:'account.boards.get.failed.code'))

		if (boardList) {
			response.success = true
			response.data = boardList
			response.code = message(code:'account.boards.get.success.code')
			response.message = message(code:'account.boards.get.success')
		}
		render response as JSON
	}
	
	def labels(String id) {
		
		def response = new ResponseData(message: message(code:'label.get.failed.msg'),
							code: message(code:'label.get.failed.code'))
		
		def account = Account.findById(id?:"")
		if (account) {
			response.success = true
			response.data = account.getLabelInfo()
			response.code = message(code:'label.get.success.code')
			response.message = message(code:'label.get.success.msg')
		}
		
		render response as JSON
	}
}
