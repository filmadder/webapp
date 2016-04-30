var gulp = require('gulp');


// process css
var less = require('gulp-stylus');

gulp.task('stylus', function() {
  gulp.src('warehouse/*.styl')
    .pipe(less())
    .pipe(gulp.dest('export'))
	.pipe(connect.reload());
});


// connect server
var connect = require('gulp-connect');

gulp.task('connect', function() {
	connect.server({
		root: '.',
		port: 9000,
		livereload: true
	});
});


// what to watch for
gulp.task('watch', function() {
	gulp.watch('warehouse/*.styl', ['stylus']);
});


// the default task
gulp.task('default', function() {
	gulp.start([
		'stylus',
		'connect',
		'watch'
	]);
});
