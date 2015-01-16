package kanban

import java.text.SimpleDateFormat;
import java.util.Date;

class Attachment {
	String id
	String name
	String relativePath
	String absolutePath
	double size
	String extension
	Date createdAt

	static constraints = {
		name(blank: false, nullable: false)
		relativePath(blank: true, nullable: true)
		absolutePath(blank: true, nullable: true)
		size(blank: true, nullable: true)
		extension(blank: true, nullable: true)
		createdAt(blank: true, nullable: true)
	}
	
	def beforeUpdate(){
		createdAt = new Date()
	}
	
	def beforeInsert(){
		createdAt = new Date()
	}
	
	def info() {
		[id: this.id,
		name: this.name,
		relativePath: this.relativePath,
		absolutePath: this.absolutePath,
		size: this.size,
		extension: this.extension,
		createdAt: formatDate(this.createdAt)?:""
		]
	}
	
	def formatDate = { date ->
		if (date) {
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss:SSS")
			def d = sdf.format(date)
			return d
		}
	}
}
