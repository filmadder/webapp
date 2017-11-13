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
		return fa.models.users.get(userId).then(function(user) {
			var navLinks, removeActiveLinks, addActiveLink;

			user.showData = (user.status.self || user.status.friend);
			fa.views.render(elem, 'user-base', {user: user});

			// nav: active links
			navLinks = fa.dom.filter('a[data-nav]', elem);
			removeActiveLinks = function() {
				fjs.map(function(link) {
					link.classList.remove('selected');
				}, navLinks);
			};
			addActiveLink = function(navId) {
				fjs.map(function(link) {
					if(link.dataset.nav == navId) {
						link.classList.add('selected');
					}
				}, navLinks);
			};
			fa.views.clearNavSignal.add(removeActiveLinks);
			fa.views.markNavSignal.add(addActiveLink);

			// befriending controls
			if(!user.showData) {
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

			// the view object
			return {
				nav: '_',
				title: user.status.self ? 'me' : ['users', user.name],
				remove: function() {
					fa.views.clearNavSignal.remove(removeActiveLinks);
					fa.views.markNavSignal.remove(addActiveLink);
				},
				initSubView: function(list) {
					if(user.showData) {
						if(list == 'friends') {
							return hier.add('/inner/user/friends', user);
						} else if(list == 'tags') {
							return hier.add('/inner/user/tags', user);
						} else {
							return hier.add('/inner/user/films', {user: user, type: list});
						}
					}
				}
			};
		});
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
			template = 'user-films-seen';
		} else if(params.type == 'watching') {
			films = params.user.filmsPresent;
			template = 'user-films-watching';
		} else if(params.type == 'watchlist') {
			films = params.user.filmsFuture;
			template = 'user-films-watchlist';
		} else {
			fa.routing.go('error');
		}

		stateKey = 'user:'+params.user.pk+':'+params.type;
		state = fa.history.getState(stateKey);

		fa.views.render(elem, 'user-films-base', { title: params.type });
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
			renderFilms({films: films, user: params.user});
		});

		films.sort(sortByYear);
		renderFilms({films: films, user: params.user});
		window.scroll(0, state ? state.scroll : 0);

		// the view object
		return Promise.resolve({
			nav: 'user-'+ params.type,
			remove: function() {
				fa.history.setState(stateKey, { scroll: window.pageYOffset });
			}
		});
	};

	// inits a user tags view
	//
	// comprises the list of tags used by a given user
	var createUserTags = function(elem, user) {
		fa.views.render(elem, 'user-tags', {tags: user.tags});

		return Promise.resolve({
			nav: 'user-tags'
		});
	};

	// inits a user friends view
	// comprises the list of a given user's friends
	var createUserFriends = function(elem, user) {
		fa.views.render(elem, 'user-friends', {friends: user.friends});

		return Promise.resolve({
			nav: 'user-friends'
		});
	};


	//
	// exports
	//

	createUser.films = createFilmList;
	createUser.tags = createUserTags;
	createUser.friends = createUserFriends;

	return createUser;

}());
