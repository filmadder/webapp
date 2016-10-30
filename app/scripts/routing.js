/**
 * Does the routing and holds reference to the current view.
 * 
 * Encapsulates all interaction with the dependencies Crossroads and Hasher.
 */
fa.routing = (function() {
	
	"use strict";
	
	
	/**
	 * Class definitions
	 */
	/**
	 * Class definition for the Router singleton.
	 */
	var Router = function() {
		this.initRoutes();
		
		hasher.initialized.add(this.parseHash);
		hasher.changed.add(this.parseHash);
		hasher.init();
	};
	
	/**
	 * Hooks in Hasher in order to notify crossroads about URL change.
	 * 
	 * @param The new URL hash.
	 * @param The old URL hash.
	 */
	Router.prototype.parseHash = function(newHash, oldHash) {
		crossroads.parse(newHash);
	};
	
	/**
	 * Inits all the routes.
	 * Corresponds to urls.py in Django.
	 */
	Router.prototype.initRoutes = function() {
		hier.reg('/outer', 'main', fa.views.outer);
		hier.reg('/outer/reg', '#view', fa.views.reg);
		hier.reg('/outer/login', '#view', fa.views.login);
		
		hier.reg('/inner', 'main', fa.views.inner);
		hier.reg('/inner/search', '#view', fa.views.search);
		hier.reg('/inner/film', '#view', fa.views.film);
		hier.reg('/inner/home', '#view', fa.views.home);
		
		hier.reg('/error', 'main', fa.views.error);
		
		crossroads
			.addRoute('/', function() {
				hier.add('/inner');
				hier.add('/inner/home');
			});
		
		crossroads
			.addRoute('/search', function() {
				hier.add('/inner');
				hier.add('/inner/search');
			});
		
		crossroads
			.addRoute('/film/{id}', function(id) {
				id = (id) ? parseInt(id) : null;
				hier.add('/inner');
				hier.add('/inner/film');
			})
			.rules = {
				id: /^[0-9]+$/
			};
		
		crossroads
			.addRoute('/login', function() {
				hier.add('/outer');
				hier.add('/outer/login');
			});
		
		crossroads
			.addRoute('/error', function() {
				hier.add('/error');
			});
		
		crossroads
			.bypassed.add(function() {
				hasher.replaceHash('error');
			});
	};
	
	/**
	 * Sets the URL and the current view.
	 * 
	 * @param The URL to go to.
	 */
	Router.prototype.goTo = function(url) {
		hasher.setHash(url);
	};
	
	/**
	 * Silently replaces the current URL.
	 * 
	 * @param The URL to replace the current one.
	 */
	Router.prototype.changeSilently = function(url) {
		hasher.changed.active = false;
		hasher.setHash(url);
		hasher.changed.active = true;
	};
	
	/**
	 * Clears the routes, making the instance ready for deletion.
	 */
	Router.prototype.clear = function() {
		crossroads.removeAllRoutes();
	};
	
	
	/**
	 * Variables and functions
	 */
	/**
	 * The active Router instance.
	 */
	var router = null;
	
	/**
	 * Inits the module.
	 */
	var init = function() {
		fa.assert.equal(router, null);
		router = new Router();
		
		fa.comm.receive('route to', receiveGoTo);
	};
	
	/**
	 * Deactivates the module.
	 */
	var destroy = function() {
		fa.assert.notEqual(router, null);
		
		fa.comm.disconnect('route to', receiveGoTo);
		
		router.clear();
		router = null;
	};
	
	/**
	 * Changes the current view with the one specified by the given URL.
	 * 
	 * @param The URL to go to.
	 */
	var goTo = function(url) {
		fa.assert.notEqual(router, null);
		router.goTo(url);
	};
	
	/**
	 * Changes the URL while retaining the current view.
	 * 
	 * @param The new URL.
	 */
	var changeSilently = function(url) {
		fa.assert.notEqual(router, null);
		router.changeSilently(url);
	};
	
	/**
	 * The same as goTo, but as signal receiver.
	 * Expects {url}.
	 */
	var receiveGoTo = function(load) {
		goTo(load.url);
		return Promise.resolve();
	};
	
	
	/**
	 * Exports
	 */
	return {
		init: init,
		destroy: destroy,
		
		goTo: goTo,
		changeSilently: changeSilently
	};
	
}());
