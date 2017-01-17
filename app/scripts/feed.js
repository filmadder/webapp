fa.feed = (function() {
	
	"use strict";
	
	
	// 
	// functions
	// 
	
	// constructs and returns a feed item object from the backend data
	var createItem = function(data) {
		var item = {
			created: fa.utils.humaniseTime(data.created)
		};
		
		item.type = {
			addedToWatched: (data.type == 'a'),
			addedToWatchlist: (data.type == 'u'),
			becameFriends: (data.type == 'f'),
			wroteComment: (data.type == 'c')
		};
		
		if(item.type.becameFriends) {
			item.userA = data.user_a;
			item.userB = data.user_b;
		}
		else {
			item.user = data.user;
			item.film = data.film;
		}
		
		return item;
	};
	
	// constructs and returns a feed object from the backend-provided data
	var createFeed = function(data) {
		var feed = {};
		var page = 0;
		
		feed.firstItems = fjs.map(createItem, data.items);
		
		// resolves into a list of feed items
		feed.loadMore = function() {
			page += 1;
			return fa.ws.send('get_feed', {page: page}).then(function(data) {
				return Promise.resolve(fjs.map(createItem, data.items));
			});
		};
		
		return feed;
	};
	
	// returns promise that resolves into a feed object
	var getFeed = function() {
		return fa.ws.send('get_feed', {page: 0}).then(function(data) {
			return Promise.resolve(createFeed(data));
		});
	};
	
	
	// 
	// exports
	// 
	
	return {
		get: getFeed
	};
	
}());
