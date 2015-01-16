// Project configuration.
module.exports = function(grunt) {
var pkg = grunt.file.readJSON('./package.json');
grunt.initConfig({
	concat: {
		options: {
			separator: ';',
			//banner: "/* Copyright (C) Leo Tech Services Pte Ltd - All Rights Reserved\n* Unauthorized copying of this file, via any medium is strictly prohibited\n* Proprietary and confidential\n* Written by Leo Tech Services Pte Ltd, December 2014\n*/\n",
			banner: "/* Kanlah is a project which was started by Leo Tech Services Pte Ltd but is now an open source project covered by a Creative Commons Non-commercial, Attribution, Share-alike license.\n*  Find out more at http://www.GitHub.com/Kanlah.\n*/\n",
			stripBanners: {
				block: true,
				line: true
			}
		},
		libs: {
			src: [
				'bower_components/angular/angular.js',
				'bower_components/angular-route/angular-route.min.js',
				'bower_components/angular-sanitize/angular-sanitize.js',
				'bower_components/angular-resource/angular-resource.js',
				'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
				'bower_components/angular-dialog-service/dialogs.js',
				'bower_components/angular-placeholder-shim/angular-placeholder-shim.js',
				'bower_components/jquery/jquery.js',
				'bower_components/parsleyjs/parsley.js',
				'bower_components/moment/min/moment.min.js',
				'bower_components/bootstrap/dist/js/bootstrap.min.js',
				'bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
				'bower_components/angular-growl/build/angular-growl.min.js'
			],
			dest: 'dist/libs.js',
		},
		kbn: {
			src: [
				'js/angular-util.js',
				'js/lib/**/*.js',
				'bower_components/jqueryui-touch-punch/jquery.ui.touch-punch.min.js',
				'js/app.js',
				'js/router.js',
				'js/filters.js',
				'js/controllers/*.js',
				'js/controllers/**/*.js',
				'js/directives/*.js',
				'js/model/*.js',
				'js/services/*.js',
				'js/services/Storage/*.js',
				'js/common/*.js'
			],
			dest: 'dist/kbn.js',
		}
	},
	uglify: {
		options: {
			//banner: "/* Copyright (C) Leo Tech Services Pte Ltd - All Rights Reserved\n* Unauthorized copying of this file, via any medium is strictly prohibited\n* Proprietary and confidential\n* Written by Leo Tech Services Pte Ltd, March 2014\n*/\n",
			banner: "/* Kanlah is a project which was started by Leo Tech Services Pte Ltd but is now an open source project covered by a Creative Commons Non-commercial, Attribution, Share-alike license.\n*  Find out more at http://www.GitHub.com/Kanlah.\n*/\n",
			compress: {
				drop_console: true
			}
		},
		dist: {
			files: {
				'dist/kbn.min.js': ['<%= concat.libs.dest %>','<%= concat.kbn.dest %>']
				//'dist/kbn.min.js': ['<%= concat.kbn.dest %>']
			}
		}
	},
	cssmin: {
		combine: {
			options: {
				//banner: "/* Copyright (C) Leo Tech Services Pte Ltd - All Rights Reserved\n* Unauthorized copying of this file, via any medium is strictly prohibited\n* Proprietary and confidential\n* Written by Leo Tech Services Pte Ltd, March 2014\n*/\n",
				banner: "/* Kanlah is a project which was started by Leo Tech Services Pte Ltd but is now an open source project covered by a Creative Commons Non-commercial, Attribution, Share-alike license.\n*  Find out more at http://www.GitHub.com/Kanlah.\n*/\n",
			},
			files: {
				'dist/kbn.min.css': [
					'css/bootstrap.css',
					'css/font-awesome.min.css',
					'css/ui-lightness/jquery-ui-1.10.4.custom.css',
					'css/bootstrap-datetimepicker.min.css',
					'css/angular-growl.min.css',
					'css/style.css'
				]
			}
		}
	},
	watch: {
		files: ['js/**/*','css/**/*'],
		tasks: ['min']
	}
});

grunt.registerTask('min', ['concat','uglify', 'cssmin']);
grunt.registerTask('dev', ['watch']);

grunt.loadNpmTasks('grunt-contrib-clean')
grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-connect');
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-curl');
grunt.loadNpmTasks('grunt-replace');
grunt.loadNpmTasks('grunt-contrib-cssmin');

};