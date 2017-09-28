var fa = (function() {

	"use strict";


	//
	// settings
	//

	// the default settings
	var defaultSettings = {
		HTTP_API_URL: 'https://api.filmadder.com',  // no slash at the end
		SOCKET_API_URL: 'wss://api.filmadder.com/socket'   // no slash at the end
	};

	// creates and returns a settings object
	// the returned object is globally accessible through fa.settings
	var initSettings = function() {
		var settings = fjs.assign(defaultSettings, {});

		// allows developers to overwrite certain settings and to persist the
		// overwritten values in localStorage, not unlike what loglevel does
		//
		// throws an error if the key is unrecognised
		settings.overwrite = function(key, value) {
			var key, stored = {};

			if(!defaultSettings.hasOwnProperty(key)) {
				throw new Error('unrecognised setting');
			}

			settings[key] = value;

			for(key in defaultSettings) {
				if(defaultSettings.hasOwnProperty(key)) {
					stored[key] = settings[key];
				}
			}

			try {
				localStorage.setItem('fa_settings', JSON.stringify(stored));
			} catch (e) {
				log.warn(e);
			}
		};

		// resets any previously overwritten settings to the default values
		settings.reset = function() {
			var key;

			for(key in defaultSettings) {
				if(defaultSettings.hasOwnProperty(key)) {
					settings[key] = defaultSettings[key];
				}
			}

			try {
				localStorage.removeItem('fa_settings');
			} catch (e) {
				log.warn(e);
			}
		};

		// loads any previously stored settings from localStorage, if any
		// invoked in the init function below
		settings.loadFromStorage = function() {
			var key, stored;

			try {
				stored = localStorage.getItem('fa_settings');
				if(stored) {
					stored = JSON.parse(stored);
					for(key in stored) {
						if(defaultSettings.hasOwnProperty(key)) {
							settings[key] = stored[key];
						}
					}
				}
			} catch (e) {
				log.warn(e);
			}
		};

		return settings;
	};

	// the settings object, globally accessible through fa.settings
	var settings = initSettings();


	//
	// app state
	//

	// inits the sub-modules and external libraries that need initing
	// this function is intended to be called at the document.ready event
	var init = function() {

		// this is experimental behaviour that breaks our fa.history scroll
		// restoration, so we disable it
		window.history.scrollRestoration = 'manual';

		// in production only errors will be logged
		// use log.setLevel('trace') for development
		log.setDefaultLevel('error');

		// load locally overwritten settings, if any
		settings.loadFromStorage();

		// the only fa module that needs explicit initing
		fa.routing.init();
	};


	//
	// utils
	//

	// expects a json datetime string and returns an {ago, iso} object of
	// human-friendly strings
	var humaniseTime = function(jsonString) {
		var dt = datetime.datetime.fromtimestamp(Date.parse(jsonString) / 1000);
		var delta = datetime.datetime.now().subtract(dt);
		var ago = '';

		if(delta.days) {
			ago = (delta.days == 1)
					? delta.days+' day ago' : delta.days+' days ago';
		}
		else if(delta.seconds / 3600 >= 1) {
			ago = Math.floor(delta.seconds / 3600);
			ago = (ago == 1) ? ago+' hour ago' : ago+' hours ago';
		}
		else {
			ago = Math.floor(delta.seconds / 60);
			ago = (ago == 1) ? ago+' minute ago' : ago+' minutes ago';
		}

		return {
			ago: ago,
			iso: dt.strftime('%Y-%m-%d %H:%M')
		};
	};


	//
	// module exports
	//

	return {
		init: init,
		settings: settings,
		utils: {
			humaniseTime: humaniseTime
		}
	};

}());
