var fa = (function() {
	
	"use strict";
	
	
	// the app's settings
	// the values here are the defauls values
	var settings = {
		DEBUG: true,
		API_URL: 'http://localhost:3000'  // no slash at the end
	};
	
	
	// sets the app's settings and inits all the modules that need initing
	// this function is intended to be called at the document.ready event
	var init = function(dict) {
		settings = fjs.assign(dict, settings);
		Object.freeze(settings);
		
		fa.routing.init();
	};
	
	
	return {
		init: init,
		settings: settings
	};
	
}());
