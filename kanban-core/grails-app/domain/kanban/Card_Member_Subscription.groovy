package kanban

import java.text.SimpleDateFormat;
import java.util.Date;

class Card_Member_Subscription {

    String cardId
	String userId
	Date subscriptionDate

	def info() {
		[cardId: this.cardId,
		userId: this.userId,
		subscriptionDate: formatDate(this.subscriptionDate)?:""
		]
	}
	
	def formatDate = { date ->
		if (date) {
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm")
			def d = sdf.format(date)
			return d
		}
	}
}
