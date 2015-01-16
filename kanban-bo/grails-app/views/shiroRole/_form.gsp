<%@ page import="kanban.ShiroRole" %>

<div class="fieldcontain ${hasErrors(bean: shiroRoleInstance, field: 'name', 'error')} ">
	<label for="name">
		<g:message code="shiroRole.name.label" default="Name" />
		
	</label>
	<g:textField name="name" value="${shiroRoleInstance?.name}" />
</div>
<!--  
<div class="fieldcontain ${hasErrors(bean: shiroRoleInstance, field: 'access', 'error')} ">
	<label for="access">
		<g:message code="shiroRole.access.label" default="Access" />
		
	</label>
	<g:select name="access" from="${kanban.BOAccess.values()}" multiple="multiple" optionKey="value" size="5" required="" value="${shiroUserInstance?.access*.value}" class="many-to-many" optionValue="title"/>
</div>
-->
<!--  
<div class="fieldcontain ${hasErrors(bean: shiroRoleInstance, field: 'permissions', 'error')} ">
	<label for="permissions">
		<g:message code="shiroRole.permissions.label" default="Permissions" />
		
	</label>
	
</div>

<div class="fieldcontain ${hasErrors(bean: shiroRoleInstance, field: 'users', 'error')} ">
	<label for="users">
		<g:message code="shiroRole.users.label" default="Users" />
		
	</label>
	
</div>
-->
