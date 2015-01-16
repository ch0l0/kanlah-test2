package kanban

import kanban.old.Task
import org.codehaus.groovy.grails.web.mapping.LinkGenerator;

import job.MailData
import grails.validation.ValidationException
import org.springframework.transaction.annotation.Transactional
import util.Util
import exceptions.UserException

import java.security.MessageDigest

class UserService {
	def mailService
	LinkGenerator grailsLinkGenerator
	
	def appName = SystemParameters.first()?.name?:""

	//NEW KBN -- Start
	def createUser(displayName, email, password, sendEmail) {
		def user = new User(fullname: displayName,
			email: email,
			password: password,
			activationCode: Util.generateActivationCode())
		
		if (user.validate() && user.save()){
			if (sendEmail) {
				def url = grailsLinkGenerator.serverBaseURL + "/user/" + user.id + "/activate/" + user.activationCode;
				sendEmailRegistration(displayName, email, url);
			}
		}
		else {
			if(user.hasErrors())
			throw new ValidationException("Foo is not Valid",user.errors)
		}
		user
	}
	
	def activate(user) {
		if (user.status == Status.PENDING) {
			user.status = Status.ENABLED
			user.verifiedDate = new Date()
			user.save()
			return true
		}
		return false
	}
	
	def sendEmailRegistration(name, email, url){
		
		def content = """\
					Hello ${name},<br><br>

					Welcome to ${appName.toUpperCase()}!<br><br>

					To get started, please activate your account by visiting:<br>
					${url}<br><br>
					
					We hope you enjoy using ${appName}!<br><br>

					-The ${appName} Team
					"""
		
		MailData mail = new MailData(
				to: email,
				subject: "Registration: ${name}",
				content: content
		)
		EmailJob.triggerNow([mailData: mail])
		return true
	}
	
	def sendDeclineInvite(ownerEmail, ownerName, memberName, projectName) {
		def content = """\
					Hello ${ownerName},<br><br>

					${memberName} has declined your invitation to be part of the members for ${projectName}.<br><br>

					We hope this does not disrupt your project too much.<br><br>

					-The ${appName} Team
					"""
		MailData mail = new MailData(
				to: ownerEmail,
				subject: "${memberName} response for ${projectName} invitation",
				content: content
		)
		EmailJob.triggerNow([mailData: mail])
		return true
	}

	@Transactional
	def updateUser(userId, fullname, initials, email, password) {
		def user = User.findById(userId)
		if(user){
			user.fullname= fullname?:user.fullname
			user.initials= initials?:user.initials
			user.email= email?:user.email
			user.password= password?:user.password
			if(!(user.save() && user.validate())){
				user.errors.allErrors.each {
					log.error("Err:" + it)
				}
				null
			}
		}
		user
	}

	@Transactional
	def changeEmail(userId, newEmail, url) throws UserException{
		def user = User.findById(userId)
		def userEmailExist = User.findByEmail(newEmail)
		if(user.email == newEmail){
			throw new UserException("New email cannot be the same as the current email.")
		}
		if(userEmailExist){
			throw new UserException("Email already existed, please choose another email.")
		}
		if(user){
			user.newEmail= newEmail?:""
			if((user.save() && user.validate())){
				sendChangeEmailVerification(user, url)
				user.errors.allErrors.each {
					log.error("Err:" + it)
				}
				null
			}
		}
		user
	}

	@Transactional
	def updateEmail(userId) {
		def user = User.findById(userId)
		if(user){
			if(user.newEmail.isEmpty())
				return null
			user.email= user.newEmail
			user.newEmail= ""
			if(!(user.save() && user.validate())){
				user.errors.allErrors.each {
					log.error("Err:" + it)
				}
				null
			}
		}
		user
	}
	//NEW KBN -- End

