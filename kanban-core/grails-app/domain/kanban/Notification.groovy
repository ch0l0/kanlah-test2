package kanban

import enums.ActivityType;

class Notification {
	
	String id
	String userId
	NotificationStatus status = NotificationStatus.NEW
	Date createdDate = new Date()
	Date updateDate
	String activityId

	static enum NotificationStatus {
		NEW,
		READ
	}
	
    static constraints = {
		updateDate blank:true, nullable:true
    }
	
	def beforeInsert() {
		def date = new Date()
		updateDate = date
	}
	
	def beforeUpdate() {
		def date = new Date()
		updateDate = date
	}
	
	def info() {
		[id: this.id,
		//userId: this.userId,
		status: this.status.name(),
		createdDate: this.createdDate,
		updateDate: this.updateDate,
		//activityId: this.activityId,
		//display: getActivityDisplay(this.activityId)
		activity: getActivity(this.activityId)
		]
	}
	
	def getActivityDisplay = { activityId ->
		def activity = Activity.findById(activityId)
		activity?.display()
	}
	
	def getActivity = { activityId ->
		def activity = Activity.findById(activityId)
		activity?.collect {
			[
					actor: [id:it.actor.id, useAvatar: it.actor.useAvatar, avatar:it.actor.avatar,fullname:it.actor.fullname],
					action: it.action.name(),
					type: it.type.name(),
					field: it.recordField,
					name: ((it.type.equals(ActivityType.CARD)) ? Card.findById(it.recordId).name : Column.findById(it.recordId)?.title),
					time: it.activityDate.format("yyyy-MM-dd'T'HH:mm:ss.SSSS'Z'"),
					board: it.board.id,
					boardTitle: it.board.title
			]
		}[0]
	}
}
