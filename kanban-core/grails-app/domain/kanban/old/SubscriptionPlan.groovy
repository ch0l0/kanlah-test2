package kanban.old

import kanban.PlanType

class SubscriptionPlan {

	String id
	PlanType planType
	double price // in Yen
	int maxUsers // -1 = unlimited
	int maxBoards //  -1 = unlimited
	int maxStorage //in GB
	String description
	
	//static hasMany = [subscribers: User]
	
    static constraints = {
		description nullable:true, blank:true
    }
}
