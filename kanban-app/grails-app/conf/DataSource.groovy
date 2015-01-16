grails {
    mongo {
        host="localhost"
        port=27017
        databaseName="Kanban"
	    autoConnectRetry = true
	    connectTimeout = 3000
	    connectionsPerHost = 40
	    socketTimeout = 60000
	    threadsAllowedToBlockForConnectionMultiplier = 5
	    maxAutoConnectRetryTime=5
	    maxWaitTime=120000
    }
}