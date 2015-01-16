package kanban

class Role {
	String id
	Authority authority
	String description
	
	Date createdAt
	Date updatedAt
	
	enum Authority {
		USER, ADMIN, OWNER
	}
	
	static constraints = {
		authority unique: true
		description (nullable: true, blank: true)
		
		createdAt(blank: true, nullable: true)
		updatedAt(blank: true, nullable: true)
	}
	
	def beforeInsert() {
		createdAt = new Date()
		updatedAt = new Date()
	}

	def beforeUpdate() {
		updatedAt = new Date()
	}
	
	def isOwner() {
		return authority == Authority.OWNER
	}
	
	def isAdmin() {
		return authority == Authority.ADMIN
	}
}
