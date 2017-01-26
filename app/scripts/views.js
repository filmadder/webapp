fa.views = (function() {
	
	"use strict";
	
	
	// 
	// signals
	// 
	
	// dispatches when the user scrolls to the bottom of the page
	// used by the feed and updates views
	var scrolledToBottom = new signals.Signal();
	
	// window.pageYOffset is better than document.body.scrollTop
	// http://stackoverflow.com/questions/28633221
	window.addEventListener('scroll', function() {
		if(window.innerHeight + window.pageYOffset >= document.body.scrollHeight) {
			scrolledToBottom.dispatch();
		}
	});
	
	// dirty fix to prevent feed items appearing while scrolling through a film
	hasher.changed.add(function() {
		scrolledToBottom.removeAll();
	});
	
	
	// dispatches when a view is successfully rendered
	// used to reset the scroll and to update the inner navigation
	// for the latter: inner views dispatch with their nav IDs
	var renderedView = new signals.Signal();
	
	// reset the scroll 
	renderedView.add(function() {
		window.scroll(0, 0);
	});
	
	
	// 
	// helper functions
	// 
	
	// replaces the contents of the given dom element with the given template,
	// rendered with the given context
	var render = function(elem, templateID, context) {
		var templateElem, rendered;
		
		templateElem = document.getElementById(templateID);
		rendered = Mustache.render(templateElem.innerHTML, context);
		
		elem.innerHTML = rendered;
	};
	
	// expects {code, message} object and acts accordingly
	// for forbidden and not_found redirects the view
	// for bad_input, pending and bug shows error message
	var handleError = function(error) {
		if(error.code == 'forbidden') {
			fa.routing.go('login');
		}
		else if(error.code == 'not_found') {
			fa.routing.go('error');
		}
		else {
			addMessage({type: 'error', code: error.code});
		}
	};
	
	// shows the specified message
	// the params are passed unaltered to the createMessage view
	var addMessage = function(params) {
		if(hier.has('/mes')) hier.update('/mes', params);
		else hier.add('/mes', params);
	};
	
	// if there is an error/success message, it will be removed
	var removeMessage = function() {
		if(hier.has('/mes')) {
			hier.remove('/mes');
			document.getElementById('message-cont').innerHTML = '';
		}
	};
	
	// adds the given state to the local storage
	var setState = function(viewId, state) {
		var key = 'fa_state_' + viewId;
		
		try {
			localStorage.setItem(key, JSON.stringify(state));
		} catch (error) {
			console.error(error);
		}
	};
	
	// returns the state of the specified view or null
	var getState = function(viewId) {
		var key = 'fa_state_' + viewId;
		var value = localStorage.getItem(key);
		
		if(value) {
			try {
				return JSON.parse(value);
			} catch (error) {
				console.error(error);
			}
		}
		
		return null;
	};
	
	
	// 
	// view functions
	// 
	
	// inits an outer view
	var createOuter = function(elem) {
		render(elem, 'outer-templ', {});
	};
	
	// inits a create account view
	var createReg = function(elem) {
		render(elem, 'reg-templ', {});
		renderedView.dispatch();
		
		fa.forms.create(fa.dom.get('form', elem), function(form) {
			fa.auth.register(form.getData()).then(function() {
				fa.routing.go('');
				addMessage({type: 'success', text: 'you are now an adder!'});
			}).catch(function(error) {
				if(error.code == 'bad_input') {
					removeMessage();
					form.showError(error.message);
				}
				else addMessage({type: 'error', code: error.code});
			});
		})
		.add('email', [fa.forms.maxLen(200), fa.forms.email])
		.add('name', [fa.forms.maxLen(200), fa.forms.minLen(5)])
		.add('pass1', [fa.forms.maxLen(200), fa.forms.minLen(5)])
		.add('pass2', fa.forms.equal('pass1'));
	};
	
	// inits a login view
	var createLogin = function(elem) {
		render(elem, 'login-templ', {});
		renderedView.dispatch();
		
		fa.forms.create(fa.dom.get('form', elem), function(form) {
			fa.auth.login(form.getData()).then(function() {
				fa.routing.go('');
			}).catch(function(error) {
				if(error.code == 'bad_input') {
					removeMessage();
					form.showError(error.message);
				}
				else addMessage({type: 'error', code: error.code});
			});
		})
		.add('email', [fa.forms.maxLen(200), fa.forms.email])
		.add('pass', [fa.forms.maxLen(200), fa.forms.minLen(5)]);
	};
	
	// inits an inner view
	// includes the navigation and the search form
	var createInner = function(elem) {
		render(elem, 'inner-templ', {});
		
		// header nav
		var navLinks = fa.dom.filter('header nav a', elem);
		
		renderedView.add(function(navName) {
			if(navName == 'updates' || navName == 'feed') navName = 'news';
			fjs.map(function(link) {
				if(link.dataset.nav == navName) {
					link.classList.add('clicked');
				} else {
					link.classList.remove('clicked');
				}
			}, navLinks);
		});
		
		// search form
		var searchForm = fa.dom.get('#search-form', elem);
		var queryField = fa.dom.get('[name=q]', searchForm);
		
		searchForm.addEventListener('submit', function(e) {
			e.preventDefault();
			fa.routing.go('search/?q='+encodeURIComponent(queryField.value));
			queryField.blur();
		});
	};
	
	// inits a search results view
	var createResults = function(elem, params) {
		if(!params.hasOwnProperty('q')) fa.routing.go('error');
		
		var ready = false;
		var state = getState('results');
		
		fa.search.search(params.q).then(function(res) {
			ready = true;
			
			render(elem, 'results-templ', {
				type: {
					films: (res.type == 'films'),
					users: (res.type == 'users')
				},
				items: res.items
			});
			renderedView.dispatch();
			
			if(res.type == 'films') {
				fa.films.onMoreResults(params.q, function() {
					var button = fa.dom.get('.more-results', elem);
					button.addEventListener('click', function() {
						hier.update('/inner/results', params);
					});
					button.classList.remove('hidden');
				});
			}
			
			if(state) {
				window.scroll(0, state.scroll);
			}
		}).catch(handleError);
		
		window.setTimeout(function() {
			if(!ready) render(elem, 'loading-templ', {});
		}, 500);
		
		return {
			remove: function() {
				setState('results', { scroll: window.pageYOffset });
			}
		};
	};
	
	// inits a film view
	var createFilm = function(elem, id) {
		var ready = false;
		
		fa.films.get(id).then(function(film) {
			ready = true;
			
			render(elem, 'film-templ', {film: film});
			renderedView.dispatch();
			
			// comments
			hier.add('/inner/film/comments', {film: film, spoilersOk: false, open: false});
			
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
					addMessage({type: 'success', text: 'marked as watched'});
				}).catch(handleError);
			});
			fa.dom.on('[data-fn=add-watchlist]', 'click', function() {
				film.addToWatchlist().then(function() {
					hier.update('/inner/film', id);
					addMessage({type: 'success', text: 'added to watchlist'});
				}).catch(handleError);
			});
			fa.dom.on('[data-fn=remove-list]', 'click', function() {
				film.removeFromList().then(function() {
					hier.update('/inner/film', id);
					addMessage({type: 'success', text: 'removed'});
				}).catch(handleError);
			});
		}).catch(handleError);
		
		window.setTimeout(function() {
			if(!ready) render(elem, 'loading-templ', {});
		}, 500);
	};
	
	// inits a film comments view
	// expects a {film, spoilersOk, open} object as its params param
	var createComments = function(elem, params) {
		var comments = (params.spoilersOk)
			? params.film.comments
			: fjs.filter('x => !x.hasSpoilers', params.film.comments);
		
		render(elem, 'comments-templ', {
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
					removeMessage();
					form.showError(error.message);
				}
				else addMessage({type: 'error', code: error.code});
			});
		})
		.add('comment', [fa.forms.minLen(6)])
		.add('spoilers', []);
		
		// delete comment buttons
		fa.dom.on('button[data-fn=del-comment]', 'click', function(e) {
			fa.films.deleteComment(params.film.pk, e.target.dataset.comment).then(function() {
				hier.update('/inner/film', params.film.pk);
				addMessage({type: 'success', text: 'comment removed'});
			}).catch(function(error) {
				addMessage({type: 'error', code: error.code});
			});
		});
	};
	
	// inits a home view
	var createHome = function(elem) {
		var ready = false;
		
		fa.users.get(fa.auth.getUser().pk).then(function(user) {
			ready = true;
			
			render(elem, 'home-templ', {watchlist: user.filmsFuture});
			renderedView.dispatch();
			
			fa.updates.getUnread().then(function(updates) {
				if(updates.length > 0) {
					var div = document.createElement('div');
					render(div, 'home-updates-templ', {items: updates});
					elem.firstChild.insertBefore(div.firstChild,
							elem.firstChild.firstChild);
				}
			}).catch(handleError);
		}).catch(handleError);
		
		window.setTimeout(function() {
			if(!ready) render(elem, 'loading-templ', {});
		}, 500);
	};
	
	// inits a news view
	// this is the container for the updates and friend's activity views
	var createNews = function(elem) {
		render(elem, 'news-templ', {});
		
		var navLinks = fa.dom.filter('.internal-feed-links a', elem);
		
		renderedView.add(function(navName) {
			fjs.map(function(link) {
				if(link.dataset.nav == navName) {
					link.classList.add('selected');
				} else {
					link.classList.remove('selected');
				}
			}, navLinks);
		});
	};
	
	// inits an update view
	var createUpdates = function(elem) {
		var ready = false;
		
		fa.updates.get().then(function(updates) {
			ready = true;
			
			var isEmpty = (updates.firstItems.length == 0);
			
			render(elem, 'updates-templ', {isEmpty: isEmpty});
			renderedView.dispatch('updates');
			
			var appendItems = function(items) {
				var div = document.createElement('div');
				render(div, 'update-items-templ', {items: items});
				elem.firstChild.appendChild(div);
				
				scrolledToBottom.addOnce(function() {
					updates.loadMore().then(function(newItems) {
						if(newItems.length > 0) {
							appendItems(newItems);
						}
					}).catch(handleError);
				});
			};
			
			if(!isEmpty) {
				appendItems(updates.firstItems);
			}
			
		}).catch(handleError);
		
		window.setTimeout(function() {
			if(!ready) render(elem, 'loading-templ', {});
		}, 500);
	};
	
	// inits a feed view
	var createFeed = function(elem) {
		var ready = false;
		
		fa.feed.get().then(function(feed) {
			ready = true;
			
			var isEmpty = (feed.firstItems.length == 0);
			
			render(elem, 'feed-templ', {isEmpty: isEmpty});
			renderedView.dispatch('feed');
			
			var appendItems = function(items) {
				var div = document.createElement('div');
				render(div, 'feed-items-templ', {items: items});
				elem.firstChild.appendChild(div);
				
				scrolledToBottom.addOnce(function() {
					feed.loadMore().then(function(newItems) {
						if(newItems.length > 0) {
							appendItems(newItems);
						}
					}).catch(handleError);
				});
			};
			
			if(!isEmpty) {
				appendItems(feed.firstItems);
			}
			
		}).catch(handleError);
		
		window.setTimeout(function() {
			if(!ready) render(elem, 'loading-templ', {});
		}, 500);
	};
	
	// inits a profile view
	var createProfile = function(elem, id) {
		var ready = false;
		
		fa.users.get(id).then(function(user) {
			ready = true;
			
			user.showData = (user.status.self || user.status.friend);
			
			render(elem, 'profile-templ', {user: user});
			renderedView.dispatch(user.status.self ? 'me' : 'user');
			
			fa.dom.on('[data-fn=request-friend]', 'click', function() {
				user.requestFriendship().then(function() {
					hier.update('/inner/profile', id);
				}).catch(handleError);
			});
			fa.dom.on('[data-fn=accept-friend]', 'click', function() {
				user.acceptFriendship().then(function() {
					hier.update('/inner/profile', id);
				}).catch(handleError);
			});
			fa.dom.on('[data-fn=reject-friend]', 'click', function() {
				user.rejectFriendship().then(function() {
					hier.update('/inner/profile', id);
				}).catch(handleError);
			});
		}).catch(handleError);
		
		window.setTimeout(function() {
			if(!ready) render(elem, 'loading-templ', {});
		}, 500);
	};
	
	// inits a settings view
	var createSettings = function(elem) {
		render(elem, 'settings-templ', {});
		renderedView.dispatch('me');
		
		fa.dom.on('[data-fn=logout]', 'click', function() {
			fa.auth.logout();
			fa.routing.go('login');
		});
	};
	
	// creates a loading view
	// this is the snake chasing its tail :D
	var createLoading = function(elem) {
		render(elem, 'loading-templ', {});
		renderedView.dispatch();
	};
	
	// inits an error view
	// for the time being, this is the 404 view only
	var createError = function(elem) {
		render(elem, 'error-404-templ', {});
		renderedView.dispatch();
	};
	
	// inits a message view
	// expects {type: error, code} for error messages
	// expects {type: success, text} for success messages
	var createMessage = function(elem, params) {
		if(params.type == 'error') {
			render(elem, 'error-message-templ', {
				code: {
					badInput: (params.code == 'bad_input'),
					bug: (params.code == 'bug'),
					forbidden: (params.code == 'forbidden'),
					notFound: (params.code == 'not_found'),
					pending: (params.code == 'pending')
				}
			});
		}
		else if(params.type == 'success') {
			render(elem, 'success-message-templ', {
				text: params.text
			});
			window.setTimeout(removeMessage, 1500);
		}
	};
	
	
	// 
	// hier hooks
	// 
	
	// if a view object (the return value of a view constructor) defines a
	// remove method, call it right before removing the view
	hier.on('pre-remove', function(path, view) {
		if(view && view.hasOwnProperty('remove')) {
			view.remove();
		}
	});
	
	
	// 
	// exports
	// 
	
	return {
		outer: createOuter,
		reg: createReg,
		login: createLogin,
		
		inner: createInner,
		home: createHome,
		news: createNews,
		updates: createUpdates,
		feed: createFeed,
		results: createResults,
		film: createFilm,
		comments: createComments,
		profile: createProfile,
		settings: createSettings,
		loading: createLoading,
		
		error: createError,
		message: createMessage
	};
	
}());
