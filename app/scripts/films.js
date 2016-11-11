/**
 * Handles film searching.
 */
fa.films = (function() {
	
	"use strict";
	
	
	/**
	 * Receivers
	 */
	/**
	 * Resolves into [] of search results.
	 * Expects {query}.
	 */
	var searchFilms = function(args) {
		return new Promise(function(resolve, reject) {
			fa.conn
			.post('/api/search/', {query: args.query})
			.then(resolve)
			.catch(function(error) {
				reject(error);
			});
		});
	};
	
	
	/**
	 * Resolves into {} with the film's full info.
	 * Expects {id}.
	 */
	var getFilm = function(args) {
		return new Promise(function(resolve, reject) {
			fa.conn
			.get('/api/films/'+ args.id +'/review/')
			.then(resolve)
			.catch(function(error) {
				reject(error);
			});
		});
	};
	
	
	/**
	 * Registers the signals.
	 */
	var init = function() {
		fa.comm.receive('search films', searchFilms);
		fa.comm.receive('get film', getFilm);
	};
	
	var destroy = function() {
		fa.comm.disconnect('search films', searchFilms);
		fa.comm.disconnect('get film', getFilm);
	};
	
	
	/**
	 * Exports
	 */
	return {
		init: init,
		destroy: destroy
	};
	
}());
