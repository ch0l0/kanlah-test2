quartz {
    autoStartup = true
    jdbcStore = false
}
environments {
	development {
        quartz {
            autoStartup = true
        }
	}
    production {
        quartz {
            autoStartup = true
        }
    }
}