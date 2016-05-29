/**
 * Contains the global Vue instance and the Vue components.
 * 
 * The module makes use of Vue's events for communication between components.
 * Here is a list of these:
 * * authenticated()
 * * searched(results)
 * * erred({code, message})
 * * routed()
 */
fa.ui.components = (function() {
	
	"use strict";
	
	
	/**
	 * Search components
	 */
	Vue.component('search-form', {
		template: '#search-form',
		data: function() {
			return {
				query: ''
			};
		},
		methods: {
			search: function() {
				var self = this;
				fa.comm
				.send('search films', {query: self.query})
				.then(function(results) {
					self.$dispatch('searched', results);
				})
				.catch(function(error) {
					self.$dispatch('erred', error);
				});
			}
		}
	});
	
	Vue.component('search-view', {
		template: '#search-view',
		data: function() {
			return {
				results: []
			};
		},
		events: {
			'searched': function(results) {
				this.results = results;
			}
		}
	});
	
	
	/**
	 * Film components
	 */
	Vue.component('film-view', {
		template: '#film-view',
		data: function() {
			return {id: null, title: null, year: null};
		},
		activate: function(done) {
			var self = this;
			fa.comm
			.send('get film', {id: self.$parent.routeParam})
			.then(function(data) {
				self.id = data.film.id;
				self.title = data.film.title;
				self.year = data.film.year;
				done();
			})
			.catch(function(error) {
				self.$dispatch('erred', error);
			});
		}
	});
	
	
	/**
	 * Auth components
	 */
	Vue.component('login-view', {
		template: '#login-view',
		data: function() {
			return {
				email: '',
				password: ''
			};
		},
		methods: {
			login: function() {
				var self = this;
				fa.comm
				.send('login', {email: self.email, password: self.password})
				.then(function() {
					self.$dispatch('authenticated');
				})
				.catch(function(error) {
					self.$dispatch('erred', error);
				});
			}
		}
	});
	
	
	/**
	 * General components
	 */
	Vue.component('home-view', {
		template: '#home-view',
		data: function() {
			return {greeting: 'I am home'};
		}
	});
	
	Vue.component('message-bar', {
		template: '#message-bar',
		data: function() {
			return {
				type: 'error',
				text: ''
			};
		},
		events: {
			'erred': function(error) {
				this.text = error.message;
			},
			'routed': function() {
				this.text = '';
			}
		}
	});
	
	Vue.component('error-view', {
		template: '#error-view'
	});
	
	
	/**
	 * The global Vue instance
	 */
	/**
	 * Will hold the global Vue instance.
	 */
	var vue = null;
	
	
	/**
	 * Creates the global Vue instance.
	 * Registers the signal receivers.
	 */
	var init = function() {
		fa.assert.equal(vue, null);
		
		vue = new Vue({
			el: '#fa',
			data: {
				currentView: 'home-view',
				routeParam: null
			},
			events: {
				'authenticated': function() {
					fa.ui.routing.goTo('');
				},
				'searched': function(results) {
					if(this.currentView != 'search-view') {
						fa.ui.routing.goTo('search');
					}
					this.$broadcast('searched', results);
				},
				'erred': function(error) {
					if(error.code == 403) {
						fa.ui.routing.goTo('login');
					}
					this.$broadcast('erred', error);
				}
			}
		});
		
		fa.comm.receive('show error', showError);
		fa.comm.receive('show success', showSuccess);
	};
	
	/**
	 * Sets the current view to the given one.
	 * 
	 * @param The string identifying the view requested.
	 * @param Parameter for the view. Optional.
	 */
	var setView = function(newView, param) {
		fa.assert.notEqual(vue, null);
		
		vue.routeParam = (param) ? param : null;
		vue.currentView = newView;
		vue.$broadcast('routed');
	};
	
	/**
	 * Shows an error message with the given text.
	 */
	var showError = function(load) {
		fa.assert.isTrue('text' in load);
		fa.assert.notEqual(vue, null);
		
		vue.$broadcast('erred', {code: null, message: load.text});
		
		return Promise.resolve();
	};
	
	/**
	 * Shows a success message with the given text.
	 */
	var showSuccess = function(load) {
		fa.assert.isTrue('text' in load);
		fa.assert.notEqual(vue, null);
		
		console.log(load.text);
		return Promise.resolve();
	};
	
	/**
	 * Disconnects the signal receivers.
	 */
	var destroy = function() {
		fa.comm.disconnect('show error', showError);
		fa.comm.disconnect('show success', showSuccess);
	};
	
	
	/**
	 * Exports
	 */
	return {
		init: init,
		destroy: destroy,
		
		setView: setView,
		showError: showError,
		showSuccess: showSuccess
	};
	
}());
