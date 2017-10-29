fa.views.user = (function() {

	"use strict";


	//
	// views
	//

	// inits a user view
	//
	// the view includes some info about the user specified by the id param
	//
	// if the viewed is the logged in user or a friend of theirs, then the view
	// contains sub-views for the viewed's lists of films, tags, and friends
	//
	// otherwise, the rest of the view comprises befriending controls
	var createUser = function(elem, userId) {
		var ready = false;

		var loaded = new signals.Signal(); loaded.memorize = true;

		fa.users.get(userId).then(function(user) {
			ready = true;

			user.showData = (user.status.self || user.status.friend);

			fa.views.render(elem, 'user-templ', {user: user});
			fa.title.set(user.status.self ? 'me' : ['users', user.name]);

			loaded.dispatch(user);

			if(!user.showData) {  // befriending controls
				fa.dom.on('[data-fn=request-friend]', 'click', function() {
					user.requestFriendship().then(function() {
						hier.update('/inner/user', userId);
					}).catch(fa.views.handleError);
				});
				fa.dom.on('[data-fn=accept-friend]', 'click', function() {
					user.acceptFriendship().then(function() {
						hier.update('/inner/user', userId);
					}).catch(fa.views.handleError);
				});
				fa.dom.on('[data-fn=reject-friend]', 'click', function() {
					user.rejectFriendship().then(function() {
						hier.update('/inner/user', userId);
					}).catch(fa.views.handleError);
				});
			}
		}).catch(fa.views.handleError);

		// show the snake if loading takes too long
		window.setTimeout(function() {
			if(!ready) {
				fa.views.render(elem, 'loading-templ', {});
				fa.title.set('loading');
			}
		}, 500);

		// the view object
		return {
			nav: '_',
			loaded: loaded,
			remove: function() {
				loaded.dispose();
				elem.innerHTML = '';
			}
		};
	};

	// inits a film list view
	// 
	// comprises a film listing, as it would appear in user views
	// handles the sorting
	// 
	// expects params to be a {type, user} object, where type is one of: seen,
	// watching, watchlist
	var createFilmList = function(elem, params) {
		var stateKey, state;
		var films, renderFilms;
		var template, container, buttons;

		var sortByYear = function(a, b) { return a.year.localeCompare(b.year); };
		var sortByTitle = function(a, b) { return a.title.localeCompare(b.title); };

		if(params.type == 'seen') {
			films = params.user.filmsPast;
			template = 'user-films-seen-templ';
		} else if(params.type == 'watching') {
			films = params.user.filmsPresent;
			template = 'user-films-watching-templ';
		} else if(params.type == 'watchlist') {
			films = params.user.filmsFuture;
			template = 'user-films-watchlist-templ';
		} else {
			fa.routing.go('error');
		}

		stateKey = 'user:'+params.user.pk+':'+params.type;
		state = fa.history.getState(stateKey);

		fa.views.render(elem, 'user-films-templ', { title: params.type });
		container = fa.dom.get('[data-fn=film-list]', elem);
		buttons = fa.dom.filter('button[data-sort]', elem);

		renderFilms = fjs.curry(fa.views.render)(container)(template);

		fa.dom.on(buttons, 'click', function(e) {
			if(e.target.classList.contains('selected')) return;

			fjs.map(function(x) { x.classList.remove('selected'); }, buttons);
			e.target.classList.add('selected');

			switch(e.target.dataset.sort) {
				case 'year': films.sort(sortByYear); break;
				case 'title': films.sort(sortByTitle); break;
			}
			renderFilms({films: films});
		});

		films.sort(sortByYear);
		renderFilms({films: films});
		window.scroll(0, state ? state.scroll : 0);

		// the view object
		return {
			remove: function() {
				fa.history.setState(stateKey, { scroll: window.pageYOffset });
				elem.innerHTML = '';
			}
		};
	};

	// inits a user tags view
	//
	// comprises the list of tags used by a given user
	var createUserTags = function(elem, user) {
		fa.views.render(elem, 'user-tags-templ', {tags: user.tags});
	};

	// inits a user friends view
	// comprises the list of a given user's friends
	var createUserFriends = function(elem, user) {
		fa.views.render(elem, 'user-friends-templ', {friends: user.friends});
	};


	//
	// exports
	//

	createUser.films = createFilmList;
	createUser.tags = createUserTags;
	createUser.friends = createUserFriends;

	return createUser;

}());
