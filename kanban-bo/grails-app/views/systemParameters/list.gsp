<%@ page import="org.apache.shiro.SecurityUtils" %>
<%@ page import="kanban.BOAccess" %>
<%@ page import="kanban.bo.AccessService" %>
<%@ page import="kanban.SystemParameters" %>
<%
	 def accessService = new AccessService()
	 
	 def allowConfig = accessService.allowAction(SecurityUtils.subject?.principal, BOAccess.EDIT_CONFIG)
%>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'systemParameters.label', default: 'SystemParameters')}" />
		<title><g:message code="default.list.label" args="[entityName]" /></title>
	</head>
	<body>
		<a href="#list-systemParameters" class="skip" tabindex="-1"><g:message code="default.link.skip.label" default="Skip to content&hellip;"/></a>
		<%-- 
		<div class="nav" role="navigation">
			<ul>
				
				<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
				<li><g:link class="create" action="create"><g:message code="default.new.label" args="[entityName]" /></g:link></li>
				
			</ul>
		</div>
		--%>
		<div id="list-systemParameters" class="content scaffold-list" role="main">
			<h1>System Parameters</h1>
			<g:if test="${flash.message}">
			<div class="message" role="status">${flash.message}</div>
			</g:if>
			<table>
				<thead>
					<tr>
					
						<g:sortableColumn property="name" title="${message(code: 'systemParameters.name.label', default: 'Name')}" />
						
						<%-- 
						<g:sortableColumn property="logo" title="${message(code: 'systemParameters.logo.label', default: 'Logo')}" />
						--%>
						
						<g:sortableColumn property="url" title="${message(code: 'systemParameters.url.label', default: 'Images URL')}" />
						
						<g:sortableColumn property="maxProjects" title="${message(code: 'systemParameters.maxProjects.label', default: 'Max Projects')}" />
					
						<g:sortableColumn property="maxBoards" title="${message(code: 'systemParameters.maxBoards.label', default: 'Max Boards')}" />
						
						<%-- 
						<g:sortableColumn property="maxUsersPerProject" title="${message(code: 'systemParameters.maxUsersPerProject.label', default: 'Max Users / Project')}" />
						--%>
						
						<g:sortableColumn property="maxColumns" title="${message(code: 'systemParameters.maxColumns.label', default: 'Max Columns')}" />
					
						<g:sortableColumn property="maxCardsPerColumn" title="${message(code: 'systemParameters.maxCardsPerColumn.label', default: 'Max Cards / Column')}" />
					
						<g:sortableColumn property="maxFilesizeAvatar" title="${message(code: 'systemParameters.maxFilesizeAvatar.label', default: 'Max Filesize Avatar')}" />
					
						<g:sortableColumn property="maxFilesizeCardAttachment" title="${message(code: 'systemParameters.maxFilesizeCardAttachment.label', default: 'Max Filesize Card Attachment')}" />
						
						<g:sortableColumn property="resizeMinPixelAvatar" title="${message(code: 'systemParameters.resizeMinPixelAvatar.label', default: 'Min Resizable Size for Avatar')}" />
						
						<g:sortableColumn property="allowedFileExtensionsAvatar" title="${message(code: 'systemParameters.allowedFileExtensionsAvatar.label', default: 'File Extensions for Avatar')}" />
						
						<g:sortableColumn property="allowedFileExtensionsAvatar" title="${message(code: 'systemParameters.allowedFileExtensionsAvatar.label', default: 'File Extensions for Attachment')}" />
					
					</tr>
				</thead>
				<tbody>
				<g:each in="${systemParametersInstanceList}" status="i" var="systemParametersInstance">
					<tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
						<td>
							<g:if test="${allowConfig}">  
								<g:link action="edit" id="${systemParametersInstance.id}">${fieldValue(bean: systemParametersInstance, field: "name")}</g:link>
							</g:if>
							<g:else>
								${fieldValue(bean: systemParametersInstance, field: "name")}
							</g:else>
						</td>
						
						<%-- 
						<td><img src="${fieldValue(bean: systemParametersInstance, field: "logo")}" width="100" height="100" /></td>
						--%>
						
						<td>${fieldValue(bean: systemParametersInstance, field: "url")}</td>
						
						<td><center>${fieldValue(bean: systemParametersInstance, field: "maxProjects")}</td>
						
						<td><center>${fieldValue(bean: systemParametersInstance, field: "maxBoards")}</td>
					
						<%-- 
						<td><center>${fieldValue(bean: systemParametersInstance, field: "maxUsersPerProject")}</td>
						--%>
						
						<td><center>${fieldValue(bean: systemParametersInstance, field: "maxColumns")}</td>
					
						<td><center>${fieldValue(bean: systemParametersInstance, field: "maxCardsPerColumn")}</td>
					
						<td><center>${fieldValue(bean: systemParametersInstance, field: "maxFilesizeAvatar")} MB</td>
					
						<td><center>${fieldValue(bean: systemParametersInstance, field: "maxFilesizeCardAttachment")} MB</td>
					
						<td><center>${fieldValue(bean: systemParametersInstance, field: "resizeMinPixelAvatar")} pixels</td>
						
						<td>${fieldValue(bean: systemParametersInstance, field: "allowedFileExtensionsAvatar")}</td>
						
						<td>${fieldValue(bean: systemParametersInstance, field: "allowedFileExtensionsAttachment")}</td>
					</tr>
				</g:each>
				</tbody>
			</table>
			<div class="pagination">
				<g:paginate total="${systemParametersInstanceTotal}" />
			</div>
		</div>
	</body>
</html>
