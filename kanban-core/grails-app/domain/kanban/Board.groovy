package kanban

class Board {

	String id
	String title
	String description
	Status status = Status.ACTIVE
	static hasMany = [columns:Column]
	
	enum Status {
		ACTIVE, DELETED, COMPLETED
	}
	
	final static MAX_COLS = 5

	static constraints = {
		title(blank: false, nullable: false, size: 2..100)
		description(blank: true, nullable: true)
		status(blank: true, nullable: true)
	}

	/*def afterInsert() {
		this.addToLabels(new Label(name: "Design", color: "green"))
		this.addToLabels(new Label(name: "Development", color: "orange"))
		this.addToLabels(new Label(name: "QA", color: "blue"))
	}*/

	def info() {
		[id: this.id,
		title: this.title,
		description: this.description,
		status: this.status.name()
		]
	}	
	
	def infoExpand(userId) {
		[id: this.id,
			title: this.title,
			description: this.description,
			status: this.status.name(),
			columns: getColumns(this.columns, userId)
			]
	}

	def settings() {
		[id: this.id,
				title: this.title,
				description: this.description,
				status: this.status.name(),
				columns: getColumnsInfo(this.columns.sort{a,b-> b.pos<=>a.pos}.reverse())
		]
	}
	
	def getColumns(columns, userId) {
		def _columns = []
		for (col in columns) {
			if (col && col.status == Column.ColumnStatus.ACTIVE) 
				_columns.add(col.infoExpand(userId))
		}	 
		_columns
	}

	def getColumnsInfo(columns) {
		def _columns = []
		for (col in columns) {
			_columns.add(col.info())
		}
		_columns
	}
	
}
