package kanban

import grails.validation.ValidationException

import java.util.Date;

import org.codehaus.groovy.grails.web.util.WebUtils;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import util.DocumentSerializer;

import grails.converters.JSON;

class CardController {
	
	def cardService
	
	def getLoggedInUserId = {
		def webUtils = WebUtils.retrieveGrailsWebRequest()
		def userId = webUtils?.getHeader("userId")
		userId
	}

	//GET
	def show(String id) {

		def response = new ResponseData(message: message(code:'card.get.failed.msg'),
				code: message(code:'card.get.failed.code'))

		def card = Card.findById(id)
		if (card) {
			response.success = true
			response.data = card.info(getLoggedInUserId())
			response.code = message(code:'card.get.success.code')
			response.message = message(code:'card.cregetate.success.msg')
		}

		render response as JSON
	}

	//POST
    def save() {
		
		def response = new ResponseData(message: message(code:'card.create.failed.msg'),
			code: message(code:'card.create.failed.code'))
		
		def req = request.JSON
		try {
			def card = cardService.create(req.boardId, req.columnId, req.name, req.desc, req.pos, req.dueDate)
			if (card) {
				response.success = true
				response.data = card.info(null)
				response.code = message(code:'card.create.success.code')
				response.message = message(code:'card.create.success.msg')
			}
		}
		catch (ValidationException e){
			e.errors.allErrors.each {
				response.message += message(error: it)
			}
		}
		render response as JSON
	}

	//PUT
	def update(String id) {
		def response = new ResponseData(message: message(code:'card.update.failed.msg'),
			code: message(code:'card.update.failed.code'))
		
		def req = request.JSON
		try {
			def card = cardService.update(id, req.boardId, req.columnId, req.name, req.desc, req.pos, req.dueDate)
			if (card) {
				response.success = true
				response.data = card.info(getLoggedInUserId())
				response.code = message(code:'card.update.success.code')
				response.message = message(code:'card.update.success.msg')
			}
		}
		catch (ValidationException e){
			e.errors.allErrors.each {
				response.message += message(error: it)
			}
		}
		render response as JSON
	}

	//DELETE
	def delete(String id) {
		def response = new ResponseData(message: message(code:'card.delete.failed.msg'),
			code: message(code:'card.delete.failed.code'))
		
		def card = Card.findById(id)
		if (card) {
			//card.delete()
			card.status = Card.CardStatus.DELETED
			if (card.save()) {
				response.success = true
				response.data = id
				response.code = message(code:'card.delete.success.code')
				response.message = message(code:'card.delete.success.msg')
			}
		}
		
		render response as JSON
	}
	
	
	//LABEL actions
	def putLabel(String id) {
		def response = new ResponseData(message: message(code:'card.addlabel.failed.msg'),
			code: message(code:'card.addlabel.failed.code'))
		
		def label = doLabelAction(id, request.JSON?.labelId, true)
		if (label) {
			response.success = true
			response.data = label.info()
			response.code = message(code:'card.addlabel.success.code')
			response.message = message(code:'card.addlabel.success.msg')
		}
		
		render response as JSON
	}
	
	def containsLabel = { card, labelId ->
		card.labels.find{ it.id == labelId }
	}
	
	def removeLabel(String id) {
		
		def response = new ResponseData(message: message(code:'card.removelabel.failed.msg'),
			code: message(code:'card.removelabel.failed.code'))
		
		def card = doLabelAction(id, request.JSON?.labelId, false)
		if (card) {
			response.success = true
			response.data = getLabelsInfo(card.labels)
			response.code = message(code:'card.removelabel.success.code')
			response.message = message(code:'card.removelabel.success.msg')
		}
		
		render response as JSON
	}
	
	def getLabelsInfo = { labels ->
		def _labels = []
		for (label in labels) {
			if (label)
				_labels.add(label.info())
		}
		_labels
	}
	
	def doLabelAction = {cardId, labelId, add ->
		def card = Card.findByIdAndStatus(cardId, Card.CardStatus.ACTIVE)
		if (card) {
			def label = Label.findById(labelId?:"")
			if (label) {
				def persist = false
				if (add && !containsLabel(card, labelId)) { 
					
					card.labels.clear() //to have one label
					
					card.addToLabels(label)
					persist = true
				} else if (!add && containsLabel(card, labelId)) {
					card.removeFromLabels(label)
					persist = true
				}	
				if (persist && card.save()) {
					if (add) return label
					else if (!add) return card
				}
			}
		}
	}
	
	//MEMBER actions
	def assignMember(String id) {
		def response = new ResponseData(message: message(code:'card.assignMember.failed.msg'),
			code: message(code:'card.assignMember.failed.code'))
		
		def card = doMemberAction(id, request.JSON?.memberId, true)
		if (card) {
			response.success = true
			response.data = getCardMembers(card)
			response.code = message(code:'card.assignMember.success.code')
			response.message = message(code:'card.assignMember.success.msg')
		}
		
		render response as JSON
	}
	
