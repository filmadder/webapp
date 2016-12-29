fa.updates = (function() {
	
	"use strict";
	
	
	// 
	// functions
	// 
	
	// constructs and returns an update item object from the backend data
	var createItem = function(data) {
		var item = {
			created: data.created
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
	var createUpdates = function(data) {
		var updates = {};
		var page = 0;
		
		updates.firstItems = fjs.map(createItem, data.items);
		
		// resolves into a list of update items
		updates.loadMore = function() {
			page += 1;
			return fa.ws.send('get_updates', {page: page}).then(function(data) {
				return Promise.resolve(fjs.map(createItem, data.items));
			});
		};
		
		return updates;
	};
	
	// returns a promise that resolves into an updates object
	var getUpdates = function() {
		return fa.ws.send('get_updates', {page: 0}).then(function(data) {
			return Promise.resolve(createUpdates(data));
		});
	};
	
	// returns a promise that resolves into [] of update items that have not
	// been marked as read yet
	var getUnreadUpdates = function() {
		return fa.ws.send('get_updates', {page: -1}).then(function(data) {
			return Promise.resolve(fjs.map(createItem, data.items));
		});
	};
	
	
	// 
	// exports
	// 
	
	return {
		get: getUpdates,
		getUnread: getUnreadUpdates
	};
	
}());
