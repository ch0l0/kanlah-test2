package kanban

import exceptions.RecordExistException
import grails.validation.ValidationException
import org.codehaus.groovy.grails.web.util.WebUtils
import org.springframework.transaction.annotation.Transactional
import grails.converters.JSON

class BoardService {
	def userService
	def columnService
	
	def final int COL_POS_OFFSET = 5000
	
    def create(Board board){
        board = save(board)
        return board
    }

    def update(Board board){
        board = save(board)
        return board
    }

    def softDelete(Board board) {
        board.status = Board.Status.DELETED
        board = save(board)
        return board
    }

    def restore(Board board) {
        board.status = Board.Status.ACTIVE
        board = save(board)
        return board
    }

    @Transactional
    def save(Board board) {
        if (board.columns) {
            board.columns = [board.columns]
        } else {
            board.roles = []
        }
        board = board.save(flush: true)
        return board
    }

	@Transactional
	def createBoard(accountId, title, description, columns) {
		def board
		def account = Account.findById(accountId?:"")
		if (account) {
			board = new Board(title: title?:"", description: description?:"")
			if (board.validate() && board.save(flush: true)) {
				def cols = columns?:defaultColumns() //[]
				int pos = COL_POS_OFFSET
				cols.each {
					def _pos = it.pos?:pos
					pos = _pos
					
					def c = columnService.create(board.id, it.title, it.color, it.max, pos)
					if (c) pos += COL_POS_OFFSET //pos++
				}
				account.addToBoards(board)
				account.save()

				attachUsers(board, account)
			}
			else {
				board.errors.allErrors.each {
					log.error ("Err:" + it)
				}
				throw new ValidationException("Foo is not Valid",board.errors)
			}
		}
		board
	}

	@Transactional
	def updateBoard(id, accountId, title, description, status, columns) {
		def board = Board.findById(id)
		def account = Account.findById(accountId?:"")
		if (account) {
			board.title=title
			board.description=description
			board.status=status
			if (board.validate() && board.save(flush: true)) {
				updateBoardColumns(board, columns)
			}
			else {
				board.errors.allErrors.each {
					log.error ("Err:" + it)
				}
				throw new ValidationException("Foo is not Valid",board.errors)
			}
		}
		board
	}
	
	def defaultColumns() {
		def colTitles =  ["Requested", "In-Progress", "Tested", "Completed"]
		def cols  = []
		colTitles.each {
			cols.add(new Column(title: it))
		}
		cols
	}

	@Transactional
	def updateBoardColumns(board, columns) {
		def boardColumns = board.columns
		if (columns && boardColumns) {
			columns.each { column ->
				def isUpdated = false
				boardColumns.each { boardColumn ->
					if(column.id.equals(boardColumn.id)){
						//Update Old Column
						columnService.update(boardColumn.id,column.title,column.color,column.max.toInteger(),column.pos,column.status)
						isUpdated = true
						return false
					}
				}
				if(!isUpdated){
					//New Column?
					columnService.create(board.id,column.title,column.color,column.max.toInteger(),column.pos?:12)
				}
			}
		}
		columns
	}

	@Transactional
	def deleteBoard(boardId) {
		def board
			board = Board.findById(boardId)
			if(board){
				board.status = Board.Status.DELETED
				if (board.save() && board.validate()) {
					//
				}
			}
		board
	}

	def attachUsers(board, account){
//		attach to owner and admin
		def accountOwner = Account_Member.findByRoleAndAccountId(Account_Member.MemberRole.OWNER, account.id)
		if(accountOwner){
			def owner = User.findById(accountOwner.userId)
			if(owner)
				createBoardMember(board, owner, Board_Member.MemberRole.OWNER)
		}
		def accountAdmins = Account_Member.findAllByRoleAndAccountId(Account_Member.MemberRole.ADMIN, account.id)
		if(accountAdmins)
			accountAdmins.each {
				def admin = User.findById(it.userId)
				if(admin)
				createBoardMember(board, admin, Board_Member.MemberRole.ADMIN)
			}
	}

	def getBoardsByCompanyUser(accountId, userId) {
		def boards = new ArrayList()
		def accountMember = Account_Member.findByAccountIdAndUserId(accountId, userId)
		if (accountMember) {
			def account = Account.findById(accountId)
			def member = User.findById(userId)
			if(account && member){
				def board_member = Board_Member.findAllByMemberAndBoardInList(member, account.boards)
				if(board_member){
					board_member.board.each {
						if(!it.status.equals(Board.Status.DELETED))
						boards.add(it.info())
					}
				}
			}
		}
		boards
	}

	@Transactional
	def createBoardMember(board, member, role){
		if(Board_Member.findByBoardAndMember(board, member)){
			throw new RecordExistException()
		}

		def boardMember = new Board_Member(board: board, member: member, role: role)
		if(!(boardMember.save() && boardMember.validate())){
			boardMember.errors.allErrors.each {
				log.error("Err:" + it)
			}
			null
		}
		else
			[board: boardMember.board.info(), member: boardMember.member.info()]
	}

	@Transactional
	def updateBoardMember(board, member, role){

		def boardMember = Board_Member.findByBoardAndMember(board,member)
			boardMember.role = role
		if(!(boardMember.save() && boardMember.validate())){
			boardMember.errors.allErrors.each {
				log.error("Err:" + it)
			}
			null
		}
		else
			[board: boardMember.board.info(), member: boardMember.member.info()]
	}

	@Transactional
	def deleteBoardMember(board, member){
		def boardMember = Board_Member.findByBoardAndMember(board, member)
		if(boardMember && !boardMember.delete()){
			boardMember.errors.allErrors.each {
				log.error("Err:" + it)
			}
			false
		}
		true
	}

	def listBoardMember(board){
		def boardMembers = Board_Member.findAllByBoard(board)
		def members = new ArrayList()
		boardMembers.each {
			members.add([
					id: it.member.id,
					email: it.member.email,
					fullname: it.member.fullname,
					status: it.member.status.name(),
					role: it.role.name(),
					avatar: it.member.avatar,
					useAvatar: it.member.useAvatar
				]
			)
		}
		members
	}
	
	def deleteUserAssociations(member, board) {
		for (column in board.columns) {
			
			//delete column subscription
			def col_m = Column_Member.findByColumnIdAndUserId(column.id, member.id)
			if (col_m) col_m.delete()
			
			def cards = Card.findAllByBoardIdAndColumnId(board.id, column.id)
			for (card in cards) {
				
				//delete from card assignment
				if (member) {
					def card_m = Card_Member.findByCardAndMember(card, member)
					if (card_m) card_m.delete()
				}
				
				//delete from card subscription
				def card_ms = Card_Member_Subscription.findByCardIdAndUserId(card.id, member.id)
				if (card_ms) card_ms.delete()
			}
		}
	}
}
