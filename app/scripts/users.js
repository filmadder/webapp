fa.users = (function() {
	
	"use strict";
	
	
	// 
	// functions
	// 
	
	// constructs and returns a user object from the backend-provided data
	// helper for createProfile()
	var createUser = function(data) {
		return {
			pk: data.pk,
			name: data.name,
			avatarUrl: fa.settings.HTTP_API_URL + data.avatar_url
		};
	};
	
	// constructs and returns a profile object from the backend-provided data
	// helper for getUser()
	var createProfile = function(data) {
		var user = createUser(data.user);
		
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
			user.friends = fjs.map(createUser, data.friends);
			user.tags = data.tags;
		}
		
		return user;
	};
	
	// returns a promise that resolves into a user object
	var getUser = function(id) {
		return fa.ws.send('get_user', {user: id}).then(function(data) {
			return Promise.resolve(createProfile(data));
		});
	};
	
	
	// 
	// exports
	// 
	
	return {
		_createUser: createUser,
		
		get: getUser
	};
	
}());
