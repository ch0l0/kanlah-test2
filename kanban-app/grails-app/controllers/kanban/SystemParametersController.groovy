package kanban

import grails.converters.JSON;

class SystemParametersController {

	
    def index() { 
		def response = new ResponseData(message: message(code:'systemparameters.get.failed'),
			code: message(code:'systemparameters.get.failed.code'))
		
		def systemParameters = SystemParameters.first()

		if (systemParameters) {	
			response.data = systemParameters
			response.success = true
			response.code = message(code:'systemparameters.get.success.code')
			response.message = message(code:'systemparameters.get.success')
		}
	
		render response as JSON	
	}
}
