
<%@ page import="kanban.ShiroRole" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'shiroRole.label', default: 'ShiroRole')}" />
		<title><g:message code="default.list.label" args="['Kanban BO Role']" /></title>
	</head>
	<body>
		<a href="#list-shiroRole" class="skip" tabindex="-1"><g:message code="default.link.skip.label" default="Skip to content&hellip;"/></a>
		 
		<div class="nav" role="navigation">
			<ul>
				<li><g:link class="create" action="create"><g:message code="default.new.label" args="['Backoffice User Role']" /></g:link></li>
			</ul>
		</div>
		
		<div id="list-shiroRole" class="content scaffold-list" role="main">
			<h1> Backoffice User Roles</h1>
			<g:if test="${flash.message}">
			<div class="message" role="status">${flash.message}</div>
			</g:if>
			<g:form action="updateRoles" >
			<table>
				<thead>
					<tr>
						<g:sortableColumn property="name" title="${message(code: 'shiroRole.name.label', default: 'Name')}" />
						<g:each in="${accessList}" var="access">
							<th>
								<center>${fieldValue(bean: access, field: "title")}</center>
							</th>
						</g:each>
					</tr>
				</thead>
				<tbody>
				<g:each in="${shiroRoleInstanceList}" status="i" var="shiroRoleInstance">
					<tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
						<!--  
						<td><g:link action="show" id="${shiroRoleInstance.id}">${fieldValue(bean: shiroRoleInstance, field: "name")}</g:link></td>
						-->		
						<td><g:link action="edit" id="${shiroRoleInstance.id}">${fieldValue(bean: shiroRoleInstance, field: "name")}</g:link></td>
						<g:each in="${accessList}" var="access">
							<g:set var="hasAccess" value="No" />
							<g:each in="${shiroRoleInstance.access}" var="boaccess">
								<g:if test="${boaccess == access}">
									<g:set var="hasAccess" value="Yes" />
								</g:if>
							</g:each>
							<g:set var="varName" value="cb-${shiroRoleInstance.id}-${access.value()}" />
							<td>
								<center>
								<g:if test="${hasAccess == "Yes"}"> 
									<g:if test="${shiroRoleInstance.name == "BO_ADMIN"}">
										<input type="checkbox" name="${varName}" id="${varName}" checked disabled/>
									</g:if>
									<g:else>
										<input type="checkbox" name="${varName}" id="${varName}" checked />
									</g:else>
								</g:if>
								<g:else>
									<g:if test="${shiroRoleInstance.name == "BO_ADMIN"}">
										<input type="checkbox" name="${varName}" id="${varName}" disabled/>
									</g:if>
									<g:else>
										<input type="checkbox" name="${varName}" id="${varName}" />
									</g:else>	
								</g:else>
								</center>
							</td>
						</g:each>		
					</tr>
				</g:each>
				</tbody>
			</table>
			
			
			<div class="pagination">
				<g:paginate total="${shiroRoleInstanceTotal}" />
			</div>
			<fieldset class="buttons">
				<g:submitButton name="updateRoles" class="save" value="Update" />
			</fieldset>
			</g:form>
		</div>
	</body>
</html>
