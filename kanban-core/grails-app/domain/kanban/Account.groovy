package kanban

class Account {

	String id
	String companyName
	String companyDescription
	
	Status status = Status.ENABLED
	Date registrationDate
	Date verifiedDate
	Date closedDate
	Date updateDate

	
	static hasMany = [boards: Board, labels: Label]
	
    static constraints = {
		companyName blank:true, nullable:true, size: 2..50
	    companyDescription blank:true, nullable:true
		status blank:false, nullable: false
		registrationDate blank:false, nullable: false
		verifiedDate blank:true, nullable: true
		closedDate blank:true, nullable:true
		updateDate blank:true, nullable:true
    }
	
	def beforeInsert() {
		def date = new Date()
		updateDate = date
	}
	
	def beforeUpdate() {
		def date = new Date()
		updateDate = date
	}
	
	def getLabelInfo() {
		def _labels = []
		for (label in labels) {
			if (label) _labels.add(label.info())
		}
		_labels
	}
}
