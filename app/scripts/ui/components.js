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
		template: '#search-view',
		data: function() {
			return {
				films: [
					{id: 42, title: "The Touch of Stella's Love", year: 1910},
					{id: 42, title: "Stella and Her Twelve Lovers", year: 1925},
					{id: 42, title: "Stella's Smile", year: 1938},
					{id: 42, title: "Who Can Compete with Stella?", year: 1966},
					{id: 42, title: "Stella, It is a Love Story!", year: 1978},
					{id: 42, title: "Galaxy 3: Battle for Stella", year: 1991},
					{id: 42, title: "Stella is Happy", year: 2008}
				],
				friends: []
			};
		}
	});
	
	Vue.component('film-view', {
		template: '#film-view',
		data: function() {
			return {
				id: 42,
				title: "Stella is Happy",
				year: 2008
			};
		},
		activate: function(done) {
			console.log(this.$parent.routeParam);
			done();
		}
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
				routeParam: null
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
