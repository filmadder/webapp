fa.models.tags = (function() {

	"use strict";


	//
	// variables
	//

	// list of the user's own tags
	// used for providing suggestions for film tagging
	var ownTags = ['stela', 'ste', 'stella', 'sajo'];


	// 
	// downstream api
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

	// returns the subset (as a sorted []) of the user's own tags that start
	// with the given string
	//
	// used for providing suggestions for film tagging
	var suggestTags = function(string) {
		var res = [];

		if(string.length > 0) {
			res = fjs.filter(function(tag) {
				return tag.indexOf(string) == 0;
			}, ownTags);

			if(res.length == 1) {
				if(res[0] == string) {
					res = [];
				}
			} else if(res.length > 1) {
				res.sort();
			}
		}

		return res;
	};


	// 
	// exports
	// 

	return {
		get: getTag,
		set: setTags,
		suggest: suggestTags
	};

}());
