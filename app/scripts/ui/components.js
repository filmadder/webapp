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
			return {greeting: 'I am search, the searcher of worlds'};
		}
	});
	
	Vue.component('film-view', {
		template: '#film-view',
		data: function() {
			return {greeting: 'I am a film, trust me'};
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
