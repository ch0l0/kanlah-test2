<%@ page import="org.apache.shiro.SecurityUtils" %>
<%@ page import="kanban.BOAccess" %>
<%@ page import="kanban.bo.AccessService" %>
<%@ page import="kanban.SystemParameters" %>
<%
	 def accessService = new AccessService()
	 
	 def allowUsers = accessService.allowAction(SecurityUtils.subject?.principal, BOAccess.BO_USERS)
	 def allowRoles = accessService.allowAction(SecurityUtils.subject?.principal, BOAccess.BO_ROLES)
	 
	 def allowReports = accessService.allowAction(SecurityUtils.subject?.principal, BOAccess.VIEW_REPORTS)
	 def allowConfig = accessService.allowAction(SecurityUtils.subject?.principal, BOAccess.VIEW_CONFIG) || accessService.allowAction(SecurityUtils.subject?.principal, BOAccess.EDIT_CONFIG)
	 
	 def appName = "Kanban"
	 def systemParameters = SystemParameters.first()
	 if (systemParameters) appName = systemParameters.name
%>
<!DOCTYPE html>
<!--[if lt IE 7 ]> <html lang="en" class="no-js ie6"> <![endif]-->
<!--[if IE 7 ]>    <html lang="en" class="no-js ie7"> <![endif]-->
<!--[if IE 8 ]>    <html lang="en" class="no-js ie8"> <![endif]-->
<!--[if IE 9 ]>    <html lang="en" class="no-js ie9"> <![endif]-->
<!--[if (gt IE 9)|!(IE)]><!--> <html lang="en" class="no-js"><!--<![endif]-->
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
		<title><g:layoutTitle default="Grails"/></title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link rel="shortcut icon" href="${resource(dir: 'images', file: 'favicon.ico')}" type="image/x-icon">
		<link rel="apple-touch-icon" href="${resource(dir: 'images', file: 'apple-touch-icon.png')}">
		<link rel="apple-touch-icon" sizes="114x114" href="${resource(dir: 'images', file: 'apple-touch-icon-retina.png')}">
		
		<link rel="stylesheet" href="${resource(dir: 'css', file: 'main.css')}" type="text/css">
		<link rel="stylesheet" href="${resource(dir: 'css', file: 'mobile.css')}" type="text/css">
		<g:layoutHead/>
		<r:layoutResources />
	</head>
	<body>
		<div id="grailsLogo" role="banner">
			<%--  
			<a href="${systemParameters?.url}"><img src="${systemParameters?.logo}" width="100" height="100" /></a>
			--%>
			<a href="${systemParameters?.url}"><img src="${createLink(uri: '/')}images/logo.jpg" width="100" height="100" /></a>
			<strong style="font-family:arial;color:black;font-size:25px;">${appName}</strong>
			<g:if test="${SecurityUtils.subject?.principal != null}">
				<div style="font-family:arial;color:black;font-size:15px;float:right">
					Welcome <strong>${SecurityUtils.subject?.principal}</strong> |<a href="${createLink(uri: '/auth/signOut')}">Sign Out</a>
				</div>
			</g:if>
		</div>
		
		<g:if test="${SecurityUtils.subject?.principal != null}">
		<div class="nav" role="navigation">
			<ul>
				<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
				<li><a href="${createLink(uri: '/project')}">Account Management</a></li>
				<g:if test="${allowUsers}"> 
				<li><a href="${createLink(uri: '/user')}">User Management</a></li>
				</g:if>
				<g:if test="${allowRoles}"> 
				<li><a href="${createLink(uri: '/role')}">User Role Management</a></li>
				</g:if>
				<g:if test="${allowReports}"> 
				<li><a href="${createLink(uri: '/statistics')}">Reports</a></li>
				</g:if>
				<g:if test="${allowConfig}">  
				<li><a href="${createLink(uri: '/systemParameters')}">System Parameters</a></li>
				</g:if> 
				<%-- 
				<li><a class="home" href="${createLink(uri: '/auth/signOut')}">(<strong>${SecurityUtils.subject?.principal}</strong>)</a></li>
				--%>
			</ul>
		</div>
		</g:if>
		<g:layoutBody/>
		<div class="footer" role="contentinfo">
		</div>
		<div id="spinner" class="spinner" style="display:none;"><g:message code="spinner.alt" default="Loading&hellip;"/></div>
		<g:javascript library="application"/>
		<r:layoutResources />
	</body>
</html>
