package kanban

import grails.converters.JSON
import org.apache.commons.logging.LogFactory
import org.codehaus.groovy.grails.web.mapping.LinkGenerator
import org.springframework.web.multipart.MultipartHttpServletRequest
import util.ImageSerializer
import exceptions.UserException

class UserController {
	private static final log = LogFactory.getLog(this)
	LinkGenerator grailsLinkGenerator
	def userService
    def index() { }

	//NEW KBN -- Start
	//POST
	def activate(String id, String code) {
		def response = new ResponseData(message: message(code:'user.activate.failed'),
				code: message(code:'user.activate.failed.code'))

		def user = User.findById(id)
		if (user && user.activationCode == code && user.status == Status.PENDING) {
			if (userService.activate(user)) {
				response.success = true
				response.code = message(code:'user.activate.success.code')
				response.message = message(code:'user.activate.success', args:[user.username])
			}
		}
		
		if (response.code == message(code:'user.activate.failed.code')) {
			redirect (uri: "/#actfailed")
			return
		}
		
		
		redirect (uri: "/#")
	}
	
	def resendEmail() {
		def response = new ResponseData(message: message(code:'user.resendEmail.failed'),
			code: message(code:'user.resendEmail.failed.code'))
		def req = request.JSON
		def email = req.email
		def user = User.findByEmail(email)
		if(user.status == Status.CLOSED) {
			response.code = message(code:'login.account.status.code')
			response.message = message(code:'login.account.status.message', args:[user.status.name().toLowerCase()])
		} else {
			def url = grailsLinkGenerator.serverBaseURL + "/user/" + user.id + "/activate/" + user.activationCode
			def sendEmail = userService.sendEmailRegistration(user.fullname, user.email, url)
			if(sendEmail) {
				response.success = true
				response.code = message(code:'user.resendEmail.success.code')
				response.message = message(code:'user.resendEmail.success', args:[user.email])
			}
		}
		render response as JSON
	}

	//GET
	def get(){
		def response = new ResponseData(message: message(code:'user.not.found'),
				code: message(code:'user.not.found.code'))
		def id = params.id?:""
		def user = User.findById(id)
		if(user){
			response.success = true
			response.data = user.info()
			response.code = message(code:'user.get.success.code')
			response.message = message(code:'user.get.success', args:[user.username])
		}
		render response as JSON
	}

	//POST
	def signup(){
		def response = new ResponseData(message: message(code:'user.create.success'),
				code: message(code:'user.create.success.code'))


		render response as JSON
	}

	//POST
	def create(){
		def response = new ResponseData(message: message(code:'user.create.success'),
				code: message(code:'user.create.success.code'))
		render response as JSON
	}

	//PUT
	def update(){
		def response = new ResponseData(message: message(code:'user.update.failed'),
				code: message(code:'user.update.failed.code'))
		def req = request.JSON
		def id = params.id?:""
		def user = User.findById(id)
		if (user){
			userService.updateUser( id, req.fullname, req.initials, null, null )
			response.success = true
			response.data = user.info()
			response.code = message(code:'user.update.success.code')
			response.message = message(code:'user.update.success', args:[user.fullname])
		}
		render response as JSON
	}

	//POST
	def changeEmail(){
		def response = new ResponseData(message: message(code:'user.not.found'),
				code: message(code:'user.not.found.code'))
		def req = request.JSON
		def id = params.id?:""
		def user = User.findById(id)
		if (user){
			try{
				def url = "${grailsLinkGenerator.serverBaseURL}/user/${id}/updateEmail";
				if(userService.changeEmail(id, req.newemail, url)){
					response.success = true
					response.data = user.info()
					response.code = message(code:'user.changeEmail.success.code')
					response.message = message(code:'user.changeEmail.success', args:[req.newemail])
				}
			}catch(UserException ex){
				response.message = ex.getMessage();
			}
		}
		render response as JSON
	}

	//POST
	def updateEmail(){
		def response = new ResponseData(message: message(code:'user.update.failed'),
				code: message(code:'user.update.failed.code'))
		def id = params.id?:""
		def user = User.findById(id)
		if (user){
			if(userService.updateEmail( id )){
				response.success = true
				response.data = user.info()
				response.code = message(code:'user.update.success.code')
				response.message = message(code:'user.update.success', args:[user.username])
				
				
			}
		}
		//render response as JSON
		redirect (uri: "/#")
	}

