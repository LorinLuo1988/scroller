/**
* Created by doyen on 2015/10/28.
*/
module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			all: ['scroller/*.js']
		},
		watch: {
			scripts: {
				files: ['scroller/scroller.js'],
				tasks: ['jshint']
			},
			livereload: {
				options: {
					livereload: '<%= connect.options.livereload %>'
				},
				files: ['index.html','index.css', 'scroller.js']
			}
		},
		connect: {
			options: {
				port: 8001,
				open: true,
				livereload: 8765,
				base: './',
				hostname: 'localhost'
			},
			server: {
				options: {
					onCreateServer: function (server, connect, options) {
						console.log(options)
					}
				}
			}
		},
		copy: {
			file: {
				src: ['index.html', 'index.css', 'jquery-1.8.3.js', 'scroller.js'],
				dest: 'dest/'
			}
		},
		uglify: {
			my_target: {
				files: {
					'dest/scroller/scroller.min.js': ['dest/scroller.js']
				}
			}
		},
		clean: {
			js: ["dest/scroller.js", "!dest/scroller/*.min.js"]
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.registerTask("work", ['jshint', 'connect', 'watch']);
	grunt.registerTask("build", ['copy', 'uglify', 'clean']);
};




