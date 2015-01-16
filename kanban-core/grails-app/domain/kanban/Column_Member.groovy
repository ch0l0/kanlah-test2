package kanban

import java.text.SimpleDateFormat;

//Column Subscription
class Column_Member {
	
	String columnId
	String userId
	Date subscriptionDate

	def info() {
		[columnId: this.columnId,
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
