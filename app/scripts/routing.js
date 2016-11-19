fa.routing = (function() {
	
	"use strict";
	
	// 
	// setup hier
	// 
	
	hier.reg('/outer', 'main', fa.views.outer);
	hier.reg('/outer/reg', '#view', fa.views.reg);
	hier.reg('/outer/login', '#view', fa.views.login);
	
	hier.reg('/inner', 'main', fa.views.inner);
	hier.reg('/inner/search', '#view', fa.views.search);
	hier.reg('/inner/film', '#view', fa.views.film);
	hier.reg('/inner/home', '#view', fa.views.home);
	hier.reg('/inner/profile', '#view', fa.views.profile);
	
	hier.reg('/error', 'main', fa.views.error);
	
	
	// 
	// setup crossroads
	// 
	
	crossroads.addRoute('/', function() {
		hier.add('/inner');
		hier.add('/inner/home');
	});
	
	crossroads.addRoute('/search', function() {
		hier.add('/inner');
		hier.add('/inner/search');
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
	
	crossroads.addRoute('/login', function() {
		hier.add('/outer');
		hier.add('/outer/login');
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
	api.go = function(url) {
		hasher.setHash(url);
	};
	
	return api;
	
}());
