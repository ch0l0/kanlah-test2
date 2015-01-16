package kanban

import kanban.old.Task
import org.apache.commons.logging.LogFactory

class EmailNotificationJob {
    /*static triggers = {
      simple repeatInterval: 15 * (60 * 1000) + 1, repeatCount: -1 // execute job once in 15 min
    }*/
	def userService
	private static final log = LogFactory.getLog(this)
	
	static triggers = {
		simple "EmailNotification", repeatInterval: 60000, repeatCount: -1
	  }
  
    def execute() {
		try{
			def notifications = EmailNotification.findAllBySentAndSendDateLessThan(false, new Date())
			def notificationlist = []
			def notifiedlist = []
			notifications.each { n -> 
				if(n.action == TargetAction.DUEDATE){
					def task = Task.findById(n.target.id)
					if(task){
						notifiedlist.push(n.id)
						//Board Admin
						task.column.board.owners.each { user ->
							userService.sendTaskDateDueEmail(user,task)
							//userService.notify(user, task, """Task ${task.name} was due on ${task.dueDate}""")
							notificationlist.push([user:user, task:task])
						}
						
						//Assignees
		                task.assignedTo.each { user ->
							userService.sendTaskDateDueEmail(user,task)
							//userService.notify(user, task, """Task ${task.name} was due on ${task.dueDate}""")
							notificationlist.push([user:user, task:task])
						}
					}
				}
			}
			batchDBNotification(notificationlist)
			batchDBUpdate(notifiedlist)

		}catch(Exception e){
			log.error e.stackTrace
		}
    }
	
	def batchDBNotification(nlist){
		Notification.withTransaction { t ->
			nlist.each{ it ->
				userService.notify(it.user, it.task, """Task ${it.task.name} was due on ${it.task.dueDate}""")
			}
		}
	}
	def batchDBUpdate(nlist){
		EmailNotification.withTransaction { t ->
			nlist.each{ it ->
				def tmp = EmailNotification.findById(it)
				if(tmp){
					tmp.sent = true
					tmp.sentDate = new Date()
					if(tmp.validate() && tmp.save()){}
					else log.error tmp.errors
				}
			}
		}
	}
}