	def doMemberAction = { cardId, memberId, add ->
		def card = Card.findByIdAndStatus(cardId, Card.CardStatus.ACTIVE)
		if (card) {
			def member = User.findById(memberId?:"")
			if (member) {
				def card_member = Card_Member.findByCardAndMember(card, member)
				if (add && !card_member) {
					card_member = new Card_Member(card: card, member: member)
					if (card_member.save()) return card
				} else if (!add && card_member) {
					card_member.delete(flush:true)
					return card
				}
			}
		}
	}
	
	def removeMember(String id) {
		
		def response = new ResponseData(message: message(code:'card.removeMember.failed.msg'),
			code: message(code:'card.removeMember.failed.code'))
		
		def card = doMemberAction(id, request.JSON?.memberId, false)
		if (card) {
			response.success = true
			response.data = getCardMembers(card)
			response.code = message(code:'card.removeMember.success.code')
			response.message = message(code:'card.removeMember.success.msg')
		}
		
		render response as JSON
	}
	
	def getCardMembers = { card ->
		def card_members = []
		def c_m = Card_Member.findAllByCard(card)
		c_m.each {
			if (it) card_members.add(it.member.info())
		}
		card_members
	}
	
	//ATTACHMENT actions
	def saveAttachment(String id, String accountId){
		
		def response = new ResponseData(message: message(code:'card.attachmentsave.failed.msg'),
										code: message(code:'card.attachmentsave.failed.code'))
		def ctx = request.getSession().getServletContext()
		def card = Card.findById(id);
		
		if (card) {
			
			if (request instanceof MultipartHttpServletRequest) {
				MultipartHttpServletRequest mpr = (MultipartHttpServletRequest) request;

				def configAssets = grailsApplication.config.grails.staticAssets
				def directory = "cards/${card.id}/${configAssets.attachments.dir}/${UUID.randomUUID()}"
				def path = [
					absolute: "${configAssets.root}/${directory}",
					http: "${configAssets.url}/${directory}",
					relative: "${directory}"
				]

				def sysParams = SystemParameters.first();
				mpr.getFiles("filedata").each { f ->
					DocumentSerializer serializer = new DocumentSerializer(ctx, f, path, sysParams);
					try {
						if(serializer.save()) {
							Attachment att = new Attachment(
								name: serializer.filename,
								size: serializer.size,
								extension: serializer.extension[1..-1],
								relativePath: serializer.getPath(DocumentSerializer.PATH.RELATIVE), //serializer.getPath(false),
								absolutePath: serializer.getPath(DocumentSerializer.PATH.RELATIVE)
							)
							if (att.validate() && att.save()) {
								card.addToAttachments(att)
								if (card.save()) {
									response.success = true
									response.data = att
								} else log.error card.errors
							} else log.error att.errors
						}
					} catch(Exception e) {
						 log.error("[Exception] save : " + e.getMessage())
					}
				}
				response.code = message(code:'card.attachmentsave.success.code')
				response.message = message(code:'card.attachmentsave.success')
			}
		}
		render response as JSON
	}
	
	def removeAttachment(String id) {
		
		def response = new ResponseData(message: message(code:'card.attachmentremove.failed'),
			code: message(code:'card.attachmentremove.failed.code'))
		
		def att = Attachment.findById(request.JSON?.fileId?:"")
		if(att) {
			def card = Card.findById(id)
			if (card) {
				def root = grailsApplication.config.grails.staticAssets.root;
				def absolute = att.absolutePath.contains(root) ? att.absolutePath : "${root}/${att.absolutePath}"
				DocumentSerializer.delete(absolute);

				card.removeFromAttachments(att)
				if (card.save()) {
					att.delete()
					
					response.success = true
					response.code = message(code:'card.attachmentremove.success.code')
					response.message = message(code:'card.attachmentremove.success')
				}
			}
		}
		
		response.data = Card.findById(id).attachments
		
		render response as JSON
	}	
	
	//CARD SUBSCRIPTION
	def subscribe(String id) {
		def response = new ResponseData(message: message(code:'card.subscribe.failed.msg'),
			code: message(code:'card.subscribe.failed.code'))
		
		def userId = getLoggedInUserId()
		
		def subscribed = Card_Member_Subscription.findByCardIdAndUserId(id, userId?:"")
		if (userId && !subscribed) {
			def cm = new Card_Member_Subscription(cardId: id, userId: userId, subscriptionDate: new Date())
			if (cm.validate() && cm.save()) {
				response.success = true
				response.data = cm.info()
				response.code = message(code:'card.subscribe.success.code')
				response.message = message(code:'card.subscribe.success.msg')
			} else log.error cm.errors
		
		}
		
		render response as JSON
	}
	
	def unsubscribe(String id) {
		def response = new ResponseData(message: message(code:'card.unsubscribe.failed.msg'),
			code: message(code:'card.unsubscribe.failed.code'))
		
		def userId = getLoggedInUserId()
		
		def subscribed = Card_Member_Subscription.findByCardIdAndUserId(id, userId?:"")
		if (subscribed) {
			subscribed.delete(flush: true)
			response.success = true
			response.data = id
			response.code = message(code:'card.unsubscribe.success.code')
			response.message = message(code:'card.unsubscribe.success.msg')
		}
		
		render response as JSON
	}
}
