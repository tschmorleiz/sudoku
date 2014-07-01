module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        files: {
          'public/javascripts/app.min.js': [
            'public/javascripts/handlebars.js',
            'public/javascripts/helpers/*.js',
            'public/javascripts/models/*.js',
            'public/javascripts/views/*.js'
          ],
          'public/javascripts/main.min.js': [
            'public/javascripts/main.js'
          ]
        }
        
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['uglify']);
};

