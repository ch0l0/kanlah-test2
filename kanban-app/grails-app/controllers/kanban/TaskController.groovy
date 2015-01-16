package kanban

import grails.converters.JSON
import kanban.old.Task;
import org.springframework.web.multipart.MultipartHttpServletRequest
import util.DocumentSerializer

class TaskController {

    def taskService
	def activityService
	def userService

	def read(String id, params) {
		def task = Task.findById(id)
        def label
        if(task.label)
        label = Label.findById(task.label.id)
		def user = User.findById(params.userId)
        def response = [
                id: task.id,
                name: task.name,
                description: task.description,
                attachments: task.attachments,
                assignedTo: task.assignedTo,
                label: label
				,subscribers: task.subscribers
				,subscribed: isSubscribed(task, user)
        ]

        if (task.dueDate)
        response.dueDate = task.dueDate ? task.dueDate.format("yyyy-MM-dd HH:mm:ss") : ''

        JSON.use('deep')
		render response as JSON
	}
	
	def isSubscribed(task, user) {
		return task.subscribers.contains(user)
	}

	def delete(String id) {
		def task = Task.findById(id)
		def r
		def actor = User.findById(params.userId?:"")
		if (task && task.orderNo >= 0) {
			r = taskService.archiveTask(task)
//			activityService.archiveLog(actor, task, task.column.board, true)
		} else {
			r = taskService.restoreTask(task)
//			activityService.restoreLog(actor, task, task.column.board, true)
		}	
		
		JSON.use('deep')
		render r as JSON
	}

    def update(String id) {
		def task = Task.findById(id)
		def resp = taskService.editTask(task, params)
		
		if (resp.fields && resp.fields.size() > 0) {
			String fields = ""
			resp.fields.each {
				fields = (fields.trim()==""?fields:fields + ", ") + it
			}
			
			def actor = User.findById(params.userId?:"")
//			def activity = activityService.updateLog(actor, task, fields, task.column.board, true)
		}	
		JSON.use('deep')
		render resp as JSON
	}

    def move(String id) {
        def task = Task.findById(id)
        def oldColumn = task.column
		
		def resp = taskService.moveTask(task, params)
		def newColumn = task.column
		
//		if (oldColumn.id != newColumn.id) {
//			def actor = User.findById(params.userId?:"")
//			def activity = activityService.moveLog(actor, task, oldColumn, newColumn, newColumn.board, true)
//		}
		
		JSON.use('deep')
        render resp as JSON
    }
	
	def restore(String id) {
		def task = Task.findById(id)
		def resp = taskService.restoreTask(task)
		
		def actor = User.findById(params.userId?:"")
//		activityService.restoreLog(actor, task, task.column.board, true)
		
		render resp as JSON
	}
	
	def getArchivedTasks() {
		def taskList = Task.findAllByOrderNoGreaterThan(-1)
		render taskList as JSON
	}
	
	def saveAttachment(){
		def response = new ResponseData(message: message(code:'task.attachmentsave.failed'),
										code: message(code:'task.imagesave.failed.code'))
		def ctx = request.getSession().getServletContext()
		def task = Task.findById(params.taskId);
		
		if(task){
			 if(request instanceof MultipartHttpServletRequest) {
				 MultipartHttpServletRequest mpr = (MultipartHttpServletRequest)request;
				 
				 def userInstance = User.findById(params.userId);
				 def company = UserRole.findByUser(userInstance).company
				 def rootPath = "${grailsApplication.config.grails.directory.root}/${company.id}/tasks/${task.id}"
				 def path = "${rootPath}/${grailsApplication.config.grails.directory.attachments}/${UUID.randomUUID()}/"
				 
				 mpr.getFiles("filedata").each { f ->
					 DocumentSerializer serializer = new DocumentSerializer(ctx, f, path);
					 try{
						if(serializer.save()){
							Attachment att = new Attachment(
								name: serializer.filename,
								size: serializer.size,
								extension: serializer.extension[1..-1],
								relativePath: serializer.getPath(false),
								absolutePath: serializer.getPath(true)
							)
							task.addToAttachments(att)
							if(task.save()){
								response.success = true
								response.data = att
								def user = User.findById(params.userId)
//								def activity = activityService.updateLog(user, task, "Attachment", task.column.board, true)
							}
						}
					 }catch(Exception e){
						 log.error("[Exception] save : " + e.getMessage())
					 }
				 }				 
				 response.code = message(code:'task.attachmentsave.success.code')
				 response.message = message(code:'task.attachmentsave.success')
			}
		}
		render response as JSON
	}
	
	def deleteAttachment(){
		JSON.use('deep')
		def att = Attachment.findById(params.fileId)
		if(att){
			DocumentSerializer.delete(att.absolutePath);
			def task = Task.findById(params.taskId)
			if (task) {
				task.removeFromAttachments(att)
				if (task.save())
					att.delete()
			}
		}
		def response = [attachments: Task.findById(params.taskId).attachments]
		render response as JSON
	}

}
