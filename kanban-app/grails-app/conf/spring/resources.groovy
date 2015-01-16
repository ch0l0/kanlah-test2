import editor.CustomPropertyEditorRegistrar

// Place your Spring DSL code here
beans = {
	customPropertyEditorRegistrar(CustomPropertyEditorRegistrar) { bean ->
		bean.autowire = "byName"
	}
}
