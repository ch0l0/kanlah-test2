package kanban

import job.MailData
import kanban.old.Company
import org.springframework.transaction.annotation.Transactional
import grails.converters.JSON

class CompanyService {

    def getProfile(Company profile){
        def company = []
        def owner = []
        if(profile ){
            if(profile.status.equals(Company.CompanyStatus.ACTIVE)){
                company = [
                        id: profile.id,
                        name: profile.name,
                        description: profile.description,
                        urlName: profile.urlName,
                        maxUsers: profile.maxUsers,
                        labels: profile.labels,
                        owner: [fullname: profile.owner.fullname, email: profile.owner.email],
                        members: [],
                        boards: profile.boards,
                        status: profile.status.name()
                ]
                company.boards = getBoardsProfile(profile)
                company.members = getMembersProfile(profile)
                company.plan = getPlanProfile(profile)
            }
            else {
                company = [
                        id: profile.id,
                        name: profile.name,
                        urlName: profile.urlName,
                        status: profile.status.name(),
                        owner: [fullname: profile.owner.fullname, email: profile.owner.email]
                ]
                company.members = getMembersProfile(profile)
                company.plan = getPlanProfile(profile)
            }
        }
        return company
    }

	def getPlanProfile(Company profile){
        def plan
        profile.plan.collect {it ->
            plan = ([
                id: it.id,
                maxBoards: it.maxBoards,
                maxStorage: it.maxStorage,
                maxUsers: it.maxUsers,
                planType: it.planType.name(),
                description: it.description,
                price: it.price
            ])
        }
        return plan
    }

    def getMembersProfile(Company profile){
        def members = UserRole.findAllByCompany(profile)
        def profiles = []
        members.each { it ->
            profiles.add([
                    id: it.user.id,
                    email: it.user.email,
                    fullname: it.user.fullname,
                    avatar: it.user.avatar,
                    useAvatar: it.user.useAvatar,
                    userLevel: it.role.authority.name(),
                    status: it.status.name()
            ])
        }
        return profiles
    }

    def getBoardsProfile(Company profile){
        def profiles = [
                active: [],
                deleted: []
        ]
        profile.boards.each { it ->
            if(it.status.equals(Board.Status.ACTIVE)){
                profiles.active.add([
                        id: it.id,
                        name: it.name,
                        status: it.status.name(),
                        users: getBoardUsers(it)
                ])
            }
            if(it.status.equals(Board.Status.DELETED)){
                profiles.deleted.add([
                        id: it.id,
                        name: it.name,
                        status: it.status.name(),
                        users: getBoardUsers(it)
                ])

            }
        }
        return profiles
    }

    def getBoardUsers(Board board){
        def profiles = []
        board.users.each { it ->
            profiles.add([
                    id: it.id,
                    email: it.email,
                    username: it.username,
                    fullname: it.fullname,
                    useAvatar: it.useAvatar,
                    avatar: it.avatar
            ])
        }
        return profiles
    }

    @Transactional
    def save(Company company) {
        company = company.save(flush: true)
        return company
    }

    def myBoards(String id){
        def boards = Board.withCriteria {
            'in'('users', [User.findById(id)])
        }
        JSON.use('deep')

        def myBoards = [active: [], deleted: [], deletedColumns: [], deletedTasks: []]

        boards.each { b ->
            def isOwner = false
            b.owners.each { User u ->
                if(id == u.id)
                    isOwner = true
            }
            if(b.status.equals(Board.Status.ACTIVE)) {
                myBoards.active.add(
                        [
                                id: b.id,
                                name: b.name,
                                description: b.description,
                                isOwner: isOwner
                        ]
                )
            }
            if(b.status.equals(Board.Status.DELETED)) {
                myBoards.deleted.add(
                        [
                                id: b.id,
                                name: b.name,
                                description: b.description,
                                isOwner: isOwner
                        ]
                )
            }

            b.columns.each { column ->
                if (column.orderNo < 0) myBoards.deletedColumns.add(column)
                column.tasks.each { task ->
                    if (task.orderNo < 0)  myBoards.deletedTasks.add(task)
                }
            }
        }

        return myBoards
    }
    
    def createLabels(Company company){

        def _labels = [ "Design", "QA", "Development" ]
        for (def i=0; i < _labels.size(); i++) {
            def label = new Label()
            label.name = _labels[i]

            def colors= ["13C4A5","3FCF7F","5191D1","233445","F4C414","FF5F5F"]
            Collections.shuffle(colors, new Random())
            label.color = colors[0]
            if(label.validate() && label.save(flush:true)) {
                company.addToLabels(label)
                company.save()
            }
        }
    }


	def sendEmailRegistration(account, name, email, url){
		def content = """\
					Hello <b>${name}</b>,<br><br>
					Thank you for opening an account with Kanban System, to start using the application, please click on the link below to verify your email address.<br><br>
                    ${url}<br><br>
					Please ignore and delete this email if you did not request for an account.
					"""
		MailData mail = new MailData(
				to: email,
				subject: "Registration: ${account.companyName}'s Kanban",
				content: content
		)
		EmailJob.triggerNow([mailData: mail])
	}

////---------------
    def listAllCompanyByUserId(String UserId){

		def listCompany = new ArrayList()

	    def memberCompany = Company.withCriteria {
		    'in'('users', [User.findById(UserId)])
	    }

	    listCompany = memberCompany.collect{[
			companyId:it?.id,
			name:it?.name,
			desc:it?.description,
			status: it?.status?.name(),
			role: Role.Authority.USER.name(),
			boards_total: it.boards.findAll { it.status.equals(Board.Status.ACTIVE)}.size()
		]}

	    def principalCompany = Company.findByOwner(User.findById(UserId))
	    if(principalCompany){
		    listCompany.add([
				companyId:principalCompany?.id,
				name:principalCompany?.name,
				desc:principalCompany?.description,
				status: principalCompany?.status?.name(),
				role: Role.Authority.OWNER.name(),
				boardsTotal: principalCompany.boards.findAll { it.status.equals(Board.Status.ACTIVE)}.size()
		    ])
	    }

		listCompany
	}

}