	def sendEmailConfirmation(User userInstance){
		def content = """\
					Hello ${userInstance.fullname}</b>,<br><br>
					We are ready to activate your account. All you need to do is to verify address.<br>
					<a style='font-weight:bold;background-color:#ffb51c;font-size:20px;'>VERIFY ADDRESS</a><br><br>
					If you didn't create a ${appName} account, just delete this email.<br><br>
					Yours Sincerely,<br>${appName} Team
					"""

		MailData mail = new MailData(
			to: userInstance.email,
			subject: "${appName} Account Confirmation",
			content: content
		)
		EmailJob.triggerNow([mailData: mail])
	}

	def sendResetPasswordEmail(User userInstance, String password, String url){
		def content = """\
					Hello ${userInstance.fullname},<br><br>

					We have received a request to reset your Kanlah password.<br><br>

					Your new password is : ${password}<br><br>

					and you can start using it by visiting:<br>
					<a href='${url}'>${url}</a><br><br>

					Good luck with your projects.<br><br>

					-The ${appName} Team
					"""

		MailData mail = new MailData(
				to: userInstance.email,
				subject: "${appName} - Reset Password",
				content: content
		)
		EmailJob.triggerNow([mailData: mail])
	}

	def resetPassword(User user){
		MessageDigest digest = MessageDigest.getInstance("MD5")
						digest.update((user.email + new Date().toString()).bytes)
		def generatedPassword = new BigInteger(1, digest.digest()).toString(16).substring(0, 7).toUpperCase()
		def _user = updateUser(user.id, null, null, null, generatedPassword)
		if(_user){
			generatedPassword
		}
		else
			null
	}

	def sendChangeEmailVerification(User userInstance, String url){
		def content = """\
					Hello ${userInstance.fullname},<br><br>

					We have received a request to change your email from '${userInstance.email}' to '${userInstance.newEmail}'.<br><br>

					To confirm this action, please visit this unique <a href='${url}'>change email page.</a><br><br>

					If you have not requested this change, just ignore this message and no update will be made to your account.<br><br>

					Good luck with your projects.<br><br>

					-The ${appName} Team
					"""

		MailData mail = new MailData(
			to: userInstance.newEmail,
			subject: "${appName} - Change of Email",
			content: content
		)
		EmailJob.triggerNow([mailData: mail])
	}

	def sendTaskNotificationEmail(User userInstance, Task task){
		def content = """\
					<style>td { vertical-align: top; }</style>
					Hello ${userInstance.fullname},
					You have been assigned to task '<b>${task.name.toUpperCase() ?: ''}'</b><br><br>
					<table style='border:0px;margin-left: 50px;padding:5px;width:500px'>
						${task.description? "<tr><td style='width:50px'>Description</td><td> : " + task.description + "</td></tr>": ""}
						${task.dueDate? "<tr><td style='width:50px'>Due Date</td><td> : " + task.dueDate + "</td></tr>": ""}
						<tr><td>Created On</td><td> : ${task.createDate?: ''}</td></tr>
						<tr><td>Updated On</td><td> : ${task.updateDate?: ''}</td></tr>
					</table>
					<br><br><span style='font-size:13px'>(This message is automatically generated by ${appName}.)</span>
					<br><br>Yours Sincerely,<br>${appName} Team
					"""
		
		MailData mail = new MailData(
			to: userInstance.email,
			subject: "${appName} - Task [${task.name.toUpperCase()}] has been assigned to you",
			content: content
		)
		EmailJob.triggerNow([mailData: mail])
	}
	
	def sendEmailInvite(User user, Account company, String password, String url, boolean isNewMember){
//		def content = """\
//					<b>Hey ${user.fullname},</b><br><br>
//					You are invited to join ${company.companyName}'s ${appName}.<br><br>
//                    Login to ${appName} using the information below:<br>
//                    Email: ${user.email}<br>
//                    Password: ${password}<br>
//                    Click <a style='font-weight:bold;background-color:#ffb51c;font-size:20px;' href='${url}'>here</a> login.
//					"""
		
		def content = ""
		if (isNewMember) 
			content = contentNewMember(user.fullname, accountOwner(company.id)?:"", company.companyName, user.email, password, url)
		 else 
			content = contentExistingMember(user.fullname, accountOwner(company.id)?:"", company.companyName)
		
		MailData mail = new MailData(
			to: user.email,
			subject: "Invitation to join ${company.companyName}",
			content: content
		)
		EmailJob.triggerNow([mailData: mail])
	}
	
