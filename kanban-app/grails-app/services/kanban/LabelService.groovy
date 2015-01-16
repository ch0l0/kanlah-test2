package kanban

import org.springframework.transaction.annotation.Transactional;

class LabelService {

	@Transactional
    def create(accountId, name, color) {
		def label
		def account = Account.findById(accountId?:"")
		if (account) {
			label = new Label(name: name?:"", color: color?:"")
			if (label.validate() && label.save()) {
				account.addToLabels(label)
				account.save()
			} else log.error label.errors
		}
		
		label
	}
}
