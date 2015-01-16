package kanban

class Board_Member {

	Board board
	User member
	MemberRole role

	static enum MemberRole {
		OWNER, ADMIN, MEMBER
	}
}
