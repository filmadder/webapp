fa.search = (function() {
	
	"use strict";
	
	
	// 
	// functions
	// 
	
	// constructs and returns a user object from the backend-provided data
	// helper for search()
	// 
	// this is identical to fa.users.createUser
	var createUser = function(data) {
		return {
			pk: data.pk,
			name: data.name,
			avatarUrl: fa.settings.HTTP_API_URL + data.avatarUrl
		};
	};
	
	// returns a promise resolving into a {type, items} object
	// 
	// type is either 'films' or 'users' and is used by the calling view to
	// determine which template to render
	// 
	// expects a raw query string
	var search = function(query) {
		return fa.ws.send('search', {query: query}).then(function(data) {
			if(data.hasOwnProperty('films')) {
				return Promise.resolve({type: 'films', items: data.films});
			}
			else if(data.hasOwnProperty('users')) {
				return Promise.resolve({type: 'users', items: fjs.map(createUser, data.users)});
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
