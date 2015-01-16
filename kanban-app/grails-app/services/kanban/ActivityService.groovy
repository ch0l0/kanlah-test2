package kanban

import enums.ActivityAction
import enums.ActivityType
import org.codehaus.groovy.grails.web.util.WebUtils
import org.springframework.transaction.annotation.Transactional

class ActivityService {

	def notificationService
	
	@Transactional
	def list(board, params){
		def list = Activity.list(sort: params?.sort, order: params?.order, offset: params?.offset, max: params?.limit).findAll{ it.board.id.equals(board.id)}
		list.collect {
			[
					actor: [id:it.actor.id,useAvatar: it.actor.useAvatar,avatar:it.actor.avatar,fullname:it.actor.fullname],
					action: it.action.name(),
					type: it.type.name(),
					field: it.recordField,
					recordId: it.recordId,
					name: (it.type.equals(ActivityType.CARD)) ? Card.findById(it.recordId).name : Column.findById(it.recordId).title,
					time: it.activityDate.format("yyyy-MM-dd'T'HH:mm:ss.SSSS'Z'"),
					board: it.board.id,
					boardTitle: it.board.title
			]
		}
	}
	
	def total(board){
		def list = Activity.list().findAll{ it.board.id.equals(board.id)}
		list.size();
	}

	@Transactional
	def last(board, lastTime){
		def list = Activity.list(sort: "activityDate", order: "desc").findAll(){
			it.board.id.equals(board.id) && it.activityDate > lastTime
		}
		list.collect {
			[
					actor: [id:it.actor.id,useAvatar: it.actor.useAvatar,avatar:it.actor.avatar,fullname:it.actor.fullname],
					action: it.action.name(),
					type: it.type.name(),
					field: it.recordField,
					recordId: it.recordId,
					name: (it.type.equals(ActivityType.CARD)) ? Card.findById(it.recordId).name : Column.findById(it.recordId).title,
					time: it.activityDate.format("yyyy-MM-dd'T'HH:mm:ss.SSSS'Z'"),
					board: it.board.id,
					boardTitle: it.board.title
			]
		}
	}

	@Transactional
	def log(controllerName, actionName){
		def webUtils = WebUtils.retrieveGrailsWebRequest()
		def req = webUtils.request.JSON
		def currentUser = webUtils.request.currentUser

		def actor
		def board
		def recordId = webUtils.params.get('id')
		def type = ActivityType.COLUMN

		def loggedActivities = [
				[controller: 'card', action: 'save,update,delete'],
				[controller: 'column', action: 'save,update,delete'],
				[controller: 'board', action: 'delete'],
		]

		def needsLog = loggedActivities.find {
			(it.controller == controllerName) &&
					((it.action == '*') || (it.action.contains(actionName)))
		}

		if(needsLog){
			def domainObject
			def isMoved

			actor = User.findById(currentUser.id)
			board = Board.findById(controllerName=='board' ? webUtils?.parameterMap['id'] : req.boardId)
			
			if(controllerName=='column') type = ActivityType.COLUMN
			if(controllerName=='card') type = ActivityType.CARD
			if(controllerName=='board') type = ActivityType.BOARD

			if(actionName == "save"){
				if(controllerName=='column') domainObject = Column.findByTitleAndPos(req.title,req.pos)
				if(controllerName=='card') domainObject = Card.findByNameAndPos(req.name,req.pos)
			}
			else {
				if(controllerName=='column') domainObject = Column.findById(recordId)
				if(controllerName=='card') domainObject = Card.findById(recordId)
				if(controllerName=='board') domainObject = Board.findById(recordId)
			}

			if(domainObject){
				
				def activity 
				
				board = board?: Board.findById(domainObject.boardId)
				if(actionName == "save"){
					recordId = domainObject.id
					activity = add(board, actor, ActivityAction.CREATED, type, recordId, null)
				}
				if(actionName == "update"){
					isMoved = req?.pos

					if(type == ActivityType.CARD){
						isMoved = !req?.name
					}

					if(isMoved)
						activity = add(board, actor, ActivityAction.MOVED, type, recordId, null)
					else
						activity = add(board, actor, ActivityAction.UPDATED, type, recordId, null)
				}
				if(actionName == "delete"){
					if(controllerName=='board') activity = add(board, actor, ActivityAction.DELETED, type, recordId, board.title)
					else activity = add(board, actor, ActivityAction.DELETED, type, recordId, "*")
				}
				
				//NOTIFICATIONS
				logNotifications(activity, type, actor, domainObject)
			}

		}

		null
	}
	
	def logNotifications = { activity, type, actor, domainObject ->
		if (activity) {
			def userList = []
			
			if (type == ActivityType.CARD) {
				//get list of assigned users
				def cmList = Card_Member.findAllByCardAndMemberNotEquals(domainObject, actor)
				for (cm in cmList) {
					if (cm) userList.add(cm.member?.id)
				}
				//get card subscribers
				def sList = Card_Member_Subscription.findAllByCardIdAndUserIdNotEquals(domainObject.id, actor.id)
				for (s in sList) {
					if (s && !userList.contains(s.userId)) userList.add(s.userId)
				}
			} else if (type == ActivityType.COLUMN) { //COLUMN
				//get column subscribers
				def sList = Column_Member.findAllByColumnIdAndUserIdNotEquals(domainObject.id, actor.id)
				for (s in sList) {
					if (s) userList.add(s.userId)
				}
			} else if (type == ActivityType.BOARD) { //BOARD
				//get column subscribers
				def sList = Board_Member.findAllByBoard(domainObject)
				for (s in sList) {
					if (s) userList.add(s.member.id)
				}
			}
			
			for (uid in userList) {
				
				def user = User.findById(uid?:"")
				if (user) notificationService.log(user, activity)
			}
		}
	}

	@Transactional
	def add(board, actor, action, type, recordId, recordField){
		def activity = new Activity()
			activity.board = board
			activity.actor = actor
			activity.action = action
			activity.type = type
			activity.recordId = recordId
			activity.recordField = recordField
		if(!(activity.save() && activity.validate())){
			activity.errors.allErrors.each {
				log.error ("Err:" + it)
			}
		}
		else {
			log.debug("Activity.add: ${action}, ${type}, ${recordId}")
		}
		activity
	}

}
