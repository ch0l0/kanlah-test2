
<%@ page import="kanban.SystemParameters" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'systemParameters.label', default: 'SystemParameters')}" />
		<title><g:message code="default.show.label" args="[entityName]" /></title>
	</head>
	<body>
		<a href="#show-systemParameters" class="skip" tabindex="-1"><g:message code="default.link.skip.label" default="Skip to content&hellip;"/></a>
		<div class="nav" role="navigation">
			<ul>
				<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
				<li><g:link class="list" action="list"><g:message code="default.list.label" args="[entityName]" /></g:link></li>
				<li><g:link class="create" action="create"><g:message code="default.new.label" args="[entityName]" /></g:link></li>
			</ul>
		</div>
		<div id="show-systemParameters" class="content scaffold-show" role="main">
			<h1><g:message code="default.show.label" args="[entityName]" /></h1>
			<g:if test="${flash.message}">
			<div class="message" role="status">${flash.message}</div>
			</g:if>
			<ol class="property-list systemParameters">
			
				<g:if test="${systemParametersInstance?.logo}">
				<li class="fieldcontain">
					<span id="logo-label" class="property-label"><g:message code="systemParameters.logo.label" default="Logo" /></span>
					
						<span class="property-value" aria-labelledby="logo-label"><g:fieldValue bean="${systemParametersInstance}" field="logo"/></span>
					
				</li>
				</g:if>
			
				<g:if test="${systemParametersInstance?.maxBoards}">
				<li class="fieldcontain">
					<span id="maxBoards-label" class="property-label"><g:message code="systemParameters.maxBoards.label" default="Max Boards" /></span>
					
						<span class="property-value" aria-labelledby="maxBoards-label"><g:fieldValue bean="${systemParametersInstance}" field="maxBoards"/></span>
					
				</li>
				</g:if>
			
				<g:if test="${systemParametersInstance?.maxCardsPerColumn}">
				<li class="fieldcontain">
					<span id="maxCardsPerColumn-label" class="property-label"><g:message code="systemParameters.maxCardsPerColumn.label" default="Max Cards Per Column" /></span>
					
						<span class="property-value" aria-labelledby="maxCardsPerColumn-label"><g:fieldValue bean="${systemParametersInstance}" field="maxCardsPerColumn"/></span>
					
				</li>
				</g:if>
			
				<g:if test="${systemParametersInstance?.maxColumns}">
				<li class="fieldcontain">
					<span id="maxColumns-label" class="property-label"><g:message code="systemParameters.maxColumns.label" default="Max Columns" /></span>
					
						<span class="property-value" aria-labelledby="maxColumns-label"><g:fieldValue bean="${systemParametersInstance}" field="maxColumns"/></span>
					
				</li>
				</g:if>
			
				<g:if test="${systemParametersInstance?.maxFilesizeAvatar}">
				<li class="fieldcontain">
					<span id="maxFilesizeAvatar-label" class="property-label"><g:message code="systemParameters.maxFilesizeAvatar.label" default="Max Filesize Avatar" /></span>
					
						<span class="property-value" aria-labelledby="maxFilesizeAvatar-label"><g:fieldValue bean="${systemParametersInstance}" field="maxFilesizeAvatar"/></span>
					
				</li>
				</g:if>
			
				<g:if test="${systemParametersInstance?.maxFilesizeCardAttachment}">
				<li class="fieldcontain">
					<span id="maxFilesizeCardAttachment-label" class="property-label"><g:message code="systemParameters.maxFilesizeCardAttachment.label" default="Max Filesize Card Attachment" /></span>
					
						<span class="property-value" aria-labelledby="maxFilesizeCardAttachment-label"><g:fieldValue bean="${systemParametersInstance}" field="maxFilesizeCardAttachment"/></span>
					
				</li>
				</g:if>
			
				<g:if test="${systemParametersInstance?.maxProjects}">
				<li class="fieldcontain">
					<span id="maxProjects-label" class="property-label"><g:message code="systemParameters.maxProjects.label" default="Max Projects" /></span>
					
						<span class="property-value" aria-labelledby="maxProjects-label"><g:fieldValue bean="${systemParametersInstance}" field="maxProjects"/></span>
					
				</li>
				</g:if>
			
				<g:if test="${systemParametersInstance?.maxUsersPerProject}">
				<li class="fieldcontain">
					<span id="maxUsersPerProject-label" class="property-label"><g:message code="systemParameters.maxUsersPerProject.label" default="Max Users Per Project" /></span>
					
						<span class="property-value" aria-labelledby="maxUsersPerProject-label"><g:fieldValue bean="${systemParametersInstance}" field="maxUsersPerProject"/></span>
					
				</li>
				</g:if>
			
				<g:if test="${systemParametersInstance?.name}">
				<li class="fieldcontain">
					<span id="name-label" class="property-label"><g:message code="systemParameters.name.label" default="Name" /></span>
					
						<span class="property-value" aria-labelledby="name-label"><g:fieldValue bean="${systemParametersInstance}" field="name"/></span>
					
				</li>
				</g:if>
			
				<g:if test="${systemParametersInstance?.url}">
				<li class="fieldcontain">
					<span id="url-label" class="property-label"><g:message code="systemParameters.url.label" default="Url" /></span>
					
						<span class="property-value" aria-labelledby="url-label"><g:fieldValue bean="${systemParametersInstance}" field="url"/></span>
					
				</li>
				</g:if>
			
			</ol>
			<g:form>
				<fieldset class="buttons">
					<g:hiddenField name="id" value="${systemParametersInstance?.id}" />
					<g:link class="edit" action="edit" id="${systemParametersInstance?.id}"><g:message code="default.button.edit.label" default="Edit" /></g:link>
					<g:actionSubmit class="delete" action="delete" value="${message(code: 'default.button.delete.label', default: 'Delete')}" onclick="return confirm('${message(code: 'default.button.delete.confirm.message', default: 'Are you sure?')}');" />
				</fieldset>
			</g:form>
		</div>
	</body>
</html>
