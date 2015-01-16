<%@ page import="kanban.Status" %>
<%@ page import="org.apache.shiro.SecurityUtils" %>
<%@ page import="kanban.BOAccess" %>
<%@ page import="kanban.bo.AccessService" %>
<%
	 def accessService = new AccessService()
	 
	 def allowEnableSuspend = accessService.allowAction(SecurityUtils.subject?.principal, BOAccess.COMPANY_ACTIVATE)
	 def allowClose = accessService.allowAction(SecurityUtils.subject?.principal, BOAccess.COMPANY_DEACTIVATE)
%>

<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<title>Company Management</title>
	</head>
	<body>
		<a href="#list-shiroUser" class="skip" tabindex="-1"><g:message code="default.link.skip.label" default="Skip to content&hellip;"/></a>
		
		<div class="nav" role="navigation">
			<ul>
				<li>
					<g:form controller="project">
						<g:textField id="searchAccount" name="searchAccount" placeHolder="Display Name" value="${searchedDisplayName}"/>
						<g:actionSubmit action="search" value="Search" />
					</g:form>
				</li>
			</ul>
		</div>
		
		<div id="list-company" class="content scaffold-list" role="main">
			<%-- 
			<h1> Kanban Companies (${listinglabel})</h1>
			--%>
			<g:if test="${flash.message}">
			<div class="message" role="status">${flash.message}</div>
			</g:if>
			
			<table>
				<thead>
					<tr>
						<g:sortableColumn property="fullname" title="${message(code: 'account.displayName.label', default: 'Display Name')}" />
						<g:sortableColumn property="email" title="${message(code: 'account.email.label', default: 'Email')}" />
						<g:sortableColumn property="registrationDate" title="${message(code: 'account.registrationDate.label', default: 'Registration Date')}" />
						<g:sortableColumn property="verifiedDate" title="${message(code: 'account.verifidDate.label', default: 'Verified Date')}" />
						<g:sortableColumn property="closedDate" title="${message(code: 'account.closedDate.label', default: 'Closed Date')}" />
						<g:sortableColumn property="status" title="${message(code: 'account.action.label', default: 'Status')}" />
						<g:sortableColumn property="action" title="${message(code: 'account.action.label', default: 'Action')}" />
					</tr>
				</thead>
				<tbody>
				<g:each in="${accountList}" status="i" var="account">
					<tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
						<td>${fieldValue(bean: account, field: "fullname")}</td>
						<td>${fieldValue(bean: account, field: "email")}</td>
						<td>
							<g:formatDate date="${account.createdAt}" format="dd-MM-yyyy"/>
						</td>
						<td>
							<g:if test="${account.verifiedDate != null}"> 
								<g:formatDate date="${account.verifiedDate}" format="dd-MM-yyyy"/>
							</g:if>
						</td>
						<td>
							<g:if test="${account.closedDate != null}"> 
								<g:formatDate date="${account.closedDate}" format="dd-MM-yyyy"/>
							</g:if>
						</td>
						<td>${fieldValue(bean: account, field: "status")}</td>
						<td>
							<g:form controller="project">
								<g:if test="${account.status == Status.ENABLED}">
									<g:if test="${allowEnableSuspend}"> 
									<g:actionSubmit action="suspend" class="save" id="${account.id}" value="Suspend" />
									</g:if>
									<g:if test="${allowClose}"> 
									<g:actionSubmit action="close" class="save" id="${account.id}" value="Close" />
									</g:if>
								</g:if>
								<g:elseif test="${account.status == Status.PENDING || account.status == Status.SUSPENDED}">
									<g:if test="${allowEnableSuspend}"> 
									<g:actionSubmit action="enable" class="save" id="${account.id}" value="Enable" />
									</g:if>
									<g:if test="${allowClose}"> 
									<g:actionSubmit action="close" class="save" id="${account.id}" value="Close" />
									</g:if>
								</g:elseif>
								
								<input type="hidden" id="userId" name="userId" value="${account.id}" />
								<input type="hidden" id="fromSearch" name="fromSearch" value="${fromSearch}" />
							</g:form>
						</td>
					</tr>
				</g:each>
				</tbody>
			</table>
			
			<div class="pagination">
				<g:paginate total="${accountTotal}" />
			</div>
		</div>
	</body>
</html>
