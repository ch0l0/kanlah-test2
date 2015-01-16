<%@ page import="kanban.SystemParameters" %>

<%-- 
<div class="fieldcontain ${hasErrors(bean: systemParametersInstance, field: 'logo', 'error')} ">
	<label for="logo">
		<g:message code="systemParameters.logo.label" default="Logo" />
	</label>
	<g:fieldValue bean="${systemParametersInstance}" field="logo" />
	<img src="${systemParametersInstance?.logo}" width="100" height="100"/>
</div>
--%>

<div class="fieldcontain ${hasErrors(bean: systemParametersInstance, field: 'name', 'error')} ">
	<label for="name">
		<g:message code="systemParameters.name.label" default="Name" />
	</label>
	<g:textField name="name" value="${systemParametersInstance?.name}" required="required" />
</div>

<div class="fieldcontain ${hasErrors(bean: systemParametersInstance, field: 'url', 'error')} ">
	<label for="url">
		<g:message code="systemParameters.url.label" default="Images Url" />
		
	</label>
	<g:textField name="url" value="${systemParametersInstance?.url}" required="required" />
</div>

<div class="fieldcontain ${hasErrors(bean: systemParametersInstance, field: 'maxProjects', 'error')} ">
	<label for="maxProjects">
		<g:message code="systemParameters.maxProjects.label" default="Max Projects" />
		
	</label>
	<g:field type="number" name="maxProjects" value="${systemParametersInstance.maxProjects}" required="required" />
</div>

<div class="fieldcontain ${hasErrors(bean: systemParametersInstance, field: 'maxBoards', 'error')} ">
	<label for="maxBoards">
		<g:message code="systemParameters.maxBoards.label" default="Max Boards" />
		
	</label>
	<g:field type="number" name="maxBoards" value="${systemParametersInstance.maxBoards}" required="required" />
</div>

<%-- 
<div class="fieldcontain ${hasErrors(bean: systemParametersInstance, field: 'maxUsersPerProject', 'error')} ">
	<label for="maxUsersPerProject">
		<g:message code="systemParameters.maxUsersPerProject.label" default="Max Users Per Project" />
		
	</label>
	<g:field type="number" name="maxUsersPerProject" value="${systemParametersInstance.maxUsersPerProject}" required="required" />
</div>
--%>

<div class="fieldcontain ${hasErrors(bean: systemParametersInstance, field: 'maxColumns', 'error')} ">
	<label for="maxColumns">
		<g:message code="systemParameters.maxColumns.label" default="Max Columns" />
		
	</label>
	<g:field type="number" name="maxColumns" value="${systemParametersInstance.maxColumns}" required="required" />
</div>

<div class="fieldcontain ${hasErrors(bean: systemParametersInstance, field: 'maxCardsPerColumn', 'error')} ">
	<label for="maxCardsPerColumn">
		<g:message code="systemParameters.maxCardsPerColumn.label" default="Max Cards Per Column" />
		
	</label>
	<g:field type="number" name="maxCardsPerColumn" value="${systemParametersInstance.maxCardsPerColumn}" required="required" />
</div>

<div class="fieldcontain ${hasErrors(bean: systemParametersInstance, field: 'maxFilesizeAvatar', 'error')} ">
	<label for="maxFilesizeAvatar">
		<g:message code="systemParameters.maxFilesizeAvatar.label" default="Max Filesize Avatar" />
	</label>
	<g:field type="number" name="maxFilesizeAvatar" value="${systemParametersInstance.maxFilesizeAvatar}" required="required" /> MB
</div>

<div class="fieldcontain ${hasErrors(bean: systemParametersInstance, field: 'maxFilesizeCardAttachment', 'error')} ">
	<label for="maxFilesizeCardAttachment">
		<g:message code="systemParameters.maxFilesizeCardAttachment.label" default="Max Filesize Card Attachment" />
		
	</label>
	<g:field type="number" name="maxFilesizeCardAttachment" value="${systemParametersInstance.maxFilesizeCardAttachment}" required="required" /> MB
</div>

<div class="fieldcontain ${hasErrors(bean: systemParametersInstance, field: 'allowedFileExtensionsAvatar', 'error')} ">
	<label for="allowedFileExtensionsAvatar">
		<g:message code="systemParameters.allowedFileExtensionsAvatar.label" default="Allowed File Extensions for Avatar" />
		
	</label>
	<g:textField name="allowedFileExtensionsAvatar" value="${systemParametersInstance?.allowedFileExtensionsAvatar}" required="required" />
</div>

<div class="fieldcontain ${hasErrors(bean: systemParametersInstance, field: 'resizeMinPixelAvatar', 'error')} ">
	<label for="resizeMinPixelAvatar">
		<g:message code="systemParameters.resizeMinPixelAvatar.label" default="Min Resizable Size for Avatar" />
	</label>
	<g:textField name="resizeMinPixelAvatar" value="${systemParametersInstance?.resizeMinPixelAvatar}" required="required" /> pixels
</div>

<div class="fieldcontain ${hasErrors(bean: systemParametersInstance, field: 'allowedFileExtensionsAttachment', 'error')} ">
	<label for="allowedFileExtensionsAttachment">
		<g:message code="systemParameters.allowedFileExtensionsAttachment.label" default="Allowed File Extensions for Attachment" />
		
	</label>
	<g:textField name="allowedFileExtensionsAttachment" value="${systemParametersInstance?.allowedFileExtensionsAttachment}" required="required" />
</div>