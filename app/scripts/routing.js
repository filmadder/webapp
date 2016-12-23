fa.routing = (function() {
	
	"use strict";
	
	// 
	// setup hier
	// 
	
	hier.reg('/outer', 'main', fa.views.outer);
	hier.reg('/outer/reg', '#view', fa.views.reg);
	hier.reg('/outer/login', '#view', fa.views.login);
	
	hier.reg('/inner', 'main', fa.views.inner);
	hier.reg('/inner/results', '#view', fa.views.results);
	hier.reg('/inner/film', '#view', fa.views.film);
	hier.reg('/inner/home', '#view', fa.views.home);
	hier.reg('/inner/feed', '#view', fa.views.feed);
	hier.reg('/inner/updates', '#view', fa.views.updates);
	hier.reg('/inner/profile', '#view', fa.views.profile);
	hier.reg('/inner/settings', '#view', fa.views.settings);
	
	hier.reg('/error', 'main', fa.views.error);
	
	
	// 
	// setup crossroads
	// 
	
	crossroads.addRoute('/', function() {
		hier.add('/inner');
		hier.add('/inner/home');
	});
	
	crossroads.addRoute('/feed/', function() {
		hier.add('/inner');
		hier.add('/inner/feed');
	});
	
	crossroads.addRoute('/updates/', function() {
		hier.add('/inner');
		hier.add('/inner/updates');
	});
	
	crossroads.addRoute('/search/{?query}/', function(query) {
		hier.add('/inner');
		hier.add('/inner/results');
		hier.update('/inner/results', query);
	});
	
	crossroads.addRoute('/film/{id}', function(id) {
		id = (id) ? parseInt(id) : null;
		hier.add('/inner');
		hier.add('/inner/film', id);
	}).rules = {
		id: /^[0-9]+$/
	};
	
	crossroads.addRoute('/me', function() {
		hier.add('/inner');
		hier.add('/inner/profile');
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
	// the url should not start or end with a slash
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
