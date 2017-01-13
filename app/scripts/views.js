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
		
		fa.forms.create(elem.querySelector('form'), function(form) {
			fa.auth.register(form.getData()).then(function() {
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
		.add('name', [fa.forms.maxLen(200), fa.forms.minLen(5)])
		.add('pass1', [fa.forms.maxLen(200), fa.forms.minLen(5)])
		.add('pass2', fa.forms.equal('pass1'));
	};
	
	// inits a login view
	var createLogin = function(elem) {
		render(elem, 'login-templ', {});
		
		fa.forms.create(elem.querySelector('form'), function(form) {
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
	// includes the search form
	var createInner = function(elem) {
		render(elem, 'inner-templ', {});
		
		var searchForm = elem.querySelector('#search-form');
		var queryField = searchForm.querySelector('[name=q]');
		
		searchForm.addEventListener('submit', function(e) {
			e.preventDefault();
			fa.routing.go('search/?q='+encodeURIComponent(queryField.value));
			queryField.blur();
		});
	};
	
	// inits a search results view
	var createResults = function(elem, params) {
		if(!params.hasOwnProperty('q')) fa.routing.go('error');
		
		fa.search.search(params.q).then(function(res) {
			render(elem, 'results-templ', {
				type: {
					films: (res.type == 'films'),
					users: (res.type == 'users')
				},
				items: res.items
			});
			
			if(res.type == 'films') {
				fa.films.onMoreResults(params.q, function() {
					var button = elem.querySelector('.more-results');
					button.addEventListener('click', function() {
						hier.update('/inner/results', params);
					});
					button.classList.remove('hidden');
				});
			}
		}).catch(handleError);
	};
	
	// inits a film view
	var createFilm = function(elem, id) {
		fa.films.get(id).then(function(film) {
			render(elem, 'film-templ', {film: film});
			
			var statusOpts = elem.querySelector('[data-fn=status-opts]');
			
			var addWatchedButton = elem.querySelector('[data-fn=add-watched]');
			var addWatchlistButton = elem.querySelector('[data-fn=add-watchlist]');
			var removeListButton = elem.querySelector('[data-fn=remove-list]');
			
			elem.querySelector('[data-fn=open-status-opts]').addEventListener('click', function() {
				statusOpts.classList.remove('hidden-options');
			});
			
			elem.querySelector('[data-fn=close-status-opts]').addEventListener('click', function() {
				statusOpts.classList.add('hidden-options');
			});
			
			if(addWatchedButton) {
				addWatchedButton.addEventListener('click', function() {
					film.addToWatched().then(function() {
						hier.update('/inner/film', id);
						addMessage({type: 'success', text: 'marked as watched'});
					}).catch(handleError);
				});
			}
			
			if(addWatchlistButton) {
				addWatchlistButton.addEventListener('click', function() {
					film.addToWatchlist().then(function() {
						hier.update('/inner/film', id);
						addMessage({type: 'success', text: 'added to watchlist'});
					}).catch(handleError);
				});
			}
			
			if(removeListButton) {
				removeListButton.addEventListener('click', function() {
					film.removeFromList().then(function() {
						hier.update('/inner/film', id);
						addMessage({type: 'success', text: 'removed'});
					}).catch(handleError);
				});
			}
			
			/*var replyButtons = elem.querySelectorAll('button[data-fn=reply]');
			var commentButton = elem.querySelector('button[data-fn=comment]');
			
			commentButton.addEventListener('click', function(e) {
				var div = document.createElement('div');
				commentButton.parentNode.insertBefore(div, commentButton);
				render(div, 'comment-form-templ');
				commentButton.remove();
			});*/
		}).catch(handleError);
	};
	
	// inits a home view
	var createHome = function(elem) {
		fa.users.get(fa.auth.getUser().pk).then(function(user) {
			render(elem, 'home-templ', {watchlist: user.filmsFuture});
			
			fa.updates.getUnread().then(function(updates) {
				if(updates.length > 0) {
					var div = document.createElement('div');
					render(div, 'home-updates-templ', {items: updates});
					elem.firstChild.insertBefore(div.firstChild,
							elem.firstChild.firstChild);
				}
			}).catch(handleError);
		}).catch(handleError);
	};
	
	// inits an update view
	var createUpdates = function(elem) {
		fa.updates.get().then(function(updates) {
			var isEmpty = (updates.firstItems.length == 0);
			
			render(elem, 'updates-templ', {isEmpty: isEmpty});
			
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
	};
	
	// inits a feed view
	var createFeed = function(elem) {
		fa.feed.get().then(function(feed) {
			var isEmpty = (feed.firstItems.length == 0);
			
			render(elem, 'feed-templ', {isEmpty: isEmpty});
			
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
	};
	
	// inits a profile view
	var createProfile = function(elem, id) {
		fa.users.get(id).then(function(user) {
			render(elem, 'profile-templ', {user: user});
			
			if(user.status.unknown) {
				elem.querySelector('[data-fn=request-friend]').addEventListener('click', function() {
					user.requestFriendship().then(function() {
						hier.update('/inner/profile', id);
					}).catch(handleError);
				});
			}
			
			else if(user.status.waiting) {
				elem.querySelector('[data-fn=accept-friend]').addEventListener('click', function() {
					user.acceptFriendship().then(function() {
						hier.update('/inner/profile', id);
					}).catch(handleError);
				});
				elem.querySelector('[data-fn=reject-friend]').addEventListener('click', function() {
					user.rejectFriendship().then(function() {
						hier.update('/inner/profile', id);
					}).catch(handleError);
				});
			}
		}).catch(handleError);
	};
	
	// inits a settings view
	var createSettings = function(elem) {
		render(elem, 'settings-templ', {});
		elem.querySelector('[data-fn=logout]').addEventListener('click', function() {
			fa.auth.logout();
			fa.routing.go('login');
		});
	};
	
	// inits an error view
	// for the time being, this is the 404 view only
	var createError = function(elem) {
		render(elem, 'error-404-templ', {});
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
	// exports
	// 
	
	return {
		outer: createOuter,
		reg: createReg,
		login: createLogin,
		
		inner: createInner,
		home: createHome,
		updates: createUpdates,
		feed: createFeed,
		results: createResults,
		film: createFilm,
		profile: createProfile,
		settings: createSettings,
		
		error: createError,
		message: createMessage
	};
	
}());
