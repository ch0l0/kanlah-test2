package kanban

import grails.validation.ValidationException
import org.codehaus.groovy.grails.web.util.WebUtils;
import grails.converters.JSON

class BoardController {
	
	def boardService
	
	//GET
	def show(String id) {
		render getBoard(Board.findById(id)?.info()) as JSON
	}

	def expand(String id) {
		
		def webUtils = WebUtils.retrieveGrailsWebRequest()
		def userId = webUtils?.getHeader("userId")
		
		render getBoard(Board.findById(id)?.infoExpand(userId)) as JSON
	}

	def settings(String id) {
		render getBoard(Board.findById(id)?.settings()) as JSON
	}
	
	def getBoard = { board ->
		def response = new ResponseData(message: message(code:'board.get.failed.msg'),
			code: message(code:'board.get.failed.code'))

		if (board) {
			response.data = board
			response.success = true
			response.message = message(code:'board.get.success.msg')
			response.code = message(code:'board.get.success.code')
		}
		
		response
	}
	
	//PUT
	def update(String id) {
		def response = new ResponseData(message: message(code:'board.update.failed.msg'),
				code: message(code:'board.update.failed.code'))

		def req = request.JSON
		try {
			def board = boardService.updateBoard(id, req.accountId, req.title, req.description, req.status, req.columns)
			if (board) {
				response.data = board.info() //retBoardData(board) //board
				response.success = true
				response.message = message(code:'board.update.success.msg')
				response.code = message(code:'board.update.success.code')
			}
		}
		catch (ValidationException e){
			e.errors.allErrors.each {
				response.message += message(error: it)
			}
		}

		render response as JSON
	}

	//POST
	def save() {
		def response = new ResponseData(message: message(code:'board.create.failed.msg'),
				code: message(code:'board.create.failed.code'))

		def req = request.JSON
		try {
			def board = boardService.createBoard(req.accountId, req.title, req.description, req.columns)
			if (board) {
				response.data = board.info() //retBoardData(board) //board
				response.success = true
				response.message = message(code:'board.create.success.msg')
				response.code = message(code:'board.create.success.code')
			}

		}catch (ValidationException e){
			e.errors.allErrors.each {
				response.message += message(error: it)
			}
		}

		render response as JSON
	}

	//DELETE
	def delete(String id) {
		def response = new ResponseData(message: message(code:'board.delete.failed.msg'),
				code: message(code:'board.delete.failed.code'))
		def req = request.JSON

		def board = boardService.deleteBoard(id)
		if (board) {
			response.data = board.info()
			response.success = true
			response.message = message(code:'board.delete.success.msg')
			response.code = message(code:'board.delete.success.code')
		}
		render response as JSON
	}
}
