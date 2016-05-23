/**
 * Contains the global Vue instance and the Vue components.
 */
fa.ui.components = (function() {
	
	"use strict";
	
	
	/**
	 * I. Vue components.
	 */
	Vue.component('home-view', {
		template: '#home-view',
		data: function() {
			return {greeting: 'I am home'};
		}
	});
	
	Vue.component('search-view', {
		template: '#search-view'
	});
	
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
				if(error == 'Login required') fa.ui.routing.goTo('login');
				else console.error(error);
			});
		}
	});
	
	Vue.component('login-view', {
		template: '#login-view'
	});
	
	Vue.component('error-view', {
		template: '#error-view'
	});
	
	
	/**
	 * II. The global Vue instance.
	 */
	/**
	 * Will hold the global Vue instance.
	 */
	var vue = null;
	
	
	/**
	 * Creates the global Vue instance.
	 * The latter operates on the <main> element.
	 */
	var init = function() {
		fa.assert.equal(vue, null);
		
		vue = new Vue({
			el: '#fa',
			data: {
				currentView: 'home-view',
				routeParam: null,
				searchQuery: '',
				searchResults: []
			},
			methods: {
				search: function() {
					var self = this;
					
					if(self.currentView != 'search-view') {
						fa.ui.routing.goTo('search');
					}
					
					fa.comm
					.send('search films', {query: self.searchQuery})
					.then(function(results) {
						self.searchResults = results;
					})
					.catch(function(error) {
						if(error == 'Login required') fa.ui.routing.goTo('login');
						else console.error(error);
					});
				}
			}
		});
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
	};
	
	
	/**
	 * III. Module exports.
	 */
	return {
		init: init,
		setView: setView
	};
	
}());
