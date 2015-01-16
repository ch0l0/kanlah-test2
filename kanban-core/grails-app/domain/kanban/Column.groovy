package kanban

class Column {

	String id
    String title
	String color
	ColumnStatus status = ColumnStatus.ACTIVE
	Integer max = DEFAULT_MAXTASKS
	Integer pos // -1 pos is archived

    //static belongsTo = [board:Board]
	String boardId

	static enum ColumnStatus {
		ACTIVE, DELETED, ARCHIVED
	}

	final static Integer DEFAULT_MAXTASKS = 10

    static constraints = {
        title(blank: false, nullable: false, size: 2..100)
		color blank:true, nullable:true
		max blank:true, nullable: true
		pos blank:false, nullable:false
		boardId blank:false, nullable:false
    }

	def info() {
		[id: this.id,
		title: this.title,
		color: this.color,
		max: this.max,
		status: this.status.name(),
		pos: this.pos,
		boardId: this.boardId
		]
	}
	
	def infoExpand(userId) {
		[id: this.id,
		title: this.title,
		color: this.color,
		max: this.max,
		pos: this.pos,
		boardId: this.boardId,
		status: this.status.name(),
		cards: getCards(this.boardId, this.id, userId),
		subscribed: isSubscribed(this.id, userId)
		]
	}
	
	def getCards = { boardId, columnId, userId ->
		def cards = []
		def _cards = Card.findAllByBoardIdAndColumnIdAndStatus(boardId, columnId, Card.CardStatus.ACTIVE)
		_cards.each { card ->
			if (card) cards.add(card.info(userId))
		}
		cards.sort{a,b-> b.pos<=>a.pos}.reverse()
	}
	
	def isSubscribed = { columnId, userId ->
		def subscribed = Column_Member.findByColumnIdAndUserId(columnId, userId?:"")
		return subscribed?true:false
	}
}
