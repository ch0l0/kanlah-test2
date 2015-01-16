package kanban

import exceptions.RecordExistException
import grails.converters.JSON

class BoardMemberController {

	def boardService

	//GET
	def show(String id) {
		def response = new ResponseData(message: message(code:'board.member.get.failed.msg'),
										code: message(code:'board.member.get.failed.code'))
		def board = Board.findById(id)
		def members
		if(board){
			members = boardService.listBoardMember(board)
			response.data = members
			response.success = true
			response.message = message(code:'board.member.get.success.msg')
			response.code = message(code:'board.member.get.success.code')
		}
		render response as JSON
	}

	//POST
	def save(String id) {
		def response = new ResponseData(message: message(code:'board.member.create.failed.msg'),
				code: message(code:'board.member.create.failed.code'))

		def req = request.JSON

		def member = User.findById(req.memberId?:"530ae25ce4b6e2d57f3342ea")
		def board = Board.findById(id)
		def role = req.role?:"MEMBER"
		try {
			def boardMember = boardService.createBoardMember(board, member, role)
			if (boardMember) {
				response.data = boardMember //retBoardData(board) //board
				response.success = true
				response.message = message(code:'board.member.create.success.msg')
				response.code = message(code:'board.member.create.success.code')
			}
		}
		catch (Exception e){
			if(e.cause.toString().equals(RecordExistException.canonicalName)){
				response.message = message(code:'board.member.create.exist.msg')
				response.code = message(code:'board.member.create.exist.code')
			}
		}

		render response as JSON
	}

	//PUT
	def update(String id) {
		def response = new ResponseData(message: message(code:'board.member.update.failed.msg'),
				code: message(code:'board.member.update.failed.code'))

		def req = request.JSON

		def member = User.findById(req.memberId?:"530ae25ce4b6e2d57f3342ea")
		def board = Board.findById(id)
		def role = req.role?:"ADMIN"
		try {
			def boardMember = boardService.updateBoardMember(board, member, role)
			if (boardMember) {
				response.data = boardMember //retBoardData(board) //board
				response.success = true
				response.message = message(code:'board.member.update.success.msg')
				response.code = message(code:'board.member.update.success.code')
			}
		}
		catch (Exception e){
			response.message = message(code:'board.member.update.failed.msg')
			response.code = message(code:'board.member.update.failed.code')
		}
		render response as JSON
	}

	//DELETE
	def delete(String id) {
		def response = new ResponseData(message: message(code:'board.member.delete.failed.msg'),
				code: message(code:'board.member.delete.failed.code'))
		def req = request.JSON

		def member = User.findById(req.memberId?:"530ae25ce4b6e2d57f3342ea")
		def board = Board.findById(id)
		def boardMember = boardService.deleteBoardMember(board,member)
		if (boardMember) {
			
			boardService.deleteUserAssociations(member, board)
			
			response.data = null
			response.success = true
			response.message = message(code:'board.member.delete.success.msg')
			response.code = message(code:'board.member.delete.success.code')
		}
		render response as JSON
	}
	
}
