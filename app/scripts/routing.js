fa.routing = (function() {

	"use strict";


	// 
	// setup hier
	// 

	hier.reg('/outer', 'main', fa.views.outer);
	hier.reg('/outer/reg', '#view', fa.views.outer.reg);
	hier.reg('/outer/login', '#view', fa.views.outer.login);

	hier.reg('/inner', 'main', fa.views.inner);
	hier.reg('/inner/user', '#view', fa.views.user);
	hier.reg('/inner/user/films', '#subview', fa.views.user.films);
	hier.reg('/inner/user/tags', '#subview', fa.views.user.tags);
	hier.reg('/inner/user/friends', '#subview', fa.views.user.friends);
	hier.reg('/inner/film', '#view', fa.views.film);
	hier.reg('/inner/film/comments', 'section.comments', fa.views.film.comments);
	hier.reg('/inner/film/tags', 'section.tagging-cont', fa.views.film.tags);
	hier.reg('/inner/tag', '#view', fa.views.tag);
	hier.reg('/inner/results', '#view', fa.views.search);
	hier.reg('/inner/feed', '#view', fa.views.feed);
	hier.reg('/inner/updates', '#view', fa.views.updates);
	hier.reg('/inner/settings', '#view', fa.views.settings);

	hier.reg('/error', 'main', fa.views.error);
	hier.reg('/mes', '#message-cont', fa.views.message);


	// 
	// setup crossroads
	// 

	crossroads.addRoute('/:list:', function(list) {
		if(!list) list = 'watchlist';

		hier.add('/inner');
		hier.add('/inner/user', fa.auth.getUser().pk).loaded.add(function(user) {
			if(user.showData) {
				if(list == 'friends') hier.add('/inner/user/friends', user);
				else if(list == 'tags') hier.add('/inner/user/tags', user);
				else hier.add('/inner/user/films', {user: user, type: list});
			}
		});
	}).rules = {
		list: ['seen', 'watching', 'watchlist', 'friends', 'tags']
	};

	crossroads.addRoute('/user/{id}/:list:', function(id, list) {
		id = (id) ? parseInt(id) : 0;
		if(!list) list = 'watchlist';

		hier.add('/inner');
		hier.add('/inner/user', id).loaded.add(function(user) {
			if(user.showData) {
				if(list == 'friends') hier.add('/inner/user/friends', user);
				else if(list == 'tags') hier.add('/inner/user/tags', user);
				else hier.add('/inner/user/films', {user: user, type: list});
			}
		});
	}).rules = {
		id: /^[0-9]+$/,
		list: ['seen', 'watching', 'watchlist', 'friends', 'tags']
	};

	crossroads.addRoute('/updates', function() {
		hier.add('/inner');
		hier.add('/inner/updates');
	});

	crossroads.addRoute('/feed', function() {
		hier.add('/inner');
		hier.add('/inner/feed');
	});

	crossroads.addRoute('/search/{?query}', function(query) {
		hier.add('/inner');
		if(hier.has('/inner/results')) hier.remove('/inner/results', query);
		hier.add('/inner/results', query);
	});

	crossroads.addRoute('/film/{id}', function(id) {
		id = (id) ? parseInt(id) : null;
		hier.add('/inner');
		hier.add('/inner/film', id);
	}).rules = {
		id: /^[0-9]+$/
	};

	crossroads.addRoute('/label/{tag}', function(tag) {
		hier.add('/inner');
		if(hier.has('/inner/tag')) hier.remove('/inner/tag');
		hier.add('/inner/tag', {tag: tag});
	});

	crossroads.addRoute('/settings', function() {
		hier.add('/inner');
		hier.add('/inner/settings');
	});

	crossroads.addRoute('/login', function() {
		hier.add('/outer');
		hier.add('/outer/login');
	});

	crossroads.addRoute('/reg', function() {
		hier.add('/outer');
		hier.add('/outer/reg');
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

	var parseHash = function(newHash, oldHash) {
		crossroads.parse(newHash);
	};

	hasher.initialized.add(parseHash);
	hasher.changed.add(parseHash);

	hasher.changed.add(function() {
		if(hier.has('/mes')) {
			hier.remove('/mes');
			document.getElementById('message-cont').innerHTML = '';
		}
	});


	// 
	// exports
	// 

	var api = {};

	// enables the routing functionality
	// at this point the first view will be invoked
	api.init = function() {
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
