import kanban.SystemParameters;


class BootStrap {
	def init = { servletContext ->
//		if (Environment.current == Environment.DEVELOPMENT)
		
		def systemParameters = SystemParameters.first()
		if (!systemParameters) new SystemParameters().save(flush:true)
	}
	def destroy = {
	}
}
