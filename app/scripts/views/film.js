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
		return fa.models.films.get(id).then(function(film) {
			var state = fa.history.getState('film:'+id.toString());
			var filmTitle;

			fa.views.render(elem, 'film-base', {film: film});

			// status
			hier.add('/inner/film/status', '[data-fn=status]', createStatus, film);

			// comments
			hier.add('/inner/film/comments', '[data-fn=comments]', createComments, {
				film: film,
				spoilersOk: (state && state.checkSpoilers) ? true : false,
				open: (state && state.checkComments) ? true : false
			});

			// user's own tags
			if(film.status == 'seen') {
				hier.add('/inner/film/tags', '[data-fn=own-tags]', createTags, film);
			}

			// styling hack
			filmTitle = fa.dom.get('#film-title', elem);
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

			// the view object
			return {
				nav: '_',
				title: ['films', film.title],
				empty: function() {
					fa.history.setState('film:'+id.toString(), {
						scroll: window.pageYOffset,
						checkSynopsis: getCheckState('#synopsis-text', elem),
						checkTags: getCheckState('#tags-film', elem),
						checkComments: getCheckState('#comments', elem),
						checkSpoilers: getCheckState('#show-spoilers', elem)
					});
				}
			};
		});
	};

	// inits a film status view
	//
	// expects a film object as its param
	var createStatus = function(elem, film) {
		var openButton = fa.dom.get('[data-fn=open-status-opts]', elem);
		var statusOpts = fa.dom.get('[data-fn=status-opts]', elem);
		var buttons, isOpen = false;

		// sets the film's status to that of the clicked status option button
		var changeStatus = function(e) {
			var status = e.target.dataset.fn.split('-')[1];
			var message = fjs.prop(status)({
				'unknown': 'removed',
				'seen': 'marked as seen',
				'watching': 'added to currently watching',
				'watchlist': 'added to watchlist'
			});

			fa.models.films.setStatus(film.pk, status).then(function() {
				hier.update('/inner/film', film.pk);
				hier.add('/mes', {type: 'success', text: message});
			}).catch(fa.views.handleError);
		};

		// opens and closes the status options container
		var toggleOpts = function() {
			if(!isOpen) {
				openButton.classList.add('add-icon', 'shrink');
				openButton.classList.remove(film.status +'-icon');
				statusOpts.classList.remove('hidden');
				isOpen = true;
			} else {
				openButton.classList.remove('add-icon', 'shrink');
				openButton.classList.add(film.status +'-icon');
				statusOpts.classList.add('hidden');
				isOpen = false;
			}
		};

		// remove the unnecessary status option button
		statusOpts.removeChild(
			fa.dom.get('[data-fn=set-'+ film.status +']', elem).parentNode);

		buttons = fa.dom.filter('button[data-fn]', statusOpts);

		// attach the event listeners
		fa.dom.on(buttons, 'click', changeStatus);
		fa.dom.on(openButton, 'click', toggleOpts);

		// the view object
		return Promise.resolve({
			remove: function() {
				fa.dom.off(openButton, 'click', toggleOpts);
				fa.dom.off(buttons, 'click', changeStatus);
			}
		});
	};

	// inits a film comments view
	// 
	// expects a {film, spoilersOk, open} object as its params param
	var createComments = function(elem, params) {
		var comments = (params.spoilersOk)
			? params.film.comments
			: fjs.filter('x => !x.hasSpoilers', params.film.comments);

		fa.views.render(elem, 'film-comments', {
			comments: comments, film: {title: params.film.title},
			spoilersOk: params.spoilersOk, open: params.open });

		// show/hide spoiler comments
		fa.dom.on('[data-fn=show-spoilers]', 'change', function(e) {
			hier.update('/inner/film/comments', {
				film: params.film, spoilersOk: e.target.checked, open: true
			});
		});

		// comment form
		fa.forms.create(fa.dom.get('form', elem), function(form) {
			var data = form.getData();
			var id = params.film.pk;

			fa.models.films.postComment(id, data.comment, data.spoilers).then(function(film) {
				hier.update('/inner/film/comments', {
					film: film, spoilersOk: data.spoilers, open: true
				});
			}).catch(function(error) {
				if(error.code == 'bad_input') {
					if(hier.has('/mes')) hier.remove('/mes');
					form.showError(error.message);
				}
				else hier.add('/mes', {type: 'error', code: error.code});
				form.enable();
			});
		})
		.add('comment', [fa.forms.minLen(6)])
		.add('spoilers', []);

		// delete comment buttons
		fa.dom.on('button[data-fn=del-comment]', 'click', function(e) {
			fa.models.films.deleteComment(params.film.pk, e.target.dataset.comment).then(function() {
				hier.update('/inner/film', params.film.pk);
				hier.add('/mes', {type: 'success', text: 'comment removed'});
			}).catch(function(error) {
				hier.add('/mes', {type: 'error', code: error.code});
			});
		});

		return Promise.resolve({});
	};

	// inits a film tags view
	//
	// expects the film long object as its params param
	var createTags = function(elem, film) {
		fa.views.render(elem, 'film-tagging', {film: film});

		var initSuggComp = function(elem) {
			var comp = {};
			var lis;

			comp.selected = new signals.Signal();

			comp.update = function(suggestions) {
				fa.views.render(elem, 'film-tags-sugg', {suggestions: suggestions});
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
			fa.models.tags.set(film.pk, data.tags).then(function() {
				hier.update('/inner/film', film.pk);
			}).catch(function(error) {
				if(error.code == 'bad_input') {
					if(hier.has('/mes')) hier.remove('/mes');
					form.showError(error.message);
				}
				else hier.add('/mes', {type: 'error', code: error.code});
				form.enable();
			});
		})
		.add('tags', [
			fa.forms.minLen(1), fa.forms.maxLen(32),
			fa.forms.regex(/^[^\s,;\\/\'"]+$/)
		]);

		fa.dom.on(tagsFieldElem, 'input', function() {
			suggComp.update(fa.models.tags.suggest(tagsFieldElem.value));
		});

		fa.dom.on('.tags-form button[type=button]', 'click', function() {
			tagsCheckElem.checked = false;
		});

		// the view object
		return Promise.resolve({
			remove: function() {
				suggComp.remove();
			}
		});
	};


	//
	// exports
	//

	createFilm.comments = createComments;
	createFilm.status = createStatus;
	createFilm.tags = createTags;

	return createFilm;

}());
