fa.users = (function() {
	
	"use strict";
	
	
	// 
	// constructors
	// 
	
	var createUser = function(data) {
		var user = {};
		
		for(var prop in ['id', 'name']) {
			if(!data.hasOwnProperty(prop)) {
				throw new Error('Could not deserialise user');
			}
		}
		
		user.id = data.id;
		user.name = data.name;
		
		return user;
	};
	
	
	// 
	// exports
	// 
	
	return {
		create: createUser
	};
	
}());
