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
	
	// constructs and returns a comment object from backend data
	// helper for createFilm()
	var createComment = function(data) {
		return {
			pk: data.pk,
			author: data.author,
			text: data.text,
			hasSpoilers: data.has_spoilers,
			posted: fa.utils.humaniseTime(data.posted),
			replies: data.replies
		};
	};
	
	// constructs and returns a film object from backend data
	// helper for getFilm()
	var createFilm = function(data) {
		var film = {
			pk: data.film.pk,
			title: data.film.title,
			year: data.film.year,
			runtime: data.film.runtime,
			countries: data.film.countries,
			directors: data.film.directors,
			writers: data.film.writers,
			actors: data.film.actors,
			genre: data.film.genre,
			plot: data.film.plot,
			omdbType: data.film.omdb_type,
			posterUrl: data.film.poster_url,
			watchersPast: data.watchers_past,
			watchersFuture: data.watchers_future,
			comments: fjs.map(createComment, data.comments)
		};
		
		film.status = {
			unknown: (data.status == 'n'),
			watched: (data.status == 'p'),
			watchlisted: (data.status == 'f')
		};
		
		film.addToWatched = function() {
			return fa.ws.send('set_film_status', {film: film.pk, status: 'p'});
		};
		film.addToWatchlist = function() {
			return fa.ws.send('set_film_status', {film: film.pk, status: 'f'});
		};
		film.removeFromList = function() {
			return fa.ws.send('set_film_status', {film: film.pk, status: 'n'});
		};
		
		return film;
	};
	
	// returns a promise that resolves into a film object
	var getFilm = function(id) {
		return fa.ws.send('get_film', {film: id}).then(function(data) {
			return Promise.resolve(createFilm(data));
		});
	};
	
	// returns a promise that resolves into a [] of film results
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
	
	// returns a promise that resolves into the re-newed film object
	var postComment = function(filmId, comment, hasSpoilers) {
		return fa.ws.send('post_comment', {
			film: filmId,
			text: comment,
			has_spoilers: hasSpoilers
		}).then(function() {
			return getFilm(filmId);
		});
	};
	
	
	// 
	// exports
	// 
	
	return {
		get: getFilm,
		
		search: searchFilms,
		onMoreResults: onMoreResults,
		
		postComment: postComment
	};
	
}());
