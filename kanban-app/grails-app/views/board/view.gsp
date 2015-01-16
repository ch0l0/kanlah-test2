<ol class="property-list board">

    Board Name: ${boardInstance?.name} <br/>
    Board Description: ${boardInstance?.name}

    <g:if test="${boardInstance?.columns}">
        <g:each in="${boardInstance.columns}" var="c">
            <div style="border:1px solid #000000; padding: 10px">
            <span><g:link controller="column" action="show" id="${c.id}">${c.name}</g:link></span>
            </div>
        </g:each>
    </g:if>

</ol>