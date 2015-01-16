package kanban

import grails.converters.JSON

import java.text.SimpleDateFormat

class ActivityController {
	def activityService

	//GET
	def list(String id) {
		def response = new ResponseData(message: message(code:'board.get.failed.msg'),
				code: message(code:'board.get.failed.code'))

		def board = Board.findById(id)
		def user = User.findById(request.currentUser.id)

		if (board && user) {
			response.data = activityService.list(board, params)
			response.success = true
			response.total = activityService.total(board)
			response.message = message(code:'board.get.success.msg')
			response.code = message(code:'board.get.success.code')
		}

		render response as JSON
	}

	//GET
	def last(String id) {
		def response = new ResponseData(message: message(code:'board.get.failed.msg'),
				code: message(code:'board.get.failed.code'))

		def req = request.JSON
		def board = Board.findById(id)
		def user = User.findById(request.currentUser.id)
		//TimeZone utc = TimeZone.getTimeZone("UTC");
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSS'Z'")
		//sdf.setTimeZone(utc)
		def lastTime = sdf.parse(req.time)
		if (board && user) {
			response.data = activityService.last(board, lastTime)
			response.success = true
			response.message = message(code:'activities.last.success.msg', args:[lastTime])
			response.code = message(code:'activities.last.success.code')
		}

		render response as JSON
	}

}
