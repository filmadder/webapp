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
	
	
	// dispatches when the active nav links should be cleared
	// triggered by the post-remove hier hook
	var clearNavSignal = new signals.Signal();
	
	// dispatches when a nav link should be marked as active
	// dispatches with one of: feed, me
	// triggered by the pre-init hier hook
	var markNavSignal = new signals.Signal();
	
	
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
	// view constructors
	// 
	// view constructors expect a dom element, the contents of which will be
	// replaced with the view's rendered template, and optionally a second
	// argument which varies from view to view
	// 
	// a constructor, unless the view is a simple one, returns the so-called
	// view object which should contain a remove function that cleans up when
	// the view is destroyed
	
	// inits an outer view
	// 
	// this view is a simple container for the login and reg views and
	// comprises a header containing the name and logo
	var createOuter = function(elem) {
		render(elem, 'outer-templ', {});
	};
	
	// inits a create account view
	// 
	// comprises the registration form
	var createReg = function(elem) {
		render(elem, 'reg-templ', {});
		
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
				form.enable();
			});
		})
		.add('email', [fa.forms.maxLen(200), fa.forms.email])
		.add('name', [fa.forms.maxLen(200), fa.forms.minLen(5)])
		.add('pass1', [fa.forms.maxLen(200), fa.forms.minLen(5)])
		.add('pass2', fa.forms.equal('pass1'));
		
		return {
			remove: function() {
				elem.innerHTML = '';
			}
		};
	};
	
	// inits a login view
	// 
	// comprises the login form
	var createLogin = function(elem) {
		render(elem, 'login-templ', {});
		
		fa.forms.create(fa.dom.get('form', elem), function(form) {
			fa.auth.login(form.getData()).then(function() {
				fa.routing.go('');
			}).catch(function(error) {
				if(error.code == 'bad_input') {
					removeMessage();
					form.showError(error.message);
				}
				else addMessage({type: 'error', code: error.code});
				form.enable();
			});
		})
		.add('email', [fa.forms.maxLen(200), fa.forms.email])
		.add('pass', [fa.forms.maxLen(200), fa.forms.minLen(5)]);
		
		return {
			remove: function() {
				elem.innerHTML = '';
			}
		};
	};
	
	// inits an inner view
	// 
	// includes the navigation, the search form, and the #view element that is
	// the container of all inner views
	var createInner = function(elem) {
		render(elem, 'inner-templ', {});
		
		// header nav
		var navLinks = fa.dom.filter('header nav a', elem);
		var removeActiveLinks = function() {
			fjs.map(function(link) {
				link.classList.remove('clicked');
			}, navLinks);
		};
		var addActiveLink = function(navId) {
			fjs.map(function(link) {
				if(link.dataset.nav == navId) {
					link.classList.add('clicked');
				}
			}, navLinks);
		};
		clearNavSignal.add(removeActiveLinks);
		markNavSignal.add(addActiveLink);
		
		// search form
		var searchForm = fa.dom.get('#search-form', elem);
		var queryField = fa.dom.get('[name=q]', searchForm);
		var resetButton = fa.dom.get('button[type=reset]', searchForm);
		
		fa.dom.on(queryField, 'focus', function() {
			resetButton.classList.add('visible');
		});
		fa.dom.on(queryField, 'blur', function() {
			resetButton.classList.remove('visible');
		});
		fa.dom.on(resetButton, 'click', function() {
			queryField.focus();
		});
		
		searchForm.addEventListener('submit', function(e) {
			e.preventDefault();
			if(queryField.value) {
				fa.routing.go('search/?q='+encodeURIComponent(queryField.value));
				queryField.blur();
			}
		});
		
		// unread updates marker
		var markerElem = fa.dom.get('.notification-marker', elem);
		fa.updates.gotUnread.add(function() {
			markerElem.classList.remove('hidden');
		});
		
		// the view object
		return {
			remove: function() {
				fa.updates.gotUnread.removeAll();
				
				clearNavSignal.remove(removeActiveLinks);
				markNavSignal.remove(addActiveLink);
				
				elem.innerHTML = '';
			}
		};
	};
	
	// inits a search results view
	// 
	// comprises the list of results of any film or user search
	// 
	// as param expects an object with a property q that contains the
	// yet-to-be-processed search query
	var createResults = function(elem, params) {
		if(!params.hasOwnProperty('q') || !params.q) {
			fa.routing.go('error');
			return;
		}
		
		var ready = false;
		var state = fa.history.getState('results');
		
		// shows the more results button
		var showMoreResults = function() {
			var button = fa.dom.get('.more-results', elem);
			button.addEventListener('click', function() {
				hier.update('/inner/results', params);
			});
			button.classList.remove('hidden');
		};
		
		fa.search.search(params.q).then(function(res) {
			ready = true;
			
			render(elem, 'results-templ', {
				type: {
					films: (res.type == 'films'),
					users: (res.type == 'users')
				},
				items: res.items
			});
			
			if(state) {
				window.scroll(0, state.scroll);
			} else {
				window.scroll(0, 0);
			}
			
			if(res.type == 'films') {
				fa.films.gotMoreResults.addOnce(function(mesQuery) {
					if(mesQuery == params.q) {
						showMoreResults();
					}
				});
			}
		}).catch(handleError);
		
		window.setTimeout(function() {
			if(!ready) render(elem, 'loading-templ', {});
		}, 500);
		
		return {
			remove: function() {
				fa.films.gotMoreResults.removeAll();
				if(ready) {
					fa.history.setState('results', {
						scroll: window.pageYOffset
					});
				}
				elem.innerHTML = '';
			}
		};
	};
	
	// inits a film view
	// 
	// includes the film info, status, and tags; as well as the lists of
	// friends who have added the film as watched/watchlisted and the tags the
	// friends have given to the film
	// 
	// comments are handled by a separate view
	// 
	// expects the id of the film as its view param
	var createFilm = function(elem, id) {
		var ready = false;
		var state = fa.history.getState('film:'+id.toString());
		
		fa.films.get(id).then(function(film) {
			ready = true;
			
			render(elem, 'film-templ', {film: film});
			
			// comments
			hier.add('/inner/film/comments', {
				film: film,
				spoilersOk: (state && state.checkSpoilers) ? true : false,
				open: (state && state.checkComments) ? true : false
			});
			
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
			
			// set tags form
			if(film.status.watched) {
				var tagsFormElem = fa.dom.get('form.tags-form', elem);
				var tagsCheckElem = fa.dom.get('#open-form', elem);
				
				fa.forms.create(tagsFormElem, function(form) {
					var data = form.getData();
					fa.tags.set(id, data.tags).then(function() {
						hier.update('/inner/film', id);
					}).catch(function(error) {
						if(error.code == 'bad_input') {
							removeMessage();
							form.showError(error.message);
						}
						else addMessage({type: 'error', code: error.code});
						form.enable();
					});
				})
				.add('tags', [
					fa.forms.minLen(1), fa.forms.maxLen(32),
					fa.forms.regex(/^[^\s,;\\/\'"]+$/)
				]);
				
				fa.dom.on('.tags-form button[type=button]', 'click', function() {
					tagsCheckElem.checked = false;
				});
			}
			
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
		}).catch(handleError);
		
		window.setTimeout(function() {
			if(!ready) render(elem, 'loading-templ', {});
		}, 500);
		
		return {
			remove: function() {
				if(ready) {
					fa.history.setState('film:'+id.toString(), {
						scroll: window.pageYOffset,
						checkSynopsis: getCheckState('#synopsis-text', elem),
						checkTags: getCheckState('#tags-film', elem),
						checkComments: getCheckState('#comments', elem),
						checkSpoilers: getCheckState('#show-spoilers', elem)
					});
				}
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
				form.enable();
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
	// 
	// includes a sub-navigation with links to the user's film lists and
	// updates and a container for these sub-views
	var createHome = function(elem) {
		render(elem, 'home-templ', {});
		
		var navLinks = fa.dom.filter('a', elem);
		var removeActiveLinks = function() {
			fjs.map(function(link) {
				link.classList.remove('clicked');
			}, navLinks);
		};
		var addActiveLink = function(navId) {
			fjs.map(function(link) {
				if(link.dataset.nav == navId) {
					link.classList.add('clicked');
				}
			}, navLinks);
		};
		clearNavSignal.add(removeActiveLinks);
		markNavSignal.add(addActiveLink);
		
		// the view object
		return {
			remove: function() {
				clearNavSignal.remove(removeActiveLinks);
				markNavSignal.remove(addActiveLink);
				
				elem.innerHTML = '';
			}
		};
	};
	
	// inits a home film list view
	// 
	// loads and renders either the user's watched or the user's watchlist
	// expects one of [watched, watchlist] as its view param
	var createHomeList = function(elem, param) {
		if(param != 'watched' && param != 'watchlist') {
			fa.routing.go('error');
		}
		
		var ready = false;
		var state = fa.history.getState(param);
		
		fa.users.get(fa.auth.getUser().pk).then(function(user) {
			ready = true;
			
			if(param == 'watched') {
				render(elem, 'home-watched-templ', {
					watched: user.filmsPast
				});
			} else {
				render(elem, 'home-watchlist-templ', {
					watchlist: user.filmsFuture
				});
			}
			
			if(state) {
				window.scroll(0, state.scroll);
			}
		}).catch(handleError);
		
		window.setTimeout(function() {
			if(!ready) render(elem, 'loading-templ', {});
		}, 500);
		
		// the view object
		return {
			remove: function() {
				if(ready) {
					fa.history.setState(param, {
						scroll: window.pageYOffset 
					});
				}
				elem.innerHTML = '';
			}
		};
	};
	
	// inits an update view
	// 
	// comprises a listing of updates, the latter being dynamically loaded each
	// time the user scrolls to the bottom of the page (unless the end of the
	// updates feed is reached)
	var createUpdates = function(elem) {
		var ready = false;
		var state = fa.history.getState('updates');
		var numPages = (state) ? state.numPages : 1;
		
		fa.updates.get(numPages).then(function(updates) {
			ready = true;
			
			var isEmpty = (updates.firstItems.length == 0);
			
			render(elem, 'updates-templ', {isEmpty: isEmpty});
			
			var appendItems = function(items) {
				var div = document.createElement('div');
				render(div, 'update-items-templ', {items: items});
				elem.firstChild.appendChild(div);
				
				scrolledToBottom.addOnce(function() {
					updates.loadMore().then(function(newItems) {
						numPages = updates.getNumPages();
						if(newItems.length > 0) {
							appendItems(newItems);
						}
					}).catch(handleError);
				});
			};
			
			if(!isEmpty) {
				appendItems(updates.firstItems);
			}
			
			if(state) {
				window.scroll(0, state.scroll);
			} else {
				window.scroll(0, 0);
			}
		}).catch(handleError);
		
		// show the snake if loading takes too long
		window.setTimeout(function() {
			if(!ready) render(elem, 'loading-templ', {});
		}, 500);
		
		// the view object
		return {
			remove: function() {
				if(ready) {
					if(!window.pageYOffset) {
						numPages = 1;  // avoid loading too many feed items
					}
					fa.history.setState('updates', {
						numPages: numPages,
						scroll: window.pageYOffset
					});
				}
				elem.innerHTML = '';
			}
		};
	};
	
	// inits a feed view
	// 
	// comprises a listing of feed items, the latter being dynamically loaded
	// each time the user scrolls to the bottom of the page (unless the end of
	// the feed is reached)
	var createFeed = function(elem) {
		var ready = false;
		var state = fa.history.getState('feed');
		var numPages = (state) ? state.numPages : 1;
		
		fa.feed.get(numPages).then(function(feed) {
			var isEmpty = (feed.firstItems.length == 0);
			var appendItems = function(items) {
				var div = document.createElement('div');
				render(div, 'feed-items-templ', {items: items});
				elem.firstChild.appendChild(div);
				
				scrolledToBottom.addOnce(function() {
					feed.loadMore().then(function(newItems) {
						numPages = feed.getNumPages();
						if(newItems.length > 0) {
							appendItems(newItems);
						}
					}).catch(handleError);
				});
			};
			
			ready = true;
			render(elem, 'feed-templ', {isEmpty: isEmpty});
			
			if(!isEmpty) {
				appendItems(feed.firstItems);
			}
			
			if(state) {
				window.scroll(0, state.scroll);
			} else {
				window.scroll(0, 0);
			}
		}).catch(handleError);
		
		// show the snake if loading takes too long
		window.setTimeout(function() {
			if(!ready) render(elem, 'loading-templ', {});
		}, 500);
		
		// the view object
		return {
			remove: function() {
				if(ready) {
					if(!window.pageYOffset) {
						numPages = 1;  // avoid loading too many feed items
					}
					fa.history.setState('feed', {
						numPages: numPages,
						scroll: window.pageYOffset
					});
				}
				elem.innerHTML = '';
			}
		};
	};
	
	// inits a tag view
	// 
	// this view contains the users that have been used a particular tag and
	// the films that have been tagged with it
	// 
	// the params argument is expected to be a {tag} object
	var createTag = function(elem, params) {
		var ready = false;
		var state = fa.history.getState('tag:'+params.tag);
		
		fa.tags.get(params.tag).then(function(tagObj) {
			ready = true;
			
			render(elem, 'tag-templ', {tag: tagObj});
			
			if(state) {
				for (var i = 0; i < state.opened.length; i++) {
					fa.dom.get('#' + state.opened[i]).checked = true;
				}
				window.scroll(0, state.scroll);
			} else {
				window.scroll(0, 0);
			}
		}).catch(handleError);
		
		window.setTimeout(function() {
			if(!ready) render(elem, 'loading-templ', {});
		}, 500);
		
		return {
			remove: function() {
				if(ready) {
					var opened = fjs.map(function(currentElem) {
						return currentElem.id;
					}, fa.dom.filter('.accordion:checked'));

					fa.history.setState('tag:'+params.tag, {
						opened: opened,
						scroll: window.pageYOffset
					});
				}
				elem.innerHTML = '';
			}
		};
	};
	
	// inits a profile view
	var createProfile = function(elem, id) {
		var ready = false;
		var state = fa.history.getState('profile:'+id.toString());
		
		fa.users.get(id).then(function(user) {
			ready = true;
			
			user.showData = (user.status.self || user.status.friend);
			
			render(elem, 'profile-templ', {user: user});
			
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
			
			if(state) {
				try {
					fa.dom.get('#peek-watched', elem).checked = state.checkWatched;
					fa.dom.get('#peek-watchlist', elem).checked = state.checkWatchlist;
					fa.dom.get('#peek-tags', elem).checked = state.checkTags;
					fa.dom.get('#peek-friends', elem).checked = state.checkFriends;
				} catch (error) {}
				window.scroll(0, state.scroll);
			} else {
				window.scroll(0, 0);
			}
		}).catch(handleError);
		
		window.setTimeout(function() {
			if(!ready) render(elem, 'loading-templ', {});
		}, 500);
		
		return {
			remove: function() {
				if(ready) {
					fa.history.setState('profile:'+id.toString(), {
						scroll: window.pageYOffset,
						checkWatched: getCheckState('#peek-watched', elem),
						checkWatchlist: getCheckState('#peek-watchlist', elem),
						checkTags: getCheckState('#peek-tags', elem),
						checkFriends: getCheckState('#peek-friends', elem)
					});
				}
				elem.innerHTML = '';
			}
		};
	};
	
	// inits a settings view
	// 
	// this view contains the change password form and the logout button
	var createSettings = function(elem) {
		render(elem, 'settings-templ', {});
		window.scroll(0, 0);
		
		// change password
		fa.forms.create(fa.dom.get('#password-form'), function(form) {
			var load = form.getData();
			load = {oldPass: load.pass0, newPass: load.pass1};
			
			fa.auth.changePass(load).then(function() {
				hier.update('/inner/settings');
				addMessage({type: 'success', text: 'password changed'});
			}).catch(function(error) {
				if(error.code == 'bad_input') {
					removeMessage();
					form.showError(error.message);
				}
				else addMessage({type: 'error', code: error.code});
				form.enable();
			});
		})
		.add('pass0', [fa.forms.maxLen(200), fa.forms.minLen(5)])
		.add('pass1', [fa.forms.maxLen(200), fa.forms.minLen(5)])
		.add('pass2', [fa.forms.equal('pass1')]);
		
		// logout
		fa.dom.on('[data-fn=logout]', 'click', function() {
			fa.auth.logout();
			fa.routing.go('login');
		});
		
		return {
			remove: function() {
				elem.innerHTML = '';
			}
		};
	};
	
	// inits an error view
	// for the time being, this is the 404 view only
	var createError = function(elem) {
		render(elem, 'error-404-templ', {});
		window.scroll(0, 0);
		
		return {
			remove: function() {
				elem.innerHTML = '';
			}
		};
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
	
	// dispatches the markNavSignal with the correct string to be marked as the
	// currently active navigation link
	hier.on('pre-init', function(path, params) {
		if(path == '/inner/home/watchlist') {
			markNavSignal.dispatch('watchlist');
		} else if(path == '/inner/home/watched') {
			markNavSignal.dispatch('watched');
		} else if(path == '/inner/home/updates') {
			markNavSignal.dispatch('updates');
		} else if(path == '/inner/feed') {
			markNavSignal.dispatch('feed');
		} else if(path == '/inner/profile') {
			if(params == fa.auth.getUser().pk) {
				markNavSignal.dispatch('me');
			} else {
				clearNavSignal.dispatch();
			}
		} else if(path == '/inner/settings') {
			markNavSignal.dispatch('me');
		} else {
			clearNavSignal.dispatch();
		}
	});
	
	// if a view object (the return value of a view constructor) defines a
	// remove method, call it right before removing the view
	hier.on('pre-remove', function(path, view) {
		if(view && view.hasOwnProperty('remove')) {
			view.remove();
		}
	});
	
	// dispatches the clearNavSignal so that there are no navigation links
	// wrongly marked as active
	hier.on('post-remove', function() {
		clearNavSignal.dispatch();
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
		homeList: createHomeList,
		updates: createUpdates,
		feed: createFeed,
		results: createResults,
		film: createFilm,
		comments: createComments,
		tag: createTag,
		profile: createProfile,
		settings: createSettings,
		
		error: createError,
		message: createMessage
	};
	
}());
