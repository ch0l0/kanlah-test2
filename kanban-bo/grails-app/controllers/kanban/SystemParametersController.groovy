package kanban

import org.springframework.dao.DataIntegrityViolationException

class SystemParametersController {

    static allowedMethods = [save: "POST", update: "POST", delete: "POST"]

    def index() {
        redirect(action: "list", params: params)
    }

    def list(Integer max) {
        params.max = Math.min(max ?: 10, 100)
        [systemParametersInstanceList: SystemParameters.list(params), systemParametersInstanceTotal: SystemParameters.count()]
    }

    def edit(Long id) {
        def systemParametersInstance = SystemParameters.get(id)
        if (!systemParametersInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'systemParameters.label', default: 'SystemParameters'), id])
            redirect(action: "list")
            return
        }

        [systemParametersInstance: systemParametersInstance]
    }

    def update(Long id, Long version) {
		
        def systemParametersInstance = SystemParameters.get(id)
        if (!systemParametersInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'systemParameters.label', default: 'SystemParameters'), id])
            redirect(action: "list")
            return
        }

        if (version != null) {
            if (systemParametersInstance.version > version) {
                systemParametersInstance.errors.rejectValue("version", "default.optimistic.locking.failure",
                          [message(code: 'systemParameters.label', default: 'SystemParameters')] as Object[],
                          "Another user has updated this SystemParameters while you were editing")
                render(view: "edit", model: [systemParametersInstance: systemParametersInstance])
                return
            }
        }

        systemParametersInstance.properties = params

        if (!systemParametersInstance.save(flush: true)) {
            render(view: "edit", model: [systemParametersInstance: systemParametersInstance])
            return
        }

        flash.message = "System Parameters updated."
        //redirect(action: "show", id: systemParametersInstance.id)
		redirect(action: "list", id: systemParametersInstance.id)
    }

	def upload() {
		
		def f = request.getFile('myFile')
		if (f.empty) {
			flash.message = 'File cannot be empty.'
			render(view: 'edit', model: [systemParametersInstance: SystemParameters.first()])
			return
		}
	
		def configAssets = grailsApplication.config.grails.staticAssets
		def logoFile = configAssets.logoFileLoc + "/" + f.getOriginalFilename()
		
		def systemParameters = SystemParameters.first()
		f.transferTo(new File(logoFile)) 
		//response.sendError(200, 'Done')
		flash.message = 'File uploaded.'
		
		//def url = configAssets.url + "/" + configAssets.logoDir + "/" + f.getOriginalFilename()
		def url = systemParameters.url + "/" + configAssets.logoDir + "/" + f.getOriginalFilename()
		
		systemParameters.logo = url
		
		render(view: 'edit', model: [systemParametersInstance:systemParameters ])
		return
	}
	
	def cancel() {
		def systemParametersInstance = SystemParameters.first()
		render(view: "edit", model: [systemParametersInstance: systemParametersInstance])
		return
	}
}
