fa.updates = (function() {
	
	"use strict";
	
	
	// 
	// push receivers
	// 
	
	// dispatches when the server sends push notification about new unread
	// update item(s)
	var gotUnread = new signals.Signal();
	
	fa.ws.received.add(function(message) {
		if(message.type == 'new_update') {
			gotUnread.dispatch();
		}
	});
	
	
	// 
	// unpacking
	// 
	
	// creates a downstream update item object from an upstream json object
	var unpackItem = function(data) {
		var item = {
			created: fa.utils.humaniseTime(data.created)
		};
		
		item.type = {
			newFriend: (data.type == 'f'),
			newFriendReq: (data.type == 'q'),
			newReply: (data.type == 'r')
		};
		
		if(item.type.newFriend || item.type.newFriendReq) {
			item.user = fa.users.unpackUser(data.user);
		}
		else if(item.type.newReply) {
			item.user = fa.users.unpackUser(data.user);
			item.reply = data.reply;
			item.comment = data.comment;
			item.film = fa.films.unpackFilm(data.film);
		}
		
		return item;
	};
	
	// constructs and returns an updates object from the backend data
	// 
	// the page var keeps track of how many pages have been already loaded; it
	// counts from 0 as this is what the backend expects
	var createUpdates = function(data) {
		var updates = {};
		var page = Math.ceil(data.items.length / 20) - 1;
		
		updates.firstItems = fjs.map(unpackItem, data.items);
		
		// resolves into a list of update items
		updates.loadMore = function() {
			page += 1;
			return fa.ws.send('get_updates', {page: page, per_page: 20}).then(function(data) {
				return Promise.resolve(fjs.map(unpackItem, data.items));
			});
		};
		
		// returns the number of pages that have been loaded so far
		updates.getNumPages = function() {
			return page + 1;
		};
		
		return updates;
	};
	
	
	// 
	// downstream api
	// 
	
	// returns a promise that resolves into an updates object
	// 
	// if given, the argument specifies the number of pages that the updates
	// object will start with; by default one page of updates will be loaded
	var getUpdates = function(pages) {
		var perPage = (pages) ? 20 * pages : 20;
		
		return fa.ws.send('get_updates', {page: 0, per_page: perPage}).then(function(data) {
			return Promise.resolve(createUpdates(data));
		});
	};
	
	
	// 
	// exports
	// 
	
	return {
		unpackItem: unpackItem,
		
		get: getUpdates,
		
		gotUnread: gotUnread
	};
	
}());
