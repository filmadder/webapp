fa.views.film = (function() {

	"use strict";


	//
	// helpers
	//

	// returns boolean indicating whether the specified checkbox input is
	// checked or not; if the input does not exist, returns false
	// 
	// helper for setting the history states
	var getCheckState = function(inputId, elem) {
		try {
			return fa.dom.get(inputId, elem).checked;
		} catch (error) {
			return false;
		}
	};


	//
	// views
	//

	// inits a film view
	// 
	// includes the film info, status; as well as the lists of friends who have
	// added the film as watched/watchlisted and the tags the friends have
	// given to the film (this is different from the user's own tags component)
	// 
	// comments and tags are handled by separate views
	// 
	// expects the id of the film as its view param
	var createFilm = function(elem, id) {
		var ready = false;
		var state = fa.history.getState('film:'+id.toString());

		fa.films.get(id).then(function(film) {
			ready = true;

			fa.views.render(elem, 'film-templ', {film: film});
			fa.title.set(['films', film.title]);

			// comments
			hier.add('/inner/film/comments', {
				film: film,
				spoilersOk: (state && state.checkSpoilers) ? true : false,
				open: (state && state.checkComments) ? true : false
			});

			// film tags
			if(film.status.watched) {
				hier.add('/inner/film/tags', film);
			}

			// film status
			var statusOpts = fa.dom.get('[data-fn=status-opts]', elem);

			fa.dom.on(fa.dom.get('[data-fn=open-status-opts]', elem), 'click', function() {
				statusOpts.classList.remove('hidden-options');
			});
			fa.dom.on(fa.dom.get('[data-fn=close-status-opts]', elem), 'click', function() {
				statusOpts.classList.add('hidden-options');
			});

			fa.dom.on('[data-fn=add-watched]', 'click', function() {
				film.addToWatched().then(function() {
					hier.update('/inner/film', id);
					fa.views.addMessage({type: 'success', text: 'marked as watched'});
				}).catch(fa.views.handleError);
			});
			fa.dom.on('[data-fn=add-watchlist]', 'click', function() {
				film.addToWatchlist().then(function() {
					hier.update('/inner/film', id);
					fa.views.addMessage({type: 'success', text: 'added to watchlist'});
				}).catch(fa.views.handleError);
			});
			fa.dom.on('[data-fn=remove-list]', 'click', function() {
				film.removeFromList().then(function() {
					hier.update('/inner/film', id);
					fa.views.addMessage({type: 'success', text: 'removed'});
				}).catch(fa.views.handleError);
			});

			// styling hack
			var filmTitle = fa.dom.get('#film-title');
			if (filmTitle.innerText.length > 80) {
				filmTitle.classList.add('very-long-title');
			} else if (filmTitle.innerText.length > 35 && filmTitle.innerText.length < 80) {
				filmTitle.classList.add('long-title');
			}

			// history state
			if(state) {
				try {
					fa.dom.get('#synopsis-text', elem).checked = state.checkSynopsis;
					fa.dom.get('#tags-film', elem).checked = state.checkTags;
				} catch (error) {}
				window.scroll(0, state.scroll);
			} else {
				window.scroll(0, 0);
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
			empty: function() {
				if(ready) {
					fa.history.setState('film:'+id.toString(), {
						scroll: window.pageYOffset,
						checkSynopsis: getCheckState('#synopsis-text', elem),
						checkTags: getCheckState('#tags-film', elem),
						checkComments: getCheckState('#comments', elem),
						checkSpoilers: getCheckState('#show-spoilers', elem)
					});
				}
			},
			remove: function() {
				elem.innerHTML = '';
			}
		};
	};

	// inits a film comments view
	// 
	// expects a {film, spoilersOk, open} object as its params param
	var createComments = function(elem, params) {
		var comments = (params.spoilersOk)
			? params.film.comments
			: fjs.filter('x => !x.hasSpoilers', params.film.comments);

		fa.views.render(elem, 'comments-templ', {
			comments: comments, film: {title: params.film.title},
			spoilersOk: params.spoilersOk, open: params.open });

		// show/hide spoiler comments
		fa.dom.on('[data-fn=show-spoilers]', 'change', function(e) {
			hier.update('/inner/film/comments', {
				film: params.film, spoilersOk: e.target.checked, open: true});
		});

		// comment form
		fa.forms.create(fa.dom.get('form', elem), function(form) {
			var data = form.getData();
			var id = params.film.pk;

			fa.films.postComment(id, data.comment, data.spoilers).then(function(film) {
				hier.update('/inner/film/comments', {
					film: film, spoilersOk: data.spoilers, open: true});
			}).catch(function(error) {
				if(error.code == 'bad_input') {
					app.views.removeMessage();
					form.showError(error.message);
				}
				else fa.views.addMessage({type: 'error', code: error.code});
				form.enable();
			});
		})
		.add('comment', [fa.forms.minLen(6)])
		.add('spoilers', []);

		// delete comment buttons
		fa.dom.on('button[data-fn=del-comment]', 'click', function(e) {
			fa.films.deleteComment(params.film.pk, e.target.dataset.comment).then(function() {
				hier.update('/inner/film', params.film.pk);
				fa.views.addMessage({type: 'success', text: 'comment removed'});
			}).catch(function(error) {
				fa.views.addMessage({type: 'error', code: error.code});
			});
		});
	};

	// inits a film tags view
	//
	// expects the film long object as its params param
	var createFilmTags = function(elem, film) {
		fa.views.render(elem, 'film-tags-templ', {film: film});

		var initSuggComp = function(elem) {
			var comp = {};
			var lis;

			comp.selected = new signals.Signal();

			comp.update = function(suggestions) {
				fa.views.render(elem, 'film-tags-sugg-templ', {suggestions: suggestions});
				lis = fa.dom.filter('li', elem);
				fa.dom.on(lis, 'click', function(e) {
					comp.selected.dispatch(e.target.innerHTML);
				});
			};

			comp.remove = function() {
				comp.selected.dispose();
				elem.innerHTML = '';
			};

			return comp;
		};

		var tagsFormElem = fa.dom.get('form.tags-form', elem);
		var tagsCheckElem = fa.dom.get('#open-form', elem);
		var tagsFieldElem = fa.dom.get('input[data-fn=tags-field]', elem);

		var suggComp = initSuggComp(fa.dom.get('.sugg-cont', elem));
		suggComp.selected.add(function(value) {
			tagsFieldElem.value = value;
			suggComp.update([]);
			tagsFieldElem.focus();
		});

		fa.forms.create(tagsFormElem, function(form) {
			var data = form.getData();
			fa.tags.set(film.pk, data.tags).then(function() {
				hier.update('/inner/film', film.pk);
			}).catch(function(error) {
				if(error.code == 'bad_input') {
					app.views.removeMessage();
					form.showError(error.message);
				}
				else fa.views.addMessage({type: 'error', code: error.code});
				form.enable();
			});
		})
		.add('tags', [
			fa.forms.minLen(1), fa.forms.maxLen(32),
			fa.forms.regex(/^[^\s,;\\/\'"]+$/)
		]);

		fa.dom.on(tagsFieldElem, 'input', function() {
			suggComp.update(fa.tags.suggest(tagsFieldElem.value));
		});

		fa.dom.on('.tags-form button[type=button]', 'click', function() {
			tagsCheckElem.checked = false;
		});

		// the view object
		return {
			remove: function() {
				suggComp.remove();
				elem.innerHTML = '';
			}
		};
	};


	//
	// exports
	//

	createFilm.comments = createComments;
	createFilm.tags = createFilmTags;

	return createFilm;

}());
