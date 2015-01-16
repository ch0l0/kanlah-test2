package editor

import java.text.DateFormat
import java.text.SimpleDateFormat

import org.codehaus.groovy.grails.commons.GrailsApplication
import org.codehaus.groovy.grails.plugins.support.aware.GrailsApplicationAware
import org.springframework.beans.PropertyEditorRegistrar
import org.springframework.beans.PropertyEditorRegistry
import org.springframework.beans.propertyeditors.CustomDateEditor
import org.springframework.beans.propertyeditors.StringTrimmerEditor

public class CustomPropertyEditorRegistrar implements PropertyEditorRegistrar, GrailsApplicationAware {
	def grailsApplication
	
	public void setGrailsApplication(GrailsApplication grailsApplication) {
		this.grailsApplication = grailsApplication
		
	}
	
	public void registerCustomEditors(PropertyEditorRegistry registry) {
		def dateFormats = grailsApplication.config.kanban.customProperties.dateFormats
		
		dateFormats.each { dateFormat  ->
			DateFormat formatter = new SimpleDateFormat(dateFormat)
			formatter.lenient = false
			registry.registerCustomEditor(Date, new CustomDateEditor(formatter, true))
		}		
		
		registry.registerCustomEditor(String.class, new StringTrimmerEditor(true));
    }
}