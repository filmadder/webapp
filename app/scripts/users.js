fa.users = (function() {

	"use strict";


	// 
	// unpacking
	// 

	// creates a downstream short user object from an upstream json object
	// 
	// a short user object contains only a subset of the fields and is used in
	// listings, including search results
	var unpackUser = function(data) {
		return {
			pk: data.pk,
			name: data.name,
			avatarUrl: fa.settings.HTTP_API_URL + data.avatar_url
		};
	};

	// creates a downstream long user object from an upstream json object
	// 
	// long user objects are only used in profile views
	var createProfile = function(data) {
		var user = unpackUser(data.user);

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
			user.friends = fjs.map(unpackUser, data.friends);
			user.tags = data.tags;
		}

		return user;
	};


	// 
	// downstream api
	// 

	// returns a promise that resolves into a long user object
	var getUser = function(id) {
		return fa.ws.send('get_user', {user: id}).then(function(data) {
			return Promise.resolve(createProfile(data));
		});
	};


	// 
	// exports
	// 

	return {
		unpackUser: unpackUser,

		get: getUser
	};

}());
