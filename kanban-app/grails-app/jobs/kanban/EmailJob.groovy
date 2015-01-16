package kanban

import org.apache.commons.logging.LogFactory
import org.quartz.JobExecutionException
import org.springframework.mail.MailSendException
import job.MailData

class EmailJob {
	private static final log = LogFactory.getLog(this)
	def mailService
	
    static triggers = {
		simple name: "EmailJob", repeatCount: 0
    }

    def execute(context) {
		MailData maildata = context.mergedJobDataMap.get('mailData')
		if (maildata){
			try {
				mailService.sendMail {
					to maildata.to
					subject maildata.subject
					html maildata.content
				}
			} catch (MailSendException e) {
				log "MailService: " + e
			}
		}
    }
}
