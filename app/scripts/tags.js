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
	
	// returns a promise that resolves if the tags are successfully set and
	// rejects with an error otherwise
	// 
	// expects the id of the film that is being tagged and a [] of strings
	var setTags = function(filmId, tags) {
		return fa.ws.send('set_tags', {film: filmId, tags: tags});
	};
	
	
	// 
	// exports
	// 
	
	return {
		get: getTag,
		set: setTags
	};
	
}());
