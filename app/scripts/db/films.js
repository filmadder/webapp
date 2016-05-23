/**
 * Handles film searching.
 */
fa.db.films = (function() {
	
	"use strict";
	
	
	/**
	 * Receivers
	 */
	/**
	 * Resolves into list of search results.
	 * 
	 * @param Map with keys: query.
	 * @return Promise.
	 */
	var searchFilms = function(map) {
		return new Promise(function(resolve, reject) {
			resolve([
				{id: 42, title: "The Touch of Stella's Love", year: 1910},
				{id: 42, title: "Stella and Her Twelve Lovers", year: 1925},
				{id: 42, title: "Stella's Smile", year: 1938},
				{id: 42, title: "Who Can Compete with Stella?", year: 1966},
				{id: 42, title: "Stella, It is a Love Story!", year: 1978},
				{id: 42, title: "Galaxy 3: Battle for Stella", year: 1991},
				{id: 42, title: "Stella is Happy", year: 2008}
			]);
		});
	};
	
	
	/**
	 * Resolves into {id, title, year}.
	 * 
	 * @param Map with keys: id.
	 * @return Promise.
	 */
	var getFilm = function(map) {
		return new Promise(function(resolve, reject) {
			resolve({
				id: 42,
				title: "Stella is Happy",
				year: 2008
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
		
	};
	
	
	/**
	 * Exports
	 */
	return {
		init: init,
		destroy: destroy
	};
	
}());
