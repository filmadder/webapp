fa.search = (function() {
	
	"use strict";
	
	
	// 
	// functions
	// 
	
	// checks whether the given string is a bang
	// a bang is a string starting or ending with !
	var isBang = function(string) {
		if(string[0] == '!' || string[string.length-1] == '!') {
			string = (string[0] == '!') ? string.slice(1) : string.slice(0, -1);
			return fjs.any(function(x) {return x === string;}, ['u', 'user']);
		}
		return false;
	};
	
	// returns a promise resolving into a {type, items} object
	// expects a query string
	var search = function(query) {
		var tokens = fjs.filter('x => x.length > 0', query.split(' '));
		var parts = fjs.partition(isBang, tokens);
		var bangs = parts[0]; tokens = parts[1];
		
		if(bangs.length == 1) {  // there is only the user bang now
			return fa.users.search(fjs.reduce('x, y => x+" "+y', tokens)).then(function(data) {
				return Promise.resolve({type: 'users', items: data.users});
			});
		}
		else {
			return fa.films.search(query).then(function(data) {
				return Promise.resolve({type: 'films', items: data.films});
			});
		}
	};
	
	
	// 
	// exports
	// 
	
	return {
		search: search
	};
	
}());
