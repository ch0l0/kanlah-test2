- run "bower install" whenever new js components has been added
- js/angular-util.js - should contains all the utility functions
- js/directives/toggle-on-authenticated.js - directive to show/hide elements when authenticated or not authenticated
- any modal requirements (error, confirm, ctrl+template), can just use angular-modal-service - sample use js/controllers/Account/InfoCtrl.js

	growl.addWarnMessage("This adds a warn message");
        growl.addInfoMessage("This adds a info message");
        growl.addSuccessMessage("This adds a success message");
        growl.addErrorMessage("This adds a error message");
