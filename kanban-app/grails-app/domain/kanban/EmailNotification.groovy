package kanban

import kanban.old.ActivityObject

class EmailNotification {

	ActivityObject target
	ActivityObject board
	TargetAction action
	boolean sent
	Date sendDate
	Date sentDate
	Date createDate
	Date updateDate
		
	static transients = ["TargetAction"]
	
    static constraints = {
		target blank:true, nullable:true
		board blank:true, nullable:true
		action blank:true, nullable:true
		sent blank:true, nullable:true
		sendDate blank:true, nullable: true
		sentDate blank:true, nullable: true
		createDate nullable: true
		updateDate nullable: true
    }
	
	def beforeInsert() {
		createDate = new Date()
	}
	def beforeUpdate() {
		updateDate = new Date()
	}
}

public enum TargetAction {
	DUEDATE
}