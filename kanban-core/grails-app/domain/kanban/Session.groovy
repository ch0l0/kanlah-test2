package kanban

class Session {

	String userId
	String sessionId
	Date dateSignIn
	Date lastActivity
	Date dateSignOut

	static constraints = {
		userId(blank: false, nullable: false)
		sessionId(blank: false, nullable: false)
		dateSignIn(blank: true, nullable: true)
		lastActivity(blank: true, nullable: true)
		dateSignOut(blank: true, nullable: true)
	}

	def beforeInsert() {
		def date = new Date()
		dateSignIn = date
		lastActivity = date
	}
}
