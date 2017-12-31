// by default karma on linux looks for `firefox`, no matter which flavour of
// firefox is selected
process.env.FIREFOX_DEVELOPER_BIN = 'firefox-developer';

module.exports = function(config) {
	config.set({

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '',

		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['qunit'],

		// list of files / patterns to load in the browser
		files: [
			'app/templates/**/*.html',
			'build/scripts/vendor.js',
			'build/scripts/fa.js',
			'node_modules/sinon/pkg/sinon.js',
			'node_modules/mock-socket/dist/mock-socket.js',
			'tests/**/*.js'
		],

		// list of files to exclude
		exclude: [],

		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			'app/templates/**/*.html': ['html2js']
		},

		html2JsPreprocessor: {
			stripPrefix: 'app/templates/',
			processPath: function(path) {
				return path
					.replace(/^app\/templates\//, '')
					.replace(/\.html$/, '')
					.replace(/\//g, '-') + '-templ';
			}
		},

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['progress'],

		// web server port
		port: 9876,

		// enable / disable colors in the output (reporters and logs)
		colors: true,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,

		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: ['FirefoxDeveloperHeadless'],

		customLaunchers: {
			FirefoxHeadless: {
				base: 'Firefox',
				flags: ['-headless']
			},
			FirefoxDeveloperHeadless: {
				base: 'FirefoxDeveloper',
				flags: ['-headless']
			}
		},

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: true,

		// Concurrency level
		// how many browser should be started simultaneously
		concurrency: Infinity
	})
}
