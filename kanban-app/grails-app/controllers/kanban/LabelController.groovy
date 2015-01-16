package kanban

import grails.converters.JSON;

class LabelController {

	def labelService
	
    def save() {
		def response = new ResponseData(message: message(code:'label.create.failed.msg'),
			code: message(code:'label.create.failed.code'))

		def req = request.JSON
		def label = labelService.create(req.accountId, req.name, req.color)
		if (label) {
			response.success = true
			response.data = label.info()
			response.code = message(code:'label.create.success.code')
			response.message = message(code:'label.create.success.msg', args:[label.name])
		}
		
		render response as JSON
	}
	
	def update(String id) {
		def response = new ResponseData(message: message(code:'label.update.failed.msg'),
			code: message(code:'label.update.failed.code'))

		def req = request.JSON
		
		def label = Label.findById(id)
		if (label) {
			label.name = req.name?:label.name
			label.color = req.color?:label.color
			if (label.validate() && label.save()) {
				response.success = true
				response.data = label.info()
				response.code = message(code:'label.update.success.code')
				response.message = message(code:'label.update.success.msg')
			} else log.error label.errors
		}
		
		render response as JSON
	}
	
	def show(String id) {
		
		def response = new ResponseData(message: message(code:'label.get.failed.msg'),
			code: message(code:'label.get.failed.code'))

		def label = Label.findById(id)
		if (label) {
			response.success = true
			response.data = label.info()
			response.code = message(code:'label.get.success.code')
			response.message = message(code:'label.get.success.msg')
		} 
		
		render response as JSON
	}
	
	def delete(String id) {
		def response = new ResponseData(message: message(code:'label.delete.failed.msg'),
			code: message(code:'label.delete.failed.code'))

		def label = Label.findById(id)
		if (label) {
			label.delete()
			response.success = true
			response.data = id
			response.code = message(code:'label.delete.success.code')
			response.message = message(code:'label.delete.success.msg')
		}
		
		render response as JSON
	}
}
