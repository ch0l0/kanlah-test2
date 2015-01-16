package kanban

class Label {
    String id
    String name
    String color

    static constraints = {
        name(blank: false, nullable: false, size: 2..50)
        color(blank: true, nullable: true)
    }
	
	def info() {
		[id: this.id,
		name: this.name,
		color: this.color
    	]
	}
}
