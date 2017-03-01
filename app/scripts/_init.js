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
		
		// this is experimental behaviour that breaks our fa.history scroll
		// restoration, so we disable it
		window.history.scrollRestoration = 'manual';
		
		fa.routing.init();
	};
	
	
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
	
	
	return {
		init: init,
		settings: settings,
		utils: {
			humaniseTime: humaniseTime
		}
	};
	
}());
