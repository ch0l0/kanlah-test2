package kanban

import grails.validation.ValidationException
import org.codehaus.groovy.grails.web.util.WebUtils;

import grails.converters.JSON;

class ColumnController {

	def columnService
	def userService

	//POST
	def save() {
		def response = new ResponseData(message: message(code:'column.create.failed.msg'),
			code: message(code:'column.create.failed.code'))
		
		def req = request.JSON
		try {
			def column = columnService.create(req.boardId, req.title, req.color, req.max, req.pos)
			if (column) {
				response.success = true
				response.data = column.info()
				response.code = message(code:'column.create.success.code')
				response.message = message(code:'column.create.success.msg')
			}
		}
		catch (ValidationException e){
			e.errors.allErrors.each {
				response.message += message(error: it)
			}
		}
		
		render response as JSON
	}
	
	//GET
	def show(String id) {
		def response = new ResponseData(message: message(code:'column.get.failed.msg'),
			code: message(code:'column.get.failed.code'))
		
		def column = Column.findById(id)
		if (column) {
			response.success = true
			response.data = column.info()
			response.code = message(code:'column.get.success.code')
			response.message = message(code:'column.get.success.msg')
		}
		
		render response as JSON
	}

	//PUT
	def update(String id) {
		def response = new ResponseData(message: message(code:'column.update.failed.msg'),
				code: message(code:'column.update.failed.code'))

		def req = request.JSON
		try {
			def column = columnService.update(id, req.title, req.color, req.max, req.pos, req.status)
			if (column) {
				response.success = true
				response.data = column.info()
				response.code = message(code:'column.update.success.code')
				response.message = message(code:'column.update.success.msg')
			}
		}
		catch (ValidationException e){
			e.errors.allErrors.each {
				response.message += message(error: it)
			}
		}

		render response as JSON
	}

	//DELETE
	def delete(String id) {
		def response = new ResponseData(message: message(code:'column.delete.failed.msg'),
				code: message(code:'column.delete.failed.code'))

		def column = columnService.delete(id)
		if (column) {
			response.success = true
			response.data = column.info()
			response.code = message(code:'column.delete.success.code')
			response.message = message(code:'column.delete.success.msg')
		}

		render response as JSON
	}

	def subscribe(String id) {
		def response = new ResponseData(message: message(code:'column.subscribe.failed.msg'),
			code: message(code:'column.subscribe.failed.code'))
		
		def webUtils = WebUtils.retrieveGrailsWebRequest()
		def userId = webUtils?.getHeader("userId")
		
		def subscribed = Column_Member.findByColumnIdAndUserId(id, userId?:"")
		if (userId && !subscribed) {
			def cm = new Column_Member(columnId: id, userId: userId, subscriptionDate: new Date())
			if (cm.validate() && cm.save()) {
				response.success = true
				response.data = cm.info()
				response.code = message(code:'column.subscribe.success.code')
				response.message = message(code:'column.subscribe.success.msg')
			} else log.error cm.errors
		
		}
		
		render response as JSON
	}
	
	def unsubscribe(String id) {
		def response = new ResponseData(message: message(code:'column.unsubscribe.failed.msg'),
			code: message(code:'column.unsubscribe.failed.code'))
		
		def webUtils = WebUtils.retrieveGrailsWebRequest()
		def userId = webUtils?.getHeader("userId")
		
		def subscribed = Column_Member.findByColumnIdAndUserId(id, userId?:"")
		if (subscribed) {
			subscribed.delete(flush: true)
			response.success = true
			response.data = id
			response.code = message(code:'column.unsubscribe.success.code')
			response.message = message(code:'column.unsubscribe.success.msg')
		}
		
		render response as JSON
	}
}
