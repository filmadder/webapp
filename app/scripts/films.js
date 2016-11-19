fa.films = (function() {
	
	"use strict";
	
	
	// 
	// functions
	// 
	
	// returns a film object from the given json data
	var createFilm = function(data) {
		var film = {};
		
		if(!fjs.all(function(prop) { return data.hasOwnProperty(prop); }, ['title'])) {
			throw new Error('Could not deserialise film');
		}
		
		film.title = data.title;
		
		return film;
	};
	
	// returns promise that resolves into a film object
	var getFilm = function(id) {
		return new Promise(function(resolve, reject) {
			fa.conn.get('/api/films/'+ id +'/review/').then(function(data) {
				resolve(createFilm(data.film));
			}).catch(reject);
		});
	};
	
	// returns promise that resolves into a [] of film results
	var searchFilms = function(query) {
		return new Promise(function(resolve, reject) {
			fa.conn.post('/api/search/', {query: query}).then(function(data) {
				resolve(data);
			}).catch(reject);
		});
	};
	
	
	// 
	// exports
	// 
	
	return {
		get: getFilm,
		search: searchFilms
	};
	
}());
