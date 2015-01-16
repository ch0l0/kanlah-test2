package kanban.old

import kanban.Attachment
import kanban.Board
import kanban.Label
import kanban.User

class Task{

	String description
	
	Date createDate
	Date updateDate
	Date dueDate

    User creator
    Label label
	
	String color
	Integer orderNo // -1 orderNo is archived

    static hasMany = [assignedTo:User, attachments: Attachment, subscribers: User]
    static belongsTo = [column:Board]
    static constraints = {
        description(blank: true, nullable: true)

        label(blank: true, nullable: true)
		
		dueDate blank: true, nullable: true
		color blank:true, nullable:true
		orderNo blank:true, nullable:true
		
		//temp
		creator blank: true, nullable: true
        assignedTo(blank: true, nullable: true)

		attachments(blank: true, nullable: true)
		
	    createDate nullable: true
	    updateDate nullable: true
		
		subscribers blank:true, nullable:true
    }

	def beforeInsert() {
		createDate = new Date()
		updateDate = createDate
	}

	def beforeUpdate() {
		updateDate = new Date()
	}

	@Override
	public String toString() {
		return "Task{" +
				"version=" + version +
				", id='" + id + '\'' +
				", name='" + name + '\'' +
				", description='" + description + '\'' +
				", createDate=" + createDate +
				", updateDate=" + updateDate +
				", dueDate=" + dueDate +
				", creator=" + creator +
				", color='" + color + '\'' +
				", orderNo=" + orderNo +
				", assignedTo=" + assignedTo +
				", column=" + column +
				'}';
	}

}
