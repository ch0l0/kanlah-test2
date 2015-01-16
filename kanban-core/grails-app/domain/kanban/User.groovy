package kanban

class User {
	String id
    String email
	String username
    String fullname
    String initials
    String fbId
	boolean emailverified = false

    Date createdAt //registration date
    Date updatedAt
	
	Date currentSignInAt
	Date lastSignInAt
	Date lastActivityAt
	
	String password
	String authToken
	String avatar
	boolean useAvatar = false
	String newEmail

    Integer maxUsers = DEFAULT_MAX_USERS
    final static Integer DEFAULT_MAX_USERS = 5
	
	//For activation from user instead of account
	Date verifiedDate
	String activationCode
	Status status = Status.PENDING
	
	Date closedDate
	Date suspendedDate
	
    static constraints = {
        email(unique: true, blank: true, nullable: false, email:true)
        username(blank: true, nullable: false)
        fullname(blank: true, nullable: true, size: 2..50)
        initials(blank: true, nullable: true)
	    avatar(blank: true, nullable: true)
		password(blank: true, nullable: true)
        fbId nullable: true

        createdAt(blank: true, nullable: true)
        updatedAt(blank: true, nullable: true)
		
		currentSignInAt(blank: true, nullable: true)
		lastSignInAt(blank: true, nullable: true)
		lastActivityAt(blank: true, nullable: true)
		authToken(blank: true, nullable: true)
		avatar(blank: true, nullable: true)
		useAvatar(blank: true, nullable: true)
		newEmail(blank: true, nullable: true)
		status(blank:false, nullable: false)
		activationCode blank:true, nullable:false
		verifiedDate blank:true, nullable:true
		closedDate blank:true, nullable:true
		suspendedDate blank:true, nullable:true
    }

	def beforeValidate() {
		fullname = this.fullname.trim()
		password = this.password.trim()
		email = this.email.trim().toLowerCase()
		initials = this.initials ?: this.fullname.substring(0,1)
		username = (this.username == null || this.username.isEmpty() ? fullname.replaceAll(" ", "-") : this.username).toLowerCase()
	}
	
    def beforeInsert() {
		def date = new Date()
        createdAt = date
        updatedAt = date
		lastActivityAt = date
	    password = (this.password).encodeAsSHA256()
    }

    def beforeUpdate() {
		def date = new Date()
        updatedAt = date
		lastActivityAt = date
	    password = (this.password.size().equals(64)) ? this.password : (this.password).encodeAsSHA256()
    }
	
	private getSequence(){
		def seq = Seq.get(1)
		def i = seq.user + 1
		seq.user = i
		seq.save(insert:true)
		return i
	}

	def comparePassword(pwd){
		this.password.equals((pwd).encodeAsSHA256())
	}

	def info() {
		[id: this.id,
				email: this.email,
				username: this.username,
				fullname: this.fullname,
				status: this.status.name(),
				useAvatar: this.useAvatar,
				avatar: this.avatar
		]
	}
}
