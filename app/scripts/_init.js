/**
 * The god module.
 * 
 * Apart from serving as container for all modules, q has a function on its
 * own: init(). The latter would inits the film adder webapp by initing all the
 * necessary modules.
 * 
 * A little bit about the modular structure: no module will do anything before
 * being inited. Also, modules are able to clean up after themselves. This
 * behaviour makes unit testing easier and it means that each first-tier module implements
 * its own init() and destroy() functions which are publicly accessible.
 * However, this is relevant for first-tier modules only; what happens in
 * second-tier modules is responsibility of their parent modules.
 */
var fa = (function() {
	
	"use strict";
	
	
	/**
	 * The settings. Once set in the init() function, these are frozen.
	 * The values here are the default values.
	 */
	var settings = {
		DEBUG: true,
		API_URL: 'localhost:8000'
	};
	
	
	/**
	 * Sets the settings and inits all the modules that need initing.
	 * This function is intended to be called at the document.ready event.
	 * 
	 * @param The settings.
	 */
	var init = function(dict) {
		var item;
		
		for(item in dict) {
			if(item in settings) {
				settings[item] = dict[item];
			}
		}
		
		Object.freeze(settings);
		
		/**
		 * Enable the cross-module communication infrastructure.
		 */
		fa.comm.init();
		
		/**
		 * Enable the server communication and local storage.
		 */
		fa.db.init();
		
		/**
		 * Enable the UI.
		 */
		fa.ui.init();
	};
	
	
	/**
	 * Module exports.
	 */
	return {
		init: init,
		settings: settings
	};
	
}());
