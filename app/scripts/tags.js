fa.tags = (function() {
	
	"use strict";
	
	
	// 
	// functions
	// 
	
	// returns a promise that resolves into a tag object
	// 
	// the latter is just the backend data as no additional transformations are
	// needed at the time of first writing the module
	// 
	// expects a string
	var getTag = function(tag) {
		return fa.ws.send('get_tag', {tag: tag}).then(function(data) {
			return Promise.resolve(data);
		});
	};
	
	
	// 
	// exports
	// 
	
	return {
		get: getTag
	};
	
}());
