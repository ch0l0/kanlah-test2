package kanban.bo

import java.text.SimpleDateFormat;

import kanban.User;

class StatisticsController {
	
	def index() {
		redirect (action: "list")
	}

    def list() {
		
		def currentDate = new Date()
		
		def sDate = setStartDate(params.startDate?:currentDate)
		def eDate = setEndDate(params.endDate?:currentDate)
		
		flash.message = null
		if (eDate.before(sDate)) {
			flash.message = "Please check date range."
		}
		 
		render (view: "list",
			model: [totalRegistered: getTotalRegistered(sDate, eDate),
				totalVerified: getTotalVerified(sDate, eDate),
				totalSuspended: getTotalSuspended(sDate, eDate),
				totalClosed: getTotalClosed(sDate, eDate),
				startDate: sDate, endDate: eDate]
			)
	}
	
	def setStartDate = { date ->
		def temp = Calendar.instance
		temp.setTime(date)
		temp.set(Calendar.HOUR_OF_DAY, 0)
		temp.set(Calendar.MINUTE, 0)
		temp.set(Calendar.SECOND, 0)
		temp.time
	}
	
	def setEndDate = { date ->
		def temp = Calendar.instance
		temp.setTime(date)
		temp.set(Calendar.HOUR_OF_DAY, 23)
		temp.set(Calendar.MINUTE, 59)
		temp.set(Calendar.SECOND, 59)
		temp.time
	}
	
	def getTotalRegistered = { startDate, endDate ->
		def list = User.findAllByCreatedAtBetween(startDate, endDate)
		list?list.size():0
	}
	
	def getTotalVerified = { startDate, endDate ->
		def list = User.findAllByVerifiedDateBetween(startDate, endDate)
		list?list.size():0
	}
	
	def getTotalSuspended = { startDate, endDate ->
		def list = User.findAllBySuspendedDateBetween(startDate, endDate)
		list?list.size():0
	}
	
	def getTotalClosed = { startDate, endDate ->
		def list = User.findAllByClosedDateBetween(startDate, endDate)
		list?list.size():0
	}
	
	
}
