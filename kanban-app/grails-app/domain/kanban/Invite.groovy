package kanban

import kanban.old.Company

class Invite {
    String id
    String email
    Company company
    InviteStatus status = InviteStatus.PENDING

    enum InviteStatus {
        ACTIVATED, PENDING, REJECTED
    }
    static constraints = {
        email(blank: false, nullable: false)
    }
}
