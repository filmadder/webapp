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
			name: data.user.name
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
		else if(user.status.friend || user.status.self) {
			user.filmsPast = data.films_past;
			user.filmsFuture = data.films_future;
			user.friends = data.friends;
		}
		
		return user;
	};
	
	// returns a promise that resolves into a user object
	var getUser = function(id) {
		return fa.ws.send('get_user', {user: id}).then(function(data) {
			return Promise.resolve(createUser(data));
		});
	};
	
	// returns a promise that resolves into a {query, users} object
	var searchUsers = function(query) {
		return fa.ws.send('search_users', {query: query});
	};
	
	
	// 
	// exports
	// 
	
	return {
		get: getUser,
		search: searchUsers
	};
	
}());
