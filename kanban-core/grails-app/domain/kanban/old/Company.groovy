package kanban.old

import kanban.Board
import kanban.Label
import kanban.User

class Company {
	String id
	String name
	String description

	User owner

	Date createdAt
	Date updatedAt
	Boolean sentReminder = false

	CompanyStatus status = CompanyStatus.ACTIVE

	enum CompanyStatus {
		ACTIVE, INACTIVE, PENDING, DELETED
	}

	Integer maxUsers = DEFAULT_MAX_USERS
	final static Integer DEFAULT_MAX_USERS = 5

	static hasMany = [members:User, boards: Board, labels: Label]

	static constraints = {
		name(unique:true, blank: false, nullable: false)
		description(blank: false, nullable: false)
		owner(blank: true, nullable: true)
		createdAt(blank: true, nullable: true)
		updatedAt(blank: true, nullable: true)
		maxUsers(blank: false, nullable: false)
	}

	def beforeValidate() {
		//urlName = this.urlName.replaceAll(" ", "-").toLowerCase()
	}

	def beforeInsert() {
		def date = new Date()
		//subscriptionDate = date
		createdAt = date
		updatedAt = date
	}

	def beforeUpdate() {
		def date = new Date()
		updatedAt = date
	}
	
	static transients = ['expiration']
	Date getExpiration() {
		Date expDate = createdAt + 30
		//if (subscriptionDate) expDate = subscriptionDate + 30
		expDate
	}
}