package kanban.bo

class BackofficeController {
	
    def index() { 
		redirect (controller:"project", action:"list")
	}
}
