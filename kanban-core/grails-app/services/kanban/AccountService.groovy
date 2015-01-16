package kanban

import java.util.logging.Logger;

class AccountService {
	def userService
	
	
	//
	def createAccount(companyName, companyDescription, userId) {
		def account = new Account(companyName: companyName?:"", companyDescription: companyDescription?:"")
		account.registrationDate = new Date()
						
		if (account.validate()) {
			account.save()
			
			def account_member = new Account_Member(
				accountId: account.id,
				userId: userId,
				role: Account_Member.MemberRole.OWNER,
				status: Account_Member.MemberStatus.ACTIVE
				)
			account_member.save()
		} else {
			log.error account.errors
		}		
		account
    }
	
	def activate(account) {
		if (account.status != Status.ENABLED) {
			
			def account_member = Account_Member.findByAccountIdAndRole(account.id, Account_Member.MemberRole.OWNER)
			if (account_member) {
				account_member.status = Account_Member.MemberStatus.ACTIVE
				account_member.save()
				
				account.status = Status.ENABLED
				account.verifiedDate = new Date()
				account.save()
			}
			return true
		}
		return false
	}

	def listAllMembersByAccountId(String accountId){
		def listMembers = new ArrayList()
		def account_members = Account_Member.findAllByAccountId(accountId)

		if(account_members) {
			account_members.each {it ->
				def user = User.findById(it.userId)
				if(user) {
					def _user = [
						role: it?.role.name(),
						userStatus: user?.status.name(),
						status: it?.status.name(),
						userId: user?.id,
						fullname: user?.fullname,
						username: user?.username,
						email: user?.email,
	                    avatar: user?.avatar,
	                    useAvatar: user?.useAvatar
					]
					listMembers.add(_user)
				}
			}
		}
		listMembers
	}
	
	def listAllCompanyByUserId(String UserId){
		def listCompany = new ArrayList()
		def user_companies = Account_Member.findAllByUserId(UserId)
		if(user_companies){
			user_companies.each {it ->
				def account = Account.findById(it.accountId)
				if(account){
					def owner = Account_Member.findByAccountIdAndRole(it.accountId, Account_Member.MemberRole.OWNER)
					def user = User.findById(owner.userId)
					if(owner && user){
						def boards = getBoards(account.id, UserId)
						def _account = [
								accountId:it?.accountId,
								ownerName: user.fullname,
								ownerStatus: user?.status?.name(),
								name:account?.companyName,
								desc:account?.companyDescription,
								status: it?.status?.name(),
								accountStatus: account?.status.name(),
								role: it?.role.name(),
								boards: boards, //account.boards.collect{it.info()},
								boards_total: boards.size(), //account.boards.findAll{it.status.equals(Board.Status.ACTIVE)}.size()
								]
						listCompany.add(_account)
					}
				}
			}
		}
		listCompany
	}

	def getBoards(accountId, userId){
		def boards = new ArrayList()
		def accountMember = Account_Member.findByAccountIdAndUserId(accountId, userId)
		if (accountMember) {
			def account = Account.findById(accountId)
			def member = User.findById(userId)

			if(account && member){
				if(accountMember.role.equals(Account_Member.MemberRole.OWNER) || accountMember.role.equals(Account_Member.MemberRole.ADMIN)){
					account.boards.each {
						if(!it.status.equals(Board.Status.DELETED)){
							def info = it.info()
							info.projectRole = accountMember.role.name()
							boards.add(info)
						}
					}
				}
				if(accountMember.role.equals(Account_Member.MemberRole.MEMBER)){
					def board_member = Board_Member.findAllByMemberAndBoardInList(member, account.boards)
					if(board_member){
						board_member.board.eachWithIndex { it, i ->
							if(!it.status.equals(Board.Status.DELETED)){
								def info = it.info()
								info.projectRole = accountMember.role.name()
								info.boardRole = board_member[i].role.name()
								boards.add(info)
							}
						}
					}
				}
			}

		}
		boards
	}

	def setMemberRole(String accountId,String memberId,String memberRole){
		def account_member = Account_Member.findByUserIdAndAccountId(memberId,accountId)
		if(account_member){
			account_member.role = memberRole
			if(account_member.validate()){
				account_member.save()
			}
		}
		account_member
	}
}
