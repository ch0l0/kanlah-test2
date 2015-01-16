class UrlMappings {

	static mappings = {
		"/$controller/$action?/$id?"{
			constraints {
				// apply constraints here
			}
		}

		"/user/$action?"(controller:"shiroUser")
		"/role/$action?"(controller: "shiroRole")
		
		//"/"(view:"/index")
		"/"(controller:"backoffice")
		"500"(view:'/error')
		
		
	}
	
	
}
