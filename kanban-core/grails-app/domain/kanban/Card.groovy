package kanban

import java.text.SimpleDateFormat;

class Card {

    String id
	String boardId
	String columnId
	String name
	String desc
	Integer pos
	Date dueDate
	CardStatus status = CardStatus.ACTIVE
	
	static hasMany = [labels: Label, attachments: Attachment]
	
	static enum CardStatus {
		ACTIVE, DELETED, ARCHIVED
	}
	
	static constraints = {
		desc blank:true, nullable:true, size: 2..100
		dueDate blank:true, nullable: true
	}
	
	def info(userId) {
		[id: this.id,
		name: this.name,
		desc: this.desc,
		pos: this.pos,
		dueDate: formatDate(this.dueDate)?:"",
		boardId: this.boardId,
		columnId: this.columnId,
		status: this.status.name(),
		labels: getLabels(this.labels)
		,attachments: getAttachments(this.attachments)?:[]
		,subscribed: userId?isSubscribed(this.id, userId):false
		,assignedUsers: getAssignedUsers(this)?:[]
		]
	}
	
	def formatDate = { date ->
		if (date) {
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm")
			def d = sdf.format(date)
			return d
		}
	}
	
	def getLabels = { cardLabels ->
		def _labels = []
		for (label in cardLabels) {
			if (label)
				_labels.add(label.info())
		}
		_labels
	}
	
	def getAttachments = { attachments ->
		def _attachments = []
		for (attachment in attachments) {
			if (attachment)
				_attachments.add(attachment.info())
		}
		_attachments
	}
	
	def isSubscribed = { cardId, userId ->
		def subscribed = Card_Member_Subscription.findByCardIdAndUserId(cardId, userId?:"")
		return subscribed?true:false
	}
	
	def getAssignedUsers = { card ->
		def _assignedUsers = []
		def assignedUsers = Card_Member.findAllByCard(card)
		if (assignedUsers) {
			for (au in assignedUsers) {
				if (au) _assignedUsers.add(au.member.info())
			}
		}
		_assignedUsers
	}
}
