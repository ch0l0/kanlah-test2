package kanban

import org.springframework.transaction.annotation.Transactional;

class NotificationService {

	@Transactional
    def log(user, activity) {
		
		def notification = new Notification(userId: user.id, activityId: activity.id)
		if (!(notification.validate() && notification.save())) {
			log.error notification.errors
		} 
	
		notification
    }
}
