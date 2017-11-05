fa.models.feed = (function() {

	"use strict";


	// 
	// unpacking
	// 

	// creates a downstream feed item film object from an upstream json object
	// 
	// the feed item film objects contain only the fields: pk, title, posterUrl 
	// that is why we cannot use fa.models.films.unpackFilm here
	var unpackFilm = function(data) {
		return {
			pk: data.pk,
			title: data.title,
			posterUrl: data.poster_url
		};
	};

	// creates a downstream feed item object from an upstream json object
	var unpackItem = function(data) {
		var item = {
			created: fa.utils.humaniseTime(data.created)
		};

		item.type = {
			addedToWatched: (data.type == 'a'),
			addedToWatchlist: (data.type == 'u'),
			movedToWatchlist: (data.type == 'o'),
			addedToWatching: (data.type == 'i'),
			becameFriends: (data.type == 'f'),
			wroteComment: (data.type == 'c'),
			addedTags: (data.type == 't')
		};

		if(item.type.becameFriends) {
			item.userA = fa.models.users.unpackUser(data.user_a);
			item.userB = fa.models.users.unpackUser(data.user_b);
		}
		else {
			item.user = fa.models.users.unpackUser(data.user);
			item.film = unpackFilm(data.film);
			if(item.type.addedTags) {
				item.tags = data.tags;
			}
		}

		return item;
	};

	// creates a downstream feed object from an upstream json object
	// 
	// the page var keeps track of how many pages have been already loaded; it
	// counts from 0 as this is what the backend expects
	var createFeed = function(data) {
		var feed = {};
		var page = Math.ceil(data.items.length / 20) - 1;

		feed.firstItems = fjs.map(unpackItem, data.items);

		// resolves into a list of feed items
		feed.loadMore = function() {
			page += 1;
			return fa.ws.send('get_feed', {page: page, per_page: 20}).then(function(data) {
				return Promise.resolve(fjs.map(unpackItem, data.items));
			});
		};

		// returns the number of pages that have been loaded so far
		feed.getNumPages = function() {
			return page + 1;
		};

		return feed;
	};


	// 
	// downstream api
	// 

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
		unpackItem: unpackItem,

		get: getFeed
	};

}());
