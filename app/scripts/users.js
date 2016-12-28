fa.users = (function() {
	
	"use strict";
	
	
	// 
	// functions
	// 
	
	// constructs and returns a user object from the backend-provided data
	// helper for getUser()
	var createUser = function(data) {
		var user = {
			pk: data.user.pk,
			name: data.user.name,
			filmsPast: data.films_past,
			filmsFuture: data.films_future,
			friends: data.friends
		};
		
		user.status = {
			unknown: (data.friendship_status == 'u'),
			waiting: (data.friendship_status == 'r'),
			asked: (data.friendship_status == 'v'),
			friend: (data.friendship_status == 'f'),
			self: (data.friendship_status == 's')
		};
		
		if(user.status.unknown) {
			user.requestFriendship = function() {
				return fa.ws.send('request_friendship', {user: user.pk});
			};
		}
		else if(user.status.waiting) {
			user.acceptFriendship = function() {
				return fa.ws.send('accept_friendship', {user: user.pk});
			};
			user.rejectFriendship = function() {
				return fa.ws.send('reject_friendship', {user: user.pk});
			};
		}
		
		return user;
	};
	
	// returns promise that resolves into a user object
	var getUser = function(id) {
		return fa.ws.send('get_user', {user: id}).then(function(data) {
			return Promise.resolve(createUser(data));
		});
	};
	
	
	// 
	// exports
	// 
	
	return {
		get: getUser
	};
	
}());