	//POST
	def changePassword(){
		def response = new ResponseData(message: message(code:'user.changePassword.failed'),
				code: message(code:'user.changePassword.failed.code'))
		def req = request.JSON
		def id = params.id?:""
		def user = User.findById(id)
		def oldPassword = req.oldpassword?:""
		def newPassword = req.newpassword?:""
		def confirmPassword = req.confirmpassword?:""
		if (user.comparePassword(oldPassword) && newPassword==confirmPassword){
			if(userService.updateUser( id, null, null, null, newPassword)){
				response.success = true
				response.data = user.info()
				response.code = message(code:'user.changePassword.success.code')
				response.message = message(code:'user.changePassword.success')
			}
		}
		render response as JSON
	}

	//DELETE
	def delete(){
		def response = new ResponseData(message: message(code:'user.delete.failed'),
				code: message(code:'user.delete.failed.code'))
		
		
		
		render response as JSON
	}

	//POST
	def passwordReset() {
		def response = new ResponseData(message: message(code:'user.resetPassword.failed'),
				code: message(code:'user.resetPassword.failed.code'))

		def req = request.JSON
		def email = req.email?.toString().trim().toLowerCase()
		def user = User.findByEmail(email)
		if(user){
			if(user.status == Status.CLOSED) {
				response.code = message(code:'login.account.status.code')
				response.message = message(code:'login.account.status.message', args:[user.status.name().toLowerCase()])
			} else {
				def generatedPassword = userService.resetPassword(user)
				if(generatedPassword) {
	
					def url = grailsLinkGenerator.serverBaseURL + "/#"
					userService.sendResetPasswordEmail(user,generatedPassword,url)
	
					response.success = true;
					response.code = message(code:'user.resetPassword.success.code')
					response.message = message(code:'user.resetPassword.success', args:[email])
				}
			}
		}
		render response as JSON
	}

	//POST
	def saveAvatar(){
		def response = new ResponseData(message: message(code:'user.saveAvatar.failed'),
										code: message(code:'user.saveAvatar.failed.code'))
		def req = request.getSession().getServletContext()
		def id = params.id?:""
		def user = User.findById(id);
		if(user){
			if(request instanceof MultipartHttpServletRequest) {
				 MultipartHttpServletRequest mpr = (MultipartHttpServletRequest)request;

				def configAssets = grailsApplication.config.grails.staticAssets
				def directory = "users/${user.id}/${configAssets.avatar.dir}"
				def path = [
					absolute: "${configAssets.root}/${directory}",
					http: "${configAssets.url}/${directory}",
					relative: "${directory}",
					original: "${configAssets.avatar.originalDir}",
					thumbnail: "${configAssets.avatar.thumbnailDir}"
				]
				def sysParams = SystemParameters.first();
				ImageSerializer serializer = new ImageSerializer(req, mpr.getFile("filedata"), user.id, path, sysParams);
				try{
					if(serializer.save()){
						user.avatar = serializer.getPath(ImageSerializer.PATH.RELATIVE, true);
						user.useAvatar = true
						if(user.save()){
							response.success = true
							response.code = message(code:'user.saveAvatar.success.code')
							response.message = message(code:'user.saveAvatar.success')
							response.data = user.info()
						}
					}
				 }catch(Exception e){
					 log.error("[Exception] save : " + e.getMessage())
				 }
			}
		}
		render response as JSON
	}

	def setAvatar(){
		def response = new ResponseData(message: message(code:'user.setAvatar.failed'),
							code: message(code:'user.setAvatar.failed.code'))
		def req = request.JSON
		def id = params.id?:""
		def user = User.findById(id);
		if(user){
			user.useAvatar = req.useAvatar ?: false;
			if(user.save()){
				response.success = true
				response.data = user
				response.code = message(code:'user.setAvatar.success.code')
				response.message = message(code:'user.setAvatar.success')
			}
		}
		render response as JSON
	}

	//NEW KBN -- End
}
