/* ѣ */
var gulp = require('gulp');


// delete build/*
var del = require('del');

gulp.task('clean', function(callback) {
	del(['build/**'], callback);
});


// move html
gulp.task('html', function() {
	gulp.src('app/*.html')
		.pipe(gulp.dest('build'))
		.pipe(connect.reload());
	gulp.src('app/templates/*.html')
		.pipe(gulp.dest('build/templates'))
		.pipe(connect.reload());
});


// move images
gulp.task('images', function() {
	gulp.src('app/images/**/*')
		.pipe(gulp.dest('build/images'));
});


// process css
var stylus = require('gulp-stylus');

gulp.task('stylus', function() {
	gulp.src('app/styles/*.styl')
		.pipe(stylus())
		.pipe(gulp.dest('build/styles'))
		.pipe(connect.reload());
});


// process js
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('scripts', function() {
	gulp.src([
			'app/scripts/fa.js',
			'app/scripts/**/*.js'
		])
		/*.pipe(uglify({
			mangle: false
		}))*/
		.pipe(concat('fa.js'))
		.pipe(gulp.dest('build/scripts'));
});


// move bower components
gulp.task('bower', function() {
	gulp.src([
		'bower_components/normalize-css/normalize.css'
		])
		.pipe(concat('vendor.css'))
		.pipe(gulp.dest('build/styles'));
	/*gulp.src([
			'bower_components/jquery/dist/jquery.min.js',
			'bower_components/jquery-validation/dist/jquery.validate.min.js',
			'bower_components/js-signals/dist/signals.min.js',
			'bower_components/hasher/dist/js/hasher.min.js',
			'bower_components/crossroads/dist/crossroads.min.js',
			'bower_components/knockout/dist/knockout.js',
			'bower_components/dexie/dist/latest/Dexie.min.js',
			'bower_components/mousetrap/mousetrap.min.js',
			'bower_components/pythonic-datetime/build/datetime.js'
		])
		.pipe(concat('vendor.js'))
		.pipe(gulp.dest('build/scripts'));*/
});


// connect server
var connect = require('gulp-connect');

gulp.task('connect', function() {
	connect.server({
		root: 'build',
		port: 9000,
		livereload: true
	});
});


// what to watch for
gulp.task('watch', function() {
	gulp.watch('app/*.html', ['html']);
	gulp.watch('app/templates/*.html', ['html']);
	gulp.watch('app/styles/*.styl', ['stylus']);
	gulp.watch('app/scripts/**/*.js', ['scripts']);
});


// the default task
gulp.task('default', ['clean'], function() {
	gulp.start([
		'bower',
		'html',
		'images',
		'stylus',
		'scripts',
		'connect',
		'watch'
	]);
});
