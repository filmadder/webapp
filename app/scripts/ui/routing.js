/**
 * Does the routing and holds reference to the current view.
 */
fa.ui.routing = (function() {
	
	"use strict";
	
	
	/**
	 * I. Class definitions
	 */
	/**
	 * Class definition for the Router singleton.
	 * 
	 * @param The container of the views as jQuery element.
	 */
	var Router = function(dom) {
		var self = this;
		
		self.current = null;
		self.next = null;
		
		self.dom = dom;
		
		self.initRoutes();
		
		crossroads.routed.add(self.switchView.bind(self));
		
		hasher.initialized.add(self.parseHash);
		hasher.changed.add(self.parseHash);
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
	 * Takes care of switching the views, including the css transition.
	 */
	Router.prototype.switchView = function() {
		var self = this;
		
		self.dom.addClass('opaque');
		self.dom.one('transitionend', function() {
			if(self.current) {
				self.current.destroy();
			}
			self.dom.empty();
			
			self.current = self.next;
			self.next = null;
			
			self.current.load(self.dom).then(function() {
				self.dom.removeClass('opaque');
			});
		});
		
	};
	
	/**
	 * Inits all the routes.
	 * Corresponds to urls.py in Django.
	 */
	Router.prototype.initRoutes = function() {
		var self = this;
		
		crossroads
			.addRoute('/')
			.matched.add(function() {
				self.next = new q.ui.components.patients.View();
			});
		
		crossroads
			.addRoute('/patients')
			.matched.add(function() {
				self.next = new q.ui.components.patients.View();
			});
		
		crossroads
			.addRoute('/patient/{id}', function(id) {
				id = (id) ? parseInt(id) : null;
				self.next = new q.ui.components.patient.View(id);
			})
			.rules = {
				id: /^[0-9]+$/
			};
		
		crossroads
			.addRoute('/appointments')
			.matched.add(function() {
				self.next = new q.ui.components.appointments.View();
			});
		
		crossroads
			.addRoute('/calendar')
			.matched.add(function() {
				self.next = new q.ui.components.Calendar();
			});
		
		crossroads
			.addRoute('/error')
			.matched.add(function() {
				self.next = new q.ui.components.Error();
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
	 * II. Module variables and functions
	 */
	/**
	 * The active Router instance.
	 */
	var router = null;
	
	/**
	 * Inits the module.
	 * 
	 * @param The container of the views as jQuery element.
	 */
	var init = function(dom) {
		fa.assert.equal(router, null);
		router = new Router(dom);
	};
	
	/**
	 * Deactivates the module.
	 */
	var destroy = function() {
		fa.assert.notEqual(router, null);
		
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
	 * III. Module exports
	 */
	return {
		init: init,
		destroy: destroy,
		goTo: goTo,
		changeSilently: changeSilently
	};
	
}());
