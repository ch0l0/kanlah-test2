package kanban

import enums.ActivityType

class Subscription {

	ActivityType type
	Integer rowId
	User user
	Date subscriptionDate

	static constraints = {
		type(blank: false, nullable: false)
		rowId(blank: false, nullable: false)
		user(blank: false, nullable: false)
		subscriptionDate(blank: true, nullable: true)
	}

	def beforeInsert() {
		subscriptionDate = new Date()
	}
}
