fa.films = (function() {
	
	"use strict";
	
	
	// 
	// state
	// 
	
	var gotMoreResults = new signals.Signal();
	
	fa.ws.received.add(function(message) {
		if(message.type == 'more_search_results') {
			gotMoreResults.dispatch(message.query);
		}
	});
	
	
	// 
	// functions
	// 
	
	// returns promise that resolves into a film object
	var getFilm = function(id) {
		return fa.ws.send('get_film', {film: id});
	};
	
	// returns promise that resolves into a [] of film results
	var searchFilms = function(query) {
		return fa.ws.send('search_films', {query: query});
	};
	
	// invokes the callback if the server found more search results
	var onMoreResults = function(query, callback) {
		gotMoreResults.removeAll();
		gotMoreResults.add(function(mesQuery) {
			if(mesQuery == query) callback();
		});
	};
	
	
	// 
	// exports
	// 
	
	return {
		get: getFilm,
		search: searchFilms,
		onMoreResults: onMoreResults
	};
	
}());
