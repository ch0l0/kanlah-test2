package kanban

class SystemParameters {
	
	//Application
	String name = "Kanlah"
	String logo
	String url = "http://devkanban.leotech.com.sg:8000/"
   
	//Project
	Integer maxProjects = 5
	Integer maxBoards = 5
	Integer maxUsersPerProject = 5
   
	//Board
	Integer maxColumns = 5
	Integer maxCardsPerColumn = 10
   
	//User
	Integer maxFilesizeAvatar = 2 //MB
    String allowedFileExtensionsAvatar = "'.gif','.png','.jpeg','.jpg','.bmp'" //[".gif",".png", ".jpeg",".jpg",".bmp"]
	Integer resizeMinPixelAvatar = 200	//in pixels (either width or height)
	//Card
	Integer maxFilesizeCardAttachment = 10 //MB
	String allowedFileExtensionsAttachment = "'.doc','.docx', '.txt','.zip','.exe','.gif','.png', '.jpeg','.jpg'"

    static constraints = {
		logo blank:true, nullable: true
		maxProjects min: 1
		maxBoards min: 1
		maxUsersPerProject min: 1
		maxColumns min:1, max: 5
		maxCardsPerColumn min: 1
		maxFilesizeAvatar min: 1, max: 2
		resizeMinPixelAvatar min: 200
		maxFilesizeCardAttachment min: 1, max: 10
    }
}
