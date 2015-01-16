package kanban

import org.apache.shiro.SecurityUtils;
import org.springframework.dao.DataIntegrityViolationException

class ShiroRoleController {

    static allowedMethods = [save: "POST", update: "POST", delete: "POST"]

    def index() {
        redirect(action: "list", params: params)
    }

    def list(Integer max) {
        params.max = Math.min(max ?: 10, 100)
		params.sort = params?.sort ?: "name"
		params.order = params?.order ?: "asc"
        [shiroRoleInstanceList: ShiroRole.list(params), shiroRoleInstanceTotal: ShiroRole.count()
			, accessList: BOAccess.values()
			, loggedInAsAdmin: isAdmin()]
    }
	
	def isAdmin() {
		def admin = false
		def principal = SecurityUtils.subject?.principal
		if (principal) {
			def user = ShiroUser.findByUsername(principal)
			if (user) admin = user.isAdmin()
		}
		admin	
	}

    def create() {
        [shiroRoleInstance: new ShiroRole(params)]
    }

    def save() {
        def shiroRoleInstance = new ShiroRole(params)
        if (!shiroRoleInstance.save(flush: true)) {
            render(view: "create", model: [shiroRoleInstance: shiroRoleInstance])
            return
        }

        flash.message = message(code: 'default.created.message', args: [message(code: 'shiroRole.label', default: 'Role'), shiroRoleInstance.name])
        //redirect(action: "show", id: shiroRoleInstance.id)
		redirect(action: "list", params: params)
    }

    def show(Long id) {
        def shiroRoleInstance = ShiroRole.get(id)
        if (!shiroRoleInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'shiroRole.label', default: 'Role'), id])
            redirect(action: "list")
            return
        }

        [shiroRoleInstance: shiroRoleInstance]
    }

    def edit(Long id) {
        def shiroRoleInstance = ShiroRole.get(id)
        if (!shiroRoleInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'shiroRole.label', default: 'Role'), id])
            redirect(action: "list")
            return
        }

        [shiroRoleInstance: shiroRoleInstance]
    }

    def update(Long id, Long version) {
		
		def shiroRoleInstance = ShiroRole.get(id)
        if (!shiroRoleInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'shiroRole.label', default: 'Role'), id])
            redirect(action: "list")
            return
        }

        if (version != null) {
            if (shiroRoleInstance.version > version) {
                shiroRoleInstance.errors.rejectValue("version", "default.optimistic.locking.failure",
                          [message(code: 'shiroRole.label', default: 'ShiroRole')] as Object[],
                          "Another user has updated this ShiroRole while you were editing")
                render(view: "edit", model: [shiroRoleInstance: shiroRoleInstance])
                return
            }
        }
		
		shiroRoleInstance.properties = params
		
		shiroRoleInstance.initPermissions()
		params.each {
			if (it.key.startsWith("cb-"+shiroRoleInstance.id+"-")) {
				def _key = it.key.split("-")
			}
		}
 
		if (!shiroRoleInstance.save(flush: true)) {
            render(view: "edit", model: [shiroRoleInstance: shiroRoleInstance])
            return
        }

        flash.message = message(code: 'default.updated.message', args: [message(code: 'shiroRole.label', default: 'Role'), shiroRoleInstance.name])
        //redirect(action: "show", id: shiroRoleInstance.id)
		redirect(action: "list")
    }

    def delete(Long id) {
        def shiroRoleInstance = ShiroRole.get(id)
        if (!shiroRoleInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'shiroRole.label', default: 'Role'), id])
            redirect(action: "list")
            return
        }

		def name = shiroRoleInstance?shiroRoleInstance.name:""
        try {
			
			boolean hasUsers = false
			def users = ShiroUser.list().each {
				if (it.roles.contains(shiroRoleInstance)) hasUsers = true
			}
			
			if (hasUsers) {
				flash.message = "Cannot delete role. There are users associated with this role."
				redirect(action: "edit", id: id)
				return
			}
			
            shiroRoleInstance.delete(flush: true)
            flash.message = message(code: 'default.deleted.message', args: [message(code: 'shiroRole.label', default: 'Role'), name])
            redirect(action: "list")
        }
        catch (DataIntegrityViolationException e) {
            flash.message = message(code: 'default.not.deleted.message', args: [message(code: 'shiroRole.label', default: 'Role'), name])
            redirect(action: "edit", id: id)
        }
    }
	
	def updateRoles() {
		
		def roles = ShiroRole.list()
		roles.each { role ->
			if (!role.isAdmin()) {
				
				role.initPermissions()
				
				role.access = []
				
				params.each {
					def pKey = it.key.split("-")
					if (pKey && pKey[0] && pKey[0] == "cb") {
						if (role.id == Long.parseLong(pKey[1])) {
							def boAccess = BOAccess.values().find { it.value == Integer.parseInt(pKey[2]) }
							if (boAccess) {
								boAccess.permission.each { p ->
									//role.addToPermissions(boAccess.permission())
									role.addToPermissions(p)
								}
								role.addToAccess(boAccess)
							}	
						} 
					}
				}
				
				role.save()
			}
		}
		
		flash.message = "Kanban BO Roles updated."
		index()
	}
}
