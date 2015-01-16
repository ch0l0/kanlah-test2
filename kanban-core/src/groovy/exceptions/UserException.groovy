package exceptions

class UserException extends Exception {
	public UserException(def message) {
		super(message);
	}
	public UserException(def message,def throwable) {
		super(message, throwable);
	}
	public String getMessage()
	{
		return super.getMessage();
	}
}
