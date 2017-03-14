fa.updates = (function() {
	
	"use strict";
	
	
	// 
	// state
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
	// functions
	// 
	
	// constructs and returns an update item object from the backend data
	var createItem = function(data) {
		var item = {
			created: fa.utils.humaniseTime(data.created)
		};
		
		item.type = {
			newFriend: (data.type == 'f'),
			newFriendReq: (data.type == 'q'),
			newReply: (data.type == 'r')
		};
		
		if(item.type.newFriend || item.type.newFriendReq) {
			item.user = data.user;
		}
		else if(item.type.newReply) {
			item.user = data.user;
			item.reply = data.reply;
			item.comment = data.comment;
			item.film = data.film;
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
		
		updates.firstItems = fjs.map(createItem, data.items);
		
		// resolves into a list of update items
		updates.loadMore = function() {
			page += 1;
			return fa.ws.send('get_updates', {page: page, per_page: 20}).then(function(data) {
				return Promise.resolve(fjs.map(createItem, data.items));
			});
		};
		
		// returns the number of pages that have been loaded so far
		updates.getNumPages = function() {
			return page + 1;
		};
		
		return updates;
	};
	
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
	
	// returns a promise that resolves into [] of update items that have not
	// been marked as read yet
	var getUnreadUpdates = function() {
		return fa.ws.send('get_updates', {page: -1, per_page: 20}).then(function(data) {
			return Promise.resolve(fjs.map(createItem, data.items));
		});
	};
	
	
	// 
	// exports
	// 
	
	return {
		get: getUpdates,
		getUnread: getUnreadUpdates,
		
		gotUnread: gotUnread
	};
	
}());
