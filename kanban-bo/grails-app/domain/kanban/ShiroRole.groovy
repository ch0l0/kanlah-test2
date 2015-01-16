package kanban

class ShiroRole {
    String name

    static hasMany = [ users: ShiroUser, permissions: String, access: BOAccess ]
    //static belongsTo = ShiroUser

    static constraints = {
        name(nullable: false, blank: false, unique: true, size: 4..8)
		access nullable:true, blank:true
    }
	
	def isAdmin() {
		return name == "BO_ADMIN"
	}
	
	def initPermissions() {
		this.permissions = []
		this.addToPermissions("auth:*")
		this.addToPermissions("backoffice:*")
		this.addToPermissions("company:index")
		this.addToPermissions("company:list")
		this.addToPermissions("company:subscribedListing")
		this.addToPermissions("company:freeListing")
		this.addToPermissions("company:search")
		this.addToPermissions("project:index")
		this.addToPermissions("project:list")
		this.addToPermissions("project:search")
//		this.addToPermissions("project:enable")
//		this.addToPermissions("project:suspend")
//		this.addToPermissions("project:close")
	}
}
