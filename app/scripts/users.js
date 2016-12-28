fa.users = (function() {
	
	"use strict";
	
	
	// 
	// functions
	// 
	
	// returns promise that resolves into a user object
	var getUser = function(id) {
		return fa.ws.send('get_user', {user: id});
	};
	
	
	// 
	// exports
	// 
	
	return {
		get: getUser
	};
	
}());
