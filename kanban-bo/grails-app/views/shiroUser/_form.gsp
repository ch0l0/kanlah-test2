<%@ page import="kanban.ShiroUser" %>

<div class="fieldcontain ${hasErrors(bean: shiroUserInstance, field: 'username', 'error')} ">
	<label for="username">
		<g:message code="shiroUser.username.label" default="Username" />
		
	</label>
	<g:textField name="username" value="${shiroUserInstance?.username}" required="required"/>
</div>

<div class="fieldcontain ${hasErrors(bean: shiroUserInstance, field: 'name', 'error')} ">
	<label for="name">
		<g:message code="shiroUser.name.label" default="Name" />
		
	</label>
	<g:textField name="name" value="${shiroUserInstance?.name}" />
</div>

<div class="fieldcontain ${hasErrors(bean: shiroUserInstance, field: 'name', 'error')} ">
	<label for="email">
		<g:message code="shiroUser.email.label" default="Email" />
		
	</label>
	<g:textField name="email" value="${shiroUserInstance?.email}" />
</div>

<div class="fieldcontain ${hasErrors(bean: shiroUserInstance, field: 'passwordHash', 'error')} ">
	<g:if test="${shiroUserInstance?.passwordHash == null}">
	<label for="passwordHash">
		<g:message code="shiroUser.passwordHash.label" default="Password" />
	</label>
	<g:field type="password" name="passwordHash" value="${shiroUserInstance?.passwordHash}" maxlength="15" required="required"/>
	</g:if>
	<g:else>
	<label for="passwordHash">
		<g:message code="shiroUser.passwordHash.label" default="New Password" />
	</label>
	<g:field type="password" name="passwordHash" value="" maxlength="15" required="required"/>
	</g:else>
</div>


<div class="fieldcontain ${hasErrors(bean: shiroUserInstance, field: 'roles', 'error')} ">
	<label for="roles">
		<g:message code="shiroUser.roles.label" default="Roles" />
	</label>
	<%--  
	<g:select name="roles" from="${kanban.ShiroRole.list()}" multiple="multiple" optionKey="id" size="5" required="" value="${shiroUserInstance?.roles*.id}" class="many-to-many" optionValue="name"/>
	--%>
	<g:select name="roles" from="${kanban.ShiroRole.list()}" optionKey="id" size="5" required="required" value="${shiroUserInstance?.roles*.id}" optionValue="name"  />
</div>



