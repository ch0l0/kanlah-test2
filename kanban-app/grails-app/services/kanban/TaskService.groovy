package kanban

import kanban.old.Task
import org.springframework.transaction.annotation.Transactional;

class TaskService {
	
	def columnService
	def userService

    @Transactional
	def archiveTask(Task task/*, boolean reorder*/) {
		def response = [
			error: -1,
			message: "Task not found."
			]
		if (task) {
			
			def taskList = Task.findAllByColumnAndOrderNoGreaterThan(task.column, -1)
			taskList.each {
				if (it != task && it.orderNo > task.orderNo) {
					it.orderNo = it.orderNo - 1
					it.save()
				}
			}
			
			if (archive(task)) {
				response.error = 0
				response.message = "Task archived."
				
				def board = Board.findById(task.column.board.id)
				response.data = [board: board, task: task]
			}
		} 	
		return response
	}
	
	def archive(Task task) {
		task.orderNo = -1
		task.save()
	}
	
	@Transactional
	def restoreTask(Task task) {
		def response = [
			error: -1,
			message: "Task not found."
			]
		if (task) {
			def taskList = Task.findAllByColumnAndOrderNoGreaterThan(task.column, -1)
			int orderNo = -1
			for (t in taskList) {
				if (t.orderNo > orderNo) orderNo = t.orderNo
			}
			task.orderNo = orderNo + 1
			
			if (task.save()) {
				response.error = 1
				response.message = "Task restored."
				
				def board = Board.findById(task.column.board.id)
				response.data = [board: board, task: task]
			}
		}
		return response
	}

	def pushModified = { v1, v2, v, fieldName, fields ->
		if (v1 != v2) {
			fields.add(fieldName)
		}
		v
	}
	
    def editTask(Task task, params) {
        def response = [
                error: 1,
                message: "Task Update failed."
        ]
        if (task) {
			def fields = [] //keep track of updated/modified task fields
			
			task.name = params.name?pushModified(params.name, task.name, params.name, "Name", fields):task.name
			task.description = params.description?pushModified(params.description, task.description, params.description, "Description", fields):task.description
            task.color = params.color?pushModified(params.color, task.color, params.color, "Color", fields):task.color
            task.label = params.label?pushModified(params.label, task.label?task.label.id:"", Label.findById(params.label), "Label", fields):task.label

            if (params.list("assignedTo[]")) {
				
				def taskAssignees = []
				task.assignedTo.each {
					taskAssignees.add(it.id)
				}
				
				boolean newUser = false
				task.assignedTo.clear()
                params.list("assignedTo[]").each { userId ->
					def user = User.findById(userId)
                    task.addToAssignedTo(user)
					if (!taskAssignees.contains(userId)){
						newUser = true
//						userService.subscribeTask(user, task, false)
						userService.notify(user, task, """You have been assigned to $task.name""")
						userService.sendTaskNotificationEmail(user, task)
					} 
                }
				
				if (newUser || (taskAssignees.size() != task.assignedTo.size())) fields.add("Assigned Users")
                /*task.assignedTo.each {
                    userService.subscribeTask(it, task, false)
					userService.notify(it, task, """You have been assigned to $task.name""")
					userService.sendTaskNotificationEmail(it, task)
                }*/
				
            }else{
				task.assignedTo.clear()
			}
            
			def _dueDate = params.dueDate?:"empty"
			if (_dueDate == "empty") {
				task.dueDate = null
			} else if(params.dueDate) {
				//def _date = new Date().parse("yyyy-MM-dd HH:mm", params.dueDate)
			def _date = new Date().parse("yyyy/MM/dd HH:mm", params.dueDate)
			
				pushModified(_date, task.dueDate, _date, "Due Date", fields)
                task.dueDate =  _date
            }	

            if (task.save()) {
				if(params.dueDate){
					createTaskEmailNotification(task,task.dueDate,TargetAction.DUEDATE)
				}
                response.error = 0
                response.message = "Task updated."
				
				response.fields = fields
                
				def board = Board.findById(task.column.board.id)
                response.data = board //task.column.board
            }
        } else response.message = "Task not found."
        return response
    }

    def moveTask(Task task, params) {
        def response = [
                error: 1,
                message: "Task Move failed."
        ]
        if (task) {

            Column oldColumn = task.column
            boolean fromOtherColumn = false
            if (params.columnId && params.columnId != task.column.id) {
                def column = Column.findById(params.columnId)
                if (column && columnService.addTaskOk(column)) {

                    column.addToTasks(task)
                    fromOtherColumn = true

                    def taskList = Task.findAllByColumnAndOrderNoGreaterThan(oldColumn, -1)
                    taskList.each {
                        if (it.orderNo > task.orderNo) {
                            it.orderNo = it.orderNo -1
                            it.save()
                        }
                    }
                }
            }

            int newOrderNo = (params.int("orderNo")!=null)?params.int("orderNo"):-1
            if (newOrderNo > -1) {
                if (newOrderNo > task.column.maxTasks - 1) newOrderNo = task.column.maxTasks - 1

                def taskList = Task.findAllByColumnAndOrderNoGreaterThan(task.column, -1)
                for (t in taskList) {
                    if (t != task) {
                        if (!fromOtherColumn) {
                            if (newOrderNo < task.orderNo) {
                                if (t.orderNo >= newOrderNo && t.orderNo < task.orderNo)
                                    t.orderNo = t.orderNo + 1
                            } else if (newOrderNo > task.orderNo) {
                                if (t.orderNo <= newOrderNo && t.orderNo > task.orderNo)
                                    t.orderNo = t.orderNo - 1
                            }
                        } else {
                            if (newOrderNo <= t.orderNo)
                                t.orderNo = t.orderNo + 1
                        }
                    }
                }
                for (t in taskList)
                    if (t != task) t.save()
            }
            task.orderNo = (newOrderNo > -1)?newOrderNo:task.orderNo

            if (task.save()) {
                response.error = 0
                response.message = "Task moved."

                def board = Board.findById(task.column.board.id)
                response.data = board
				
				//response.data = task 
            }
        } else response.message = "Task not found."
        return response
    }
	def createTaskEmailNotification(target, sendDate, action){
		def notification = EmailNotification.findByTarget(target)
		if(notification){
			if(notification.sendDate != sendDate){
				notification.sendDate = sendDate
				notification.sent = false
			}
		}else{
			notification = new EmailNotification(
				target : target,
				sendDate: sendDate,
				action: action
			)
		}
		notification.save()
	}
	
	def unassignFromAllTasks(board, user){
		board.columns.each{ column ->
			column.tasks.each{ task ->
				task.assignedTo.remove(user)
				task.save(flush:true)
			}
		}
	}
}
