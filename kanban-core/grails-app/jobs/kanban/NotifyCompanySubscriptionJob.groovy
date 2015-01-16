package kanban

import job.MailData
import kanban.old.Company
import org.codehaus.groovy.grails.web.mapping.LinkGenerator

class NotifyCompanySubscriptionJob {
    LinkGenerator grailsLinkGenerator

    static triggers = {
//        def cronExpr = '0 * * * * ?' // for dev, running every minute
        def cronExpr = '0 0 * * * ?' // daily at mn
        cron name:'cronTrigger', cronExpression: cronExpr
    }

    def execute() {
        log.debug("Executing NotifyCompanySubscriptionJob ${new Date()}")

        def companies = Company.findAllByStatus(Company.CompanyStatus.ACTIVE)
        companies.each { it ->
            log.debug "${it.name} : ${it.urlName}"
            def today = new Date()
            def expiryDate =  it.getExpiration()
            def expiryDatePre =  expiryDate - 3 // 3 days before 30th
            log.debug "subscriptionDate:"+ it.subscriptionDate
            log.debug "subscriptionDate:"+ it.subscriptionDate
            log.debug "expiryDate:"+ expiryDate
            log.debug "today:"+ today

            if(today > expiryDate){
                log.debug "deactivate : ${it.name}"
                it.status = Company.CompanyStatus.INACTIVE
                it.save(flush: true)
//                sendEmailNotification()
            } else if(today > expiryDatePre){
                log.debug "send reminder email to owner : ${it.owner.fullname}"
                it.sentReminder = true
                it.save(flush: true)
                sendEmailNotification(it)
            }
            log.debug "-----------------------------------------------------------"
            log.debug " "
        }

        log.debug("NotifyCompanySubscriptionJob completed")
    }

    private void sendEmailNotification(Company company) {
        def url = grailsLinkGenerator.serverBaseURL + "/" + company.urlName + "/#/login";
        def content = """\
					<b>Hey ${company.owner.fullname},</b><br><br>
					Your subscription will be ending soon.<br><br>
                    Login to Kanban System for more information:<br>
                    Or click <a style='font-weight:bold;background-color:#ffb51c;font-size:20px;' href='${url}/#subscribe'>here</a> to upgrade.
					"""

        MailData mail = new MailData(
                to: company.owner.email,
                subject: "Reminder: ${company.name}'s Kanban",
                content: content
        )
        EmailJob.triggerNow([mailData: mail])
    }
}