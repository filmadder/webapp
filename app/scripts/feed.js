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
			wroteComment: (data.type == 'c'),
			addedTags: (data.type == 't')
		};
		
		if(item.type.becameFriends) {
			item.userA = data.user_a;
			item.userB = data.user_b;
		}
		else {
			item.user = data.user;
			item.film = data.film;
			if(item.type.addedTags) {
				item.tags = data.tags;
			}
		}
		
		return item;
	};
	
	// constructs and returns a feed object from the backend-provided data
	// 
	// the page var keeps track of how many pages have been already loaded; it
	// counts from 0 as this is what the backend expects
	var createFeed = function(data) {
		var feed = {};
		var page = Math.ceil(data.items.length / 20) - 1;
		
		feed.firstItems = fjs.map(createItem, data.items);
		
		// resolves into a list of feed items
		feed.loadMore = function() {
			page += 1;
			return fa.ws.send('get_feed', {page: page, per_page: 20}).then(function(data) {
				return Promise.resolve(fjs.map(createItem, data.items));
			});
		};
		
		// returns the number of pages that have been loaded so far
		feed.getNumPages = function() {
			return page + 1;
		};
		
		return feed;
	};
	
	// returns promise that resolves into a feed object
	// 
	// if given, the argument specifies the number of pages that the feed will
	// start with; by default a single page of feed items will be loaded
	var getFeed = function(pages) {
		var perPage = (pages) ? 20 * pages : 20;
		
		return fa.ws.send('get_feed', {page: 0, per_page: perPage}).then(function(data) {
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
