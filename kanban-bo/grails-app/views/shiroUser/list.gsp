
<%@ page import="kanban.ShiroUser" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'shiroUser.label', default: 'ShiroUser')}" />
		<title><g:message code="default.list.label" args="['Kanban Backoffice User']" /></title>
	</head>
	<body>
		<a href="#list-shiroUser" class="skip" tabindex="-1"><g:message code="default.link.skip.label" default="Skip to content&hellip;"/></a>
		
		<div class="nav" role="navigation">
			<ul>
				<li><g:link class="create" action="create"><g:message code="default.new.label" args="['Backoffice User']" /></g:link></li>
			</ul>
		</div>
		
		<div id="list-shiroUser" class="content scaffold-list" role="main">
			<!--  
			<h1><g:message code="default.list.label" args="[entityName]" /></h1>
			-->
			<h1> Backoffice Users</h1>
			<g:if test="${flash.message}">
			<div class="message" role="status">${flash.message}</div>
			</g:if>
			<table>
				<thead>
					<tr>
						<g:sortableColumn property="username" title="${message(code: 'shiroUser.username.label', default: 'Username')}" />
						<g:sortableColumn property="name" title="${message(code: 'shiroUser.name.label', default: 'Name')}" />
						<g:sortableColumn property="email" title="${message(code: 'shiroUser.email.label', default: 'Email')}" />
						<g:sortableColumn property="role" title="${message(code: 'shiroUser.role.label', default: 'Role')}" />
					</tr>
				</thead>
				<tbody>
				<g:each in="${shiroUserInstanceList}" status="i" var="shiroUserInstance">
					<tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
						<td>
								<g:link action="edit" id="${shiroUserInstance.id}">${fieldValue(bean: shiroUserInstance, field: "username")}</g:link>
						</td>
						<td>${fieldValue(bean: shiroUserInstance, field: "name")}</td>
						<td>${fieldValue(bean: shiroUserInstance, field: "email")}</td>
						<!--  
						<td>
							<g:if test="${shiroUserInstance.admin}">
								ADMIN
							</g:if>
							<g:else>
								USER
							</g:else>
						</td>
						-->	
						<td>${shiroUserInstance?.role}</td>
					</tr>
				</g:each>
				</tbody>
			</table>
			<div class="pagination">
				<g:paginate total="${shiroUserInstanceTotal}" />
			</div>
		</div>
	</body>
</html>
