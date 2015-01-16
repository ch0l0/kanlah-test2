package kanban

import enums.ActivityAction
import enums.ActivityType

class Activity {

	String id
	Board board
	User actor
	ActivityAction action
	//ActivityDone action
	ActivityType type
	String recordId
	String recordField
	Date activityDate

	static constraints = {
		board nullable: false, blank: false
		actor nullable: false, blank: false
		action nullable: false, blank: false
		type nullable: false, blank: false
		recordId nullable: false, blank: false
		recordField nullable: true, blank: true
		activityDate nullable: true, blank: true
	}

	def beforeInsert() {
		activityDate = new Date()
	}

	def display(){
		if(recordField)
			"${actor.fullname} $action ${type.name()} ${recordField} of ${getTargetName()}"
		else
			"${actor.fullname} $action ${type.name()} ${getTargetName()} "
	}

	String getTargetName() {
		def targetName = ""
		def targetDomain
		if(ActivityType.CARD){
			targetDomain = Card.findById(this.recordId)
			targetName=targetDomain?.name
		}
		if(ActivityType.COLUMN){
			targetDomain = Column.findById(this.recordId)
			targetName=targetDomain?.title
		}
		if(ActivityType.BOARD){
			targetDomain = Board.findById(this.recordId)
			targetName=targetDomain?.title
		}
		return targetName
	}
}
