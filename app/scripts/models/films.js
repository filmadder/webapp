fa.models.films = (function() {

	"use strict";


	//
	// signals
	//

	// dispatches when the server found more search results
	// dispatches with the query for which those results were found
	var gotMoreResults = new signals.Signal();


	//
	// unpacking
	//

	// creates a downstream film comment object from an upstream json object
	var unpackComment = function(data) {
		return {
			pk: data.pk,
			author: {
				pk: data.author.pk,
				name: data.author.name,
				self: (data.author.pk == fa.auth.getUser().pk)
			},
			text: data.text,
			hasSpoilers: data.has_spoilers,
			posted: fa.utils.humaniseTime(data.posted),
			replies: data.replies
		};
	};

	// creates a downstream short film object from an upstream json object
	// 
	// a short film object contains only a subset of fields and is used in
	// listings, including search results
	var unpackFilm = function(data) {
		return {
			pk: data.pk,
			title: data.title,
			year: data.year,
			directors: data.directors,
			posterUrl: data.poster_url
		};
	};

	// creates a downstream long film object from an upstream json object
	// 
	// a long film object is only used in film views
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
			comments: fjs.map(unpackComment, data.comments),
			friendsTags: data.tags_friends,
			friendsTagsCount: fjs.fold('x, y => x + y.tags.length', 0, data.tags_friends),
			tags: data.tags_own
		};

		film.status = fjs.prop(data.status)({
			'n': 'unknown',
			'p': 'seen',
			'o': 'watching',
			'f': 'watchlist'
		});

		return film;
	};


	//
	// downstream api
	//

	// returns a promise that resolves into a long film object
	var getFilm = function(id) {
		return fa.ws.send('get_film', {film: id}).then(function(data) {
			return Promise.resolve(createFilm(data));
		});
	};

	// returns a promise that resolves with nothing
	var setStatus = function(id, status) {
		status = fjs.prop(status)({
			'unknown': 'n',
			'seen': 'p',
			'watching': 'o',
			'watchlist': 'f'
		});

		return fa.ws.send('set_film_status', {
			film: id,
			status: status
		});
	};

	// returns a promise that resolves into the re-newed long film object
	var postComment = function(filmId, comment, hasSpoilers) {
		return fa.ws.send('post_comment', {
			film: filmId,
			text: comment,
			has_spoilers: hasSpoilers
		}).then(function() {
			return getFilm(filmId);
		});
	};

	// returns a promise that resolves with nothing
	var deleteComment = function(filmId, commentId) {
		return fa.ws.send('delete_comment', {
			film: filmId,
			comment: commentId
		});
	};


	//
	// exports
	//

	var init = function() {
		fa.ws.received.add(function(message) {
			if(message.type == 'more_search_results') {
				gotMoreResults.dispatch(message.query);
			}
		});
	};

	return {
		unpackComment: unpackComment,
		unpackFilm: unpackFilm,

		get: getFilm,

		gotMoreResults: gotMoreResults,

		setStatus: setStatus,
		postComment: postComment,
		deleteComment: deleteComment,

		init: init
	};

}());
