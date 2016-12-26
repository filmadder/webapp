var fa = (function() {
	
	"use strict";
	
	
	// the app's settings
	// the values here are the defauls values
	var settings = {
		DEBUG: true,
		HTTP_API_URL: 'https://api.filmadder.com',  // no slash at the end
		SOCKET_API_URL: 'wss://api.filmadder.com/socket'   // no slash at the end
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
