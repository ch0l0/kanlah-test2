<%@ page import="kanban.Status" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<title>Statistics Report</title>
	</head>
	<body>
		<a href="#list-shiroUser" class="skip" tabindex="-1"><g:message code="default.link.skip.label" default="Skip to content&hellip;"/></a>
		
		
		
		<div id="list-company" class="content scaffold-list" role="main">
			
			<h1> Statistics Report</h1>
			
			<div class="nav" role="navigation">
			<ul>
				<li>
					<g:form controller="statistics">
						Date Range: From <g:datePicker name="startDate" value="${startDate}" noSelection="['':'-Choose-']" precision="day" years="${2014..2114}" />
						 To <g:datePicker name="endDate" value="${endDate}" noSelection="['':'-Choose-']" precision="day" years="${2014..2114}" />
						<g:actionSubmit action="list" value="Submit" />
					</g:form>
				</li>
			</ul>
			</div>
			
			<g:if test="${flash.message}">
			<div class="message" role="status">${flash.message}</div>
			</g:if>
			
			<table>
				<thead>
					<tr>
						<th>Total Registered</th>
						<th>Total Verified</th>
						<th>Total Suspended</th>
						<th>Total Closed</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>${totalRegistered}</td>
						<td>${totalVerified}</td>
						<td>${totalSuspended}</td>
						<td>${totalClosed}</td>
					</tr>
				</tbody>
			</table>
			
		</div>
	</body>
</html>
