fa.search = (function() {
	
	"use strict";
	
	
	// 
	// functions
	// 
	
	// returns a promise resolving into a {type, items} object
	// 
	// type is either 'films' or 'users' and is used by the calling view to
	// determine which template to render
	// 
	// expects a raw query string
	var search = function(query) {
		return fa.ws.send('search', {query: query}).then(function(data) {
			if(data.hasOwnProperty('films')) {
				return Promise.resolve({
					type: 'films',
					items: data.films
				});
			}
			else if(data.hasOwnProperty('users')) {
				return Promise.resolve({
					type: 'users',
					items: fjs.map(fa.users._createUser, data.users)
				});
			}
			else return Promise.reject({code: 'bug', message: 'Unknown results'});
		});
	};
	
	
	// 
	// exports
	// 
	
	return {
		search: search
	};
	
}());
