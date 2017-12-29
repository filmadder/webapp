fa.routing = (function() {

	"use strict";


	// 
	// setup hier
	// 

	var setupHier = function() {
		hier.reg('/outer', '[data-fn=main]', fa.views.outer);
		hier.reg('/outer/reg', '[data-fn=view]', fa.views.outer.reg);
		hier.reg('/outer/login', '[data-fn=view]', fa.views.outer.login);

		hier.reg('/inner', '[data-fn=main]', fa.views.inner);
		hier.reg('/inner/user', '[data-fn=view]', fa.views.user);
		hier.reg('/inner/user/films', '[data-fn=subview]', fa.views.user.films);
		hier.reg('/inner/user/tags', '[data-fn=subview]', fa.views.user.tags);
		hier.reg('/inner/user/friends', '[data-fn=subview]', fa.views.user.friends);
		hier.reg('/inner/film', '[data-fn=view]', fa.views.film);
		hier.reg('/inner/tag', '[data-fn=view]', fa.views.tag);
		hier.reg('/inner/results', '[data-fn=view]', fa.views.search);
		hier.reg('/inner/feed', '[data-fn=view]', fa.views.feed);
		hier.reg('/inner/updates', '[data-fn=view]', fa.views.updates);
		hier.reg('/inner/settings', '[data-fn=view]', fa.views.settings);
		hier.reg('/inner/logout', '[data-fn=view]', fa.views.logout);

		hier.reg('/error', '[data-fn=main]', fa.views.error);
		hier.reg('/mes', '[data-fn=message]', fa.views.message);
	};


	// 
	// setup crossroads
	// 

	crossroads.addRoute('/:list:', function(list) {
		if(!list) list = 'watchlist';

		hier.add('/inner').then(function() {
			return hier.add('/inner/user', fa.auth.getUser().pk);
		}).then(function(view) {
			return view.initSubView(list);
		});
	}).rules = {
		list: ['seen', 'watching', 'watchlist', 'friends', 'tags']
	};

	crossroads.addRoute('/user/{id}/:list:', function(id, list) {
		id = (id) ? parseInt(id) : 0;
		if(!list) list = 'watchlist';

		hier.add('/inner').then(function() {
			return hier.add('/inner/user', id);
		}).then(function(view) {
			return view.initSubView(list);
		});
	}).rules = {
		id: /^[0-9]+$/,
		list: ['seen', 'watching', 'watchlist', 'friends', 'tags']
	};

	crossroads.addRoute('/updates', function() {
		hier.add('/inner').then(function() {
			return hier.add('/inner/updates');
		});
	});

	crossroads.addRoute('/feed', function() {
		hier.add('/inner').then(function() {
			return hier.add('/inner/feed');
		});
	});

	crossroads.addRoute('/search/{?query}', function(query) {
		hier.add('/inner').then(function() {
			return hier.add('/inner/results', query);
		});
	});

	crossroads.addRoute('/film/{id}', function(id) {
		id = (id) ? parseInt(id) : null;
		hier.add('/inner').then(function() {
			return hier.add('/inner/film', id);
		});
	}).rules = {
		id: /^[0-9]+$/
	};

	crossroads.addRoute('/label/{tag}', function(tag) {
		hier.add('/inner').then(function() {
			return hier.add('/inner/tag', {tag: tag});
		});
	});

	crossroads.addRoute('/settings', function() {
		hier.add('/inner').then(function() {
			return hier.add('/inner/settings');
		});
	});

	crossroads.addRoute('/logout', function() {
		hier.add('/inner').then(function() {
			return hier.add('/inner/logout');
		});
	});

	crossroads.addRoute('/login', function() {
		hier.add('/outer').then(function() {
			return hier.add('/outer/login');
		});
	});

	crossroads.addRoute('/reg', function() {
		hier.add('/outer').then(function() {
			return hier.add('/outer/reg');
		});
	});

	crossroads.addRoute('/error', function() {
		hier.add('/error');
	});

	crossroads.bypassed.add(function() {
		hasher.replaceHash('error');
	});


	// 
	// setup hasher
	// 

	var parseHash = function(newHash) {
		crossroads.parse(newHash);
	};

	hasher.initialized.add(parseHash);
	hasher.changed.add(parseHash);

	hasher.changed.add(function() {
		if(hier.has('/mes')) hier.remove('/mes');
	});


	// 
	// exports
	// 

	var api = {};

	// enables the routing functionality
	// at this point the first view will be invoked
	api.init = function() {
		setupHier();
		hasher.init();
	};

	// changes the url and the view accordingly
	// 
	// the url should not start or end with a slash
	// 
	// if the second arg is set, then the url will be replaced without invoking
	// the respective view
	api.go = function(url, silently) {
		if(silently) {
			hasher.changed.active = false;
			hasher.setHash(url);
			hasher.changed.active = true;
		}
		else {
			hasher.setHash(url);
		}
	};

	return api;

}());
