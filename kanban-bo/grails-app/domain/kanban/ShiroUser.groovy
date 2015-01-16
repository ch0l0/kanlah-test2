package kanban

class ShiroUser {
    String username
    String passwordHash
	
	String email
	String name
    
    static hasMany = [ roles: ShiroRole, permissions: String ]
	static belongsTo = ShiroRole

    static constraints = {
        username(nullable: false, blank: false, unique: true, size: 4..20)
		passwordHash nullable: false, blank: false
		email email:true, nullable: true, blank: true
		name nullable: true, blank: true
    }
	
	static transients = ['admin', 'role']
	Boolean isAdmin() {
		return roles.contains(ShiroRole.findByName("BO_ADMIN"))
	}
	
	String getRole() {
		return roles?roles.asList().first()?roles.asList().first().name:"":""
	}
}
