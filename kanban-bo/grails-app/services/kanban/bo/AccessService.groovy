package kanban.bo

import org.apache.shiro.SecurityUtils;

import kanban.ShiroUser;

class AccessService {

    def allowAction(username, boAccess) {
		def user = ShiroUser.findByUsername(username)
		if (user) {
			for (role in user.roles) {  
				def access = role.access
				if (access && access.contains(boAccess)) {
					return true
				}	
			}
		}
		false
	}
}
