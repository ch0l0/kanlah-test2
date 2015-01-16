<%@ page import="kanban.Board" %>



<div class="fieldcontain ${hasErrors(bean: boardInstance, field: 'description', 'error')} ">
	<label for="description">
		<g:message code="board.description.label" default="Description" />
		
	</label>
	<g:textField name="description" value="${boardInstance?.description}" />
</div>

<div class="fieldcontain ${hasErrors(bean: boardInstance, field: 'name', 'error')} ">
	<label for="name">
		<g:message code="board.name.label" default="Name" />
		
	</label>
	<g:textField name="name" value="${boardInstance?.name}" />
</div>

<div class="fieldcontain ${hasErrors(bean: boardInstance, field: 'task', 'error')} ">
	<label for="task">
		<g:message code="board.task.label" default="Task" />
		
	</label>
	
<ul class="one-to-many">
<g:each in="${boardInstance?.task?}" var="t">
    <li><g:link controller="column" action="show" id="${t.id}">${t?.encodeAsHTML()}</g:link></li>
</g:each>
<li class="add">
<g:link controller="column" action="create" params="['board.id': boardInstance?.id]">${message(code: 'default.add.label', args: [message(code: 'column.label', default: 'Column')])}</g:link>
</li>
</ul>

</div>

