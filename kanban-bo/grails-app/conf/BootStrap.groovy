import org.apache.shiro.crypto.hash.Sha256Hash;

import kanban.BOAccess;
import kanban.PlanType;
import kanban.ShiroRole;
import kanban.ShiroUser;
import kanban.SystemParameters;

class BootStrap {

    def init = { servletContext ->
		
		def systemParameters = SystemParameters.first()
		if (!systemParameters) {
			new SystemParameters().save()
		}
		
		createRoles()
		creatAdminAccount()
		addAccessToRoles()
    }
	
    def destroy = {
    }
	
	def createRoles() {
		log.debug "createRoles()"
		log.debug "creating admin role..."
		def adminRole = ShiroRole.findByName("BO_ADMIN")
		if (!adminRole) {
			adminRole = new ShiroRole(name: "BO_ADMIN")
			adminRole.addToPermissions("*:*")
			adminRole.save()
		}
		log.debug adminRole
		
		log.debug "creating user role..."
		def userRole = ShiroRole.findByName("BO_USER")
		if (!userRole) {
			userRole = new ShiroRole(name: "BO_USER")
			userRole.addToPermissions("auth:*")
			userRole.addToPermissions("backoffice:*")
//			userRole.addToPermissions("company:index")
//			userRole.addToPermissions("company:list")
//			userRole.addToPermissions("company:subscribedListing")
//			userRole.addToPermissions("company:freeListing")
//			userRole.addToPermissions("company:search")
			userRole.addToPermissions("project:index")
			userRole.addToPermissions("project:list")
			userRole.addToPermissions("project:search")
			userRole.addToPermissions("project:enable")
			userRole.addToPermissions("project:suspend")
			userRole.addToPermissions("project:close")
//			userRole.addToPermissions("statistics:index")
//			userRole.addToPermissions("statistics:list")
//			userRole.addToPermissions("systemParameters:index")
//			userRole.addToPermissions("systemParameters:list")
//			userRole.addToPermissions("systemParameters:edit")
//			userRole.addToPermissions("systemParameters:update")
			userRole.save()
		}
		log.debug userRole
	}
	
	def creatAdminAccount() {
		log.debug "createAdminAccount()"
		def user = ShiroUser.findByUsername("admin")
		if (!user) {
			user = new ShiroUser(username: "admin", passwordHash: new Sha256Hash("Password123").toHex())
			user.addToPermissions("*:*")
			user.addToRoles(ShiroRole.findByName("BO_ADMIN"))
			user.save()
		}
		log.debug user
	}
	
	def addAccessToRoles() {
		log.debug "addAccessToRoles()"
		ShiroRole.list().each { role ->
			if (role.isAdmin()) {
				role.access = []
				BOAccess.values().each {
					role.addToAccess(it)
					it.permission.each { permission ->
						role.addToPermissions(permission)
					}
				}
				role.save()
			} else if (!role.access || role.access?.isEmpty()) {
				role.access = []
				BOAccess.values().each {
					if (it != BOAccess.BO_USERS && it != BOAccess.BO_ROLES)
						if (!role.access.contains(it)) {
							role.addToAccess(it)
							it.permission.each { permission ->
								role.addToPermissions(permission)
							}
						}	
				}
				role.save()
			}
		}
	}
}