	def accountOwner = { accountId ->
		def a_m = Account_Member.findByAccountIdAndRole(accountId, Account_Member.MemberRole.OWNER)
		def owner = User.findById(a_m?.userId?:"")
		owner?.fullname
	}
	
	def contentNewMember = { displayName, ownerName, projectName, email, password, url ->
		def content = """\
		Hello ${displayName},<br><br>

		Welcome to ${appName.toUpperCase()}! ${ownerName} has signed you up at Kanlah.com to be part of ${projectName}.<br>
		To get started, please activate your account by visiting:<br>
		${url}<br><br>
		
		These are your login details:<br><br>

		<b>Display name:</b> ${displayName}<br>
		<b>Email address:</b> ${email}<br>
		<b>Password:</b> ${password}<br><br>

		When you are logged in, you can change your password at any time via "Account" > "Change Password".<br><br>

		We hope you enjoy using ${appName}!<br><br>

		-The ${appName} Team
		"""
		
		content
	}
	
	def contentExistingMember = { displayName, ownerName, projectName ->
		def content = """\
		Hello ${displayName},<br><br>

		${ownerName} has invited you to join ${projectName}.<br><br>

		You can accept/reject the invitation next time you log in at <a href='http://we.kanlah.com'>we.kanlah.com</a><br><br>

		We hope you enjoy using ${appName}!<br><br>

		-The ${appName} Team
		"""
		
		content
	}
	
	def sendTaskDateDueEmail(User userInstance, Task task){
		def content = """\
					<style>td { vertical-align: top; }</style>
					Hello ${userInstance.fullname},
					Task '<b>${task.name.toUpperCase() ?: ''}' was due on ${task.dueDate}</b><br><br>
					<table style='border:0px;margin-left: 50px;padding:5px;width:500px'>
						<tr><td style='width:50px'>Description</td><td> : ${task.description?: ''}</td></tr>
						<tr><td>Due Date</td><td> : ${task.dueDate?: ''}</td></tr>
						<tr><td>Created On</td><td> : ${task.createDate?: ''}</td></tr>
						<tr><td>Updated On</td><td> : ${task.updateDate?: ''}</td></tr>
					</table>
					<br><br><span style='font-size:13px'>(This message is automatically generated by ${appName}.)</span>
					<br><br>Yours Sincerely,<br>${appName} Team
					"""
		
		MailData mail = new MailData(
			to: userInstance.email,
			subject: "${appName} - Task was due on ${task.dueDate}",
			content: content
		)
		EmailJob.triggerNow([mailData: mail])
	}
	
	def delete(User userInstance){
		if (userInstance) {
			if (!userInstance.delete(flush: true)) {
				throw new ValidationException("Validation errors", userInstance.errors)
			}
		}
	}
	
	def update(User userInstance, Object obj){
		userInstance.fullname = obj.fullname
		userInstance.email = obj.email
		userInstance.password = obj.password
		if (!userInstance.save(flush: true)) {
			throw new ValidationException("Validation errors", userInstance.errors)
		}
	}


	

	
	def notify(User user, task, String message) {
		if (user && task) {
			def notification = new Notification()
			notification.user = user
			notification.target = task
			notification.message = message  //"""You have been assigned to $task.name"""
			notification.board = task.column.board
			
			if (notification.validate() && notification.save()) {
				return true
			} else log.error notification.errors
		}
		return false
	}
	
	def getUserProfile(User user){
		return [
			id: user.id,
			email: user.email,
			fullname: user.fullname,
			avatar: user.avatar,
			useAvatar: user.useAvatar
		]
	}
	
}
