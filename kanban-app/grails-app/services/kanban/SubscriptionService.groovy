package kanban

import enums.ActivityType
import org.springframework.transaction.annotation.Transactional

class SubscriptionService {

	def listByUser(userId, boardId) {
		//
		def userSubscriptions = new ArrayList()

		def cardSubscriptions = Card_Member_Subscription.findByUserId(userId)
		def columnSubscriptions = Column_Member.findByUserId(userId)

		userSubscriptions.addAll(cardSubscriptions.collect { it->
			[
					activityType: ActivityType.CARD,
					activityTypeId: it.cardId,
					subscriptionDate: it.subscriptionDate
			]
		})
		userSubscriptions.addAll(columnSubscriptions.collect { it->
			[
					activityType: ActivityType.COLUMN,
					activityTypeId: it.columnId,
					subscriptionDate: it.subscriptionDate
			]
		})

		userSubscriptions
	}

	@Transactional
	def create(){
		def subs = new Subscription()
	}
}
