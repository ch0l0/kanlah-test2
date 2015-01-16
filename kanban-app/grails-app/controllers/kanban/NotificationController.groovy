package kanban

import org.codehaus.groovy.grails.web.util.WebUtils;

import grails.converters.JSON;

class NotificationController {

    def index() { }
	
	def notifications() {
		def response = new ResponseData(message: message(code:'notificatons.get.failed.msg'),
			code: message(code:'notificatons.get.failed.code'))

		
		
		def webUtils = WebUtils.retrieveGrailsWebRequest()
		def userId = webUtils?.getHeader("userId")
		
		if (userId) {
			
			def notifications = getNotifications(userId, false)
		
			response.success = true
			response.data = notifications
			response.total = getNotificationsTotal(userId, false)
			response.code = message(code:'notificatons.get.success.code')
			response.message = message(code:'notificatons.get.success.msg')
		}

		render response as JSON
	}
	
	def getNotifications = { userId, onlyNew ->
		
		def _notifications = []
		def notifications = []
		def options = [sort: params?.sort, order: params?.order, offset: params?.offset, max: params?.limit]
		if (onlyNew) notifications = Notification.findAllByUserIdAndStatus(userId, Notification.NotificationStatus.NEW, options)
		else notifications = Notification.findAllByUserId(userId, options)
		for (n in notifications) {
			if (n) _notifications.add(n.info())
		}
		_notifications
	}

	def getNotificationsTotal = { userId, onlyNew ->
		def notifications = []
		if (onlyNew) notifications = Notification.findAllByUserIdAndStatus(userId, Notification.NotificationStatus.NEW)
		else notifications = Notification.findAllByUserId(userId)

		notifications.size()
	}

	def read() {
		def response = new ResponseData(message: message(code:'notificatons.read.failed.msg'),
			code: message(code:'notificatons.read.failed.code'))
		
		def req = request.JSON
		
		req.ids.eachWithIndex { id, i ->
			def notification = Notification.findById(id)
			if (notification && notification.status == Notification.NotificationStatus.NEW) {
				notification.status = Notification.NotificationStatus.READ
				if (notification.validate() && notification.save()) {
					response.success = true
					response.code = message(code:'notificatons.read.success.code')
					response.message = message(code:'notificatons.read.success.msg')
				} else log.error notification.errors
			}
		}
		
		render response as JSON
	}
	
	def countUnread() {
		def response = new ResponseData(message: message(code:'notificatons.countnew.failed.msg'),
			code: message(code:'notificatons.countnew.failed.code'))
		
		def webUtils = WebUtils.retrieveGrailsWebRequest()
		def userId = webUtils?.getHeader("userId")
		
		if (userId) {
			
			def countNew = Notification.countByUserIdAndStatus(userId, Notification.NotificationStatus.NEW)
		
			response.success = true
			response.data = countNew?:0
			response.code = message(code:'notificatons.countnew.success.code')
			response.message = message(code:'notificatons.countnew.success.msg')
		}
		
		render response as JSON
	}
	
	def delete(String id) {
		def response = new ResponseData(message: message(code:'notificatons.delete.failed.msg'),
			code: message(code:'notificatons.delete.failed.code'))
		
		def notification = Notification.findById(id)
		if (notification) {
			notification.delete()
			response.success = true
			response.code = message(code:'notificatons.delete.success.code')
			response.message = message(code:'notificatons.delete.success.msg')
		}
		
		response.data = id
		
		render response as JSON
	}
}
