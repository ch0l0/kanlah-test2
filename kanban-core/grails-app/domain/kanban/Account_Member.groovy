package kanban

class Account_Member {

	String accountId
	String userId
	MemberRole role
	MemberStatus status = MemberStatus.PENDING

	static enum MemberRole {
		OWNER, ADMIN, MEMBER
	}

	static enum MemberStatus {
		ACTIVE, INACTIVE, PENDING, DELETED
	}
}
