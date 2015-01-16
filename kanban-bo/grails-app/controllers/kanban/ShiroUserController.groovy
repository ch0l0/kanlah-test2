package kanban

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.crypto.hash.Sha256Hash;
import org.springframework.dao.DataIntegrityViolationException

class ShiroUserController {

    static allowedMethods = [save: "POST", update: "POST", delete: "POST"]

    def index() {
        redirect(action: "list", params: params)
    }

    def list(Integer max) {
        params.max = Math.min(max ?: 10, 100)
		params.sort = params?.sort ?: "username"
		params.order = params?.order ?: "asc"
        [shiroUserInstanceList: ShiroUser.list(params), shiroUserInstanceTotal: ShiroUser.count()]
    }

    def create() {
		flash.message = null
        [shiroUserInstance: new ShiroUser(params)]
    }

    def save() {
        def shiroUserInstance = new ShiroUser(params)
		
		shiroUserInstance.passwordHash = new Sha256Hash(shiroUserInstance.passwordHash).toHex()
        
		if (!shiroUserInstance.save(flush: true)) {
            render(view: "create", model: [shiroUserInstance: shiroUserInstance])
            return
        }
        

        flash.message = message(code: 'default.created.message', args: [message(code: 'shiroUser.label', default: 'User'), shiroUserInstance.username])
        //redirect(action: "show", id: shiroUserInstance.id)
		redirect(action: "list", params: params)
    }

    def show(Long id) {
        def shiroUserInstance = ShiroUser.get(id)
        if (!shiroUserInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'shiroUser.label', default: 'User'), ""])
            redirect(action: "list")
            return
        }

        [shiroUserInstance: shiroUserInstance]
    }

    def edit(Long id) {
        def shiroUserInstance = ShiroUser.get(id)
        if (!shiroUserInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'shiroUser.label', default: 'User'), ""])
            redirect(action: "list")
            return
        }

        [shiroUserInstance: shiroUserInstance]
    }

    def update(Long id, Long version) {
		flash.message = null
		
        def shiroUserInstance = ShiroUser.get(id)
        if (!shiroUserInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'shiroUser.label', default: 'User'), ""])
            redirect(action: "list")
            return
        }

        if (version != null) {
            if (shiroUserInstance.version > version) {
                shiroUserInstance.errors.rejectValue("version", "default.optimistic.locking.failure",
                          [message(code: 'shiroUser.label', default: 'User')] as Object[],
                          "Another user has updated this User while you were editing")
                render(view: "edit", model: [shiroUserInstance: shiroUserInstance])
                return
            }
        }
		
		if (params.roles?.size() > 1) {
			flash.message = "Please select only 1 role."
			render(view: "edit", model: [shiroUserInstance: shiroUserInstance])
			return
		}

		def currentPassword = shiroUserInstance.passwordHash
		shiroUserInstance.properties = params
		shiroUserInstance.passwordHash = shiroUserInstance.passwordHash.trim() != ""? new Sha256Hash(shiroUserInstance.passwordHash.trim()).toHex() : currentPassword
		
		if (!shiroUserInstance.save(flush: true)) {
            render(view: "edit", model: [shiroUserInstance: shiroUserInstance])
            return
        }
		

        flash.message = message(code: 'default.updated.message', args: [message(code: 'shiroUser.label', default: 'User'), shiroUserInstance.username])
        //redirect(action: "show", id: shiroUserInstance.id)
		redirect(action: "list")
    }

    def delete(Long id) {
		def user
		def principal = SecurityUtils.subject?.principal
		
		if (principal) user = ShiroUser.findByUsername(principal)
		
        def shiroUserInstance = ShiroUser.get(id)
        if (!shiroUserInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'shiroUser.label', default: 'User'), ""])
            redirect(action: "list")
            return
        }
		
		if (user && user == shiroUserInstance) {
			flash.message = "You are currently logged-on using this account."
			redirect(action: "edit", id: id)
			return
		}

        try {
            shiroUserInstance.delete(flush: true)
            flash.message = message(code: 'default.deleted.message', args: [message(code: 'shiroUser.label', default: 'User'), ""])
            redirect(action: "list")
        }
        catch (DataIntegrityViolationException e) {
            flash.message = message(code: 'default.not.deleted.message', args: [message(code: 'shiroUser.label', default: 'User'), ""])
            redirect(action: "edit", id: id)
        }
    }
}
