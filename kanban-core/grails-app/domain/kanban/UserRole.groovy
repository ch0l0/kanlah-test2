package kanban

import kanban.old.Company

class UserRole implements Serializable {
	
	String id
	User user
    Role role
    Company company
	ApprovalStatus status
	
	enum ApprovalStatus {
		ACTIVE, PENDING, REJECTED, DELETED
	}
	
	static mapping = {
		table 'users_roles'
		id composite: ['role', 'user']
		role lazy: false	
	}

	boolean equals(other) {
		if (!(other instanceof UserRole)) {
			return false
		}

		other.user?.id == user?.id &&
			other.role?.id == role?.id
	}

	static UserRole get(long userId, long roleId) {
		find 'from UsersRoles where user.id = :userId and role.id = :roleId',
			[userId: userId, roleId: roleId]
	}

	static UserRole create(User user, Role role, ApprovalStatus status, boolean flush = false) {
		new UserRole(user: user, role: role, status: status).save(flush: flush, insert: true)
	}

	static boolean remove(User user, Role role, boolean flush = false) {
		UserRole userRole = UserRole.findByUserAndRole(user, role)
		if (!userRole) {
			return false
		}

		userRole.delete(flush: flush)
		true
	}

	static void removeAll(User user) {
		executeUpdate 'DELETE FROM UsersRoles WHERE user=:user', [user: user]
	}

	static void removeAll(Role role) {
		executeUpdate 'DELETE FROM UsersRoles WHERE role=:role', [role: role]
	}
}
