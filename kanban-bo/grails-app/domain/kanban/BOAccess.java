package kanban;

public enum BOAccess {
	COMPANY_ACTIVATE(1, "Enable/Suspend Account", new String[]{"project:enable", "project:suspend"}), 
	COMPANY_DEACTIVATE(2, "Close Account", new String[]{"project:close"}), 
	VIEW_REPORTS(3, "Reports", new String[]{"statistics:index", "statistics:list"}),
	VIEW_CONFIG(4, "View Config", new String[]{"systemParameters:index", "systemParameters:list"}),
	EDIT_CONFIG(5, "Edit Config", new String[]{"systemParameters:index", "systemParameters:list", "systemParameters:edit", "systemParameters:update"}),
	BO_USERS(6, "BO User Management", new String[]{"shirouser:*"}),
	BO_ROLES(7, "BO Role Management", new String[]{"shirorole:*"})
	;
	
	private int value;
	private String title;
	private String[] permission;
	
	BOAccess(int value, String title, String[] permission) {
		this.value = value;
		this.title = title;
		this.permission = permission;
	}
	
	public String title() {
		return title;
	}
	
	public String[] permission() {
		return permission;
	}
	
	public int value() {
		return value;
	}
	
	
	
}
