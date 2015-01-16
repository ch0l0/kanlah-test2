package kanban

import grails.validation.ValidationException

import java.text.SimpleDateFormat;

import org.springframework.transaction.annotation.Transactional;

class CardService {

	@Transactional
    def create(boardId, columnId, name, desc, pos, dueDate) {
		log.error ("create");
		def card
		def board = Board.findById(boardId?:"")
		if (board) {
			def column = Column.findById(columnId?:"")
			if (column) {
				card = new Card(
								name: name?:"",
								desc: desc?:"",
								pos: pos?:0,
								dueDate: dueDate?detDate(dueDate):null,
								boardId: boardId,
								columnId: columnId
								)								
				if (!(card.validate() && card.save())) {
					card.errors.allErrors.each {
						log.error("Err:" + it)
					}
					throw new ValidationException("Foo is not Valid",card.errors)
				} 
			}	
		}
		card
    }
	
	@Transactional
	def update(cardId, boardId, columnId, name, desc, pos, dueDate) {
		def card = Card.findById(cardId?:"")
		if (card) {
			card.name = name?:card.name
			card.desc = desc?:card.desc
			card.pos = pos?:card.pos
			card.dueDate = detDate(dueDate)
			card.boardId = boardId?:card.boardId
			card.columnId = columnId?:card.columnId
			if (!(card.validate() && card.save())) {
				card.errors.allErrors.each {
					log.error("Err:" + it)
				}
				throw new ValidationException("Foo is not Valid",card.errors)
			}
		}
		card
	}
	
	def detDate = { dueDate ->
		if(!dueDate) {
			return null;
		}
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd H:m")
		return sdf.parse(dueDate)
	}
}
