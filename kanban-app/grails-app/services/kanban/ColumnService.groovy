package kanban

import grails.validation.ValidationException
import kanban.old.Task
import org.springframework.transaction.annotation.Transactional;

class ColumnService {
	
	@Transactional
    def createColumn(Board board, params) {
		def response = [
			error: 1,
			message: "Column Create failed."
			]
		if (board) {
			if (board.columns?(/*board.columns.size()*/activeColumnCount(board) < Board.MAX_COLS):true) {
				def column = new Column(params)
				column.id = null
				board.addToColumns(column)
				if (board.save(flush:true)) {
					response.error = 0
					response.message = "Column created."
					
					response.target = column
					
				} else log.error board.errors
			} else response.message = "Board MAX columns reached."
			response.data = board
		} else response.message = "Board not found."
		return response
    }
	
	def activeColumnCount = { board ->
		int count = 0
		for (column in board.columns) 
			if (column.orderNo > -1) count = count + 1
		
		count
	}
	
	@Transactional
	def updateColumn(Column column, params) {
		def response = [
			error: 1,
			message: "Column Update failed."
			]
		def fields = []
		if (column) {
			column.name = params.name?pushModified(params.name, column.name, params.name, "Name", fields):column.name
			
			int newOrderNo = (params.int("orderNo")!=null)?params.int("orderNo"):-1
			if (newOrderNo > -1) {
				if (newOrderNo > (Board.MAX_COLS - 1)) newOrderNo = Board.MAX_COLS - 1
				
				def colList = Column.findAllByBoardAndOrderNoGreaterThan(column.board, -1)
				for (c in colList) 
					if (c != column) {
						if (newOrderNo < column.orderNo) {
							if (c.orderNo >= newOrderNo && c.orderNo < column.orderNo) 
								c.orderNo = c.orderNo + 1
							
						} else if (newOrderNo > column.orderNo) {
							if (c.orderNo <= newOrderNo && c.orderNo > column.orderNo) 
								c.orderNo = c.orderNo - 1
							
						}
					}
				
				for (c in colList)
					if (c != column) c.save()
				
				
			}
			//column.orderNo = (newOrderNo > -1)?newOrderNo:column.orderNo
			//column.description = params.description?:column.description
			//column.color = params.color?:column.color
			//column.maxTasks = (params.int("maxTasks")!=null)?params.int("maxTasks"):column.maxTasks
			
			column.orderNo = (newOrderNo > -1)?pushModified(newOrderNo, column.orderNo, newOrderNo, "Order", fields):column.orderNo
			column.description = params.description?pushModified(params.description, column.description, params.description, "Description", fields):column.description
			column.color = params.color?pushModified(params.color, column.color, params.color, "Color", fields):column.color
			column.maxTasks = (params.int("maxTasks")!=null)?pushModified(params.int("maxTasks"), column.maxTasks, params.int("maxTasks"), "MaxCards", fields):column.maxTasks
			
			if (column.save()) {
				response.error = 0
				response.message = "Column updated."
				response.fields = fields
				
				def board = Board.findById(column.board.id)
				response.data = board
			}
		} else response.message = "Column not found."
		return response 
	}
	
	@Transactional
	def archiveColumn(Column column) {
		def response = [
			error: 1,
			message: "Column not found."
			]
		if (column) {
			
			def colList = Column.findAllByBoardAndOrderNoGreaterThan(column.board, -1)
			colList.each {
				if (it != column && it.orderNo > column.orderNo) {
					it.orderNo = it.orderNo - 1
					it.save()
				}
			}
			
			column.orderNo = -1
			
			/*
			 * TODO: archive tasks ?
			 */
			
			if (column.save()) {
				response.error = 0
				response.message = "Column archived."
				
				def board = Board.findById(column.board.id)
				response.data = board
			}
		} 	
		return response
	}
	
	@Transactional
	def restoreColumn(Column column) {
		def response = [
			error: -1,
			message: "Column not found."
			]
		if (column) {
			def columnList = Column.findAllByBoardAndOrderNoGreaterThan(column.board, -1)
			int orderNo = -1
			for (c in columnList) {
				if (c.orderNo > orderNo) orderNo = c.orderNo
			}
			if (orderNo + 1 >= Board.MAX_COLS) {
				response.error = 1
				response.message = "Board full."
			} else {
				column.orderNo = orderNo + 1
				if (column.save()) {
					def board = Board.findById(column.board.id)
					response.data = board

					response.error = 0
					response.message = "Column restored."
				}
			}
		}
		return response
	}
	
	@Transactional
	def addTask(Column column, Task task) {
		def response = [
			error: 1,
			message: "Task not added."
			]
		if (column) {
			if (column.tasks?addTaskOk(column):true) {

				column.addToTasks(task)
				if (column.validate() && column.save(flush: true)) {
					response.error = 0
					response.message = "Task added."
					
					response.taskId = task.id
					
				} else log.error column.errors
			} else response.message = "Max Tasks reached."
			
			def board = Board.findById(column.board.id)
			response.data = board
		} 
		return response
	}

	def addTaskOk(Column column) {
		//return activeTaskCount(column) < column.maxTasks
		return true
	}
	
	def activeTaskCount = { column ->
		int count = 0
		for (task in column.tasks)
			if (task.orderNo > -1) count = count + 1
		
		count
	}
	
	def pushModified = { v1, v2, v, fieldName, fields ->
		if (v1 != v2) {
			fields.add(fieldName)
		}
		v
	}
	
	@Transactional
	def create(boardId, title, color, max, pos) {
		def column
		def board = Board.findById(boardId?:"")
		if (board) {
			column = new Column(
							title: title?:"",
							color: color?:"",
							max: max?:Column.DEFAULT_MAXTASKS,
							pos: pos?:0,
							boardId: boardId?:""
							)
			if (column.validate() && column.save()) {
				board.addToColumns(column)
				if (!board.save()) {
					board.errors.allErrors.each {
						log.error("Err:" + it)
					}
				}	 
			} else {
				column.errors.allErrors.each {
					log.error("Err:" + it)
				}
				throw new ValidationException("Foo is not Valid",column.errors)
			}
		} else log.error "Board not found."
		column
	}

	@Transactional
	def update(columnId, title, color, max, pos, status) {
		def column = Column.findById(columnId?:"")
		if (column) {
			column.title = title?:column.title
			column.color = color?:column.color
			column.max = max?:column.max
			column.pos = pos?:column.pos
			if(status) {
				column.status = Column.ColumnStatus.valueOf(status)?:column.status
			}
			if (!(column.validate() && column.save())) {
				column.errors.allErrors.each {
					log.error("Err:" + it)
				}
				throw new ValidationException("Foo is not Valid",column.errors)
			}
		}
		column
	}

	@Transactional
	def delete(columnId) {
		def column = Column.findById(columnId?:"")
		if (column) {
			column.status = Column.ColumnStatus.DELETED
			if (!(column.validate() && column.save())) {
				column.errors.allErrors.each {
					log.error("Err:" + it)
				}
			}
		}
		column
	}
}
