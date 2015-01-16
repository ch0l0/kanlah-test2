<%@ page import="kanban.SystemParameters" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'systemParameters.label', default: 'SystemParameters')}" />
		<title><g:message code="default.edit.label" args="[entityName]" /></title>
	</head>
	<body>
		<a href="#edit-systemParameters" class="skip" tabindex="-1"><g:message code="default.link.skip.label" default="Skip to content&hellip;"/></a>
		<%-- 	
		<div class="nav" role="navigation">
			<ul>
				<li><g:link class="list" action="list">System Parameters List</g:link></li>
			</ul>
		</div>
		--%>
		<div id="edit-systemParameters" class="content scaffold-edit" role="main">
			<h1>Edit System Parameters</h1>
			<g:if test="${flash.message}">
			<div class="message" role="status">${flash.message}</div>
			</g:if>
			<g:hasErrors bean="${systemParametersInstance}">
			<ul class="errors" role="alert">
				<g:eachError bean="${systemParametersInstance}" var="error">
				<li <g:if test="${error in org.springframework.validation.FieldError}">data-field-id="${error.field}"</g:if>><g:message error="${error}"/></li>
				</g:eachError>
			</ul>
			</g:hasErrors>
			
			<%-- 
			<g:uploadForm url="[controller:'SystemParameters', action:'upload']">
				<fieldset class="form">
					<div class="fieldcontain ${hasErrors(bean: systemParametersInstance, field: 'name', 'error')} ">
						<label for="logo">
							<g:message code="systemParameters.name.logo" default="Logo" />
						</label>
				        <input type="file" name="myFile" />
				        <input type="submit" value="Upload"/>
					</div> 
				</fieldset>
			</g:uploadForm>
			--%>
			
			<g:form method="post" >
				<g:hiddenField name="id" value="${systemParametersInstance?.id}" />
				<g:hiddenField name="version" value="${systemParametersInstance?.version}" />
				<g:hiddenField name="logo" value="${systemParametersInstance?.logo}" />
				<fieldset class="form">
					<g:render template="form"/>
				</fieldset>
				<fieldset class="buttons">
					<g:actionSubmit class="save" action="update" value="${message(code: 'default.button.update.label', default: 'Update')}" />
					<%-- 
					<g:actionSubmit class="delete" action="delete" value="${message(code: 'default.button.delete.label', default: 'Delete')}" formnovalidate="" onclick="return confirm('${message(code: 'default.button.delete.confirm.message', default: 'Are you sure?')}');" />
					--%>
					<g:link controller="SystemParameters" action="cancel" >Cancel</g:link>
				</fieldset>
			</g:form>
			
			
		</div>
	</body>
</html>
