fa.feed = (function() {
	
	"use strict";
	
	
	// 
	// functions
	// 
	
	// returns promise that resolves into a feed object
	var getPage = function(page) {
		return fa.ws.send('get_feed', {page: page});
	};
	
	
	// 
	// exports
	// 
	
	return {
		getPage: getPage
	};
	
}());
