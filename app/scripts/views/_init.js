fa.views = (function() {

	"use strict";


	// 
	// signals
	// 

	// dispatches when the user scrolls to the bottom of the page
	// used by the feed and updates views
	var scrolledToBottom = new signals.Signal();

	var scrolledFarDown = new signals.Signal();
	var scrolledBackUp = new signals.Signal();

	// window.pageYOffset is better than document.body.scrollTop
	// http://stackoverflow.com/questions/28633221
	window.addEventListener('scroll', function() {
		if(window.innerHeight + window.pageYOffset >= document.body.scrollHeight) {
			scrolledToBottom.dispatch();
		}

		if(window.pageYOffset > 400) {
			scrolledFarDown.dispatch();
			scrolledFarDown.active = false;
			scrolledBackUp.active = true;
		} else {
			scrolledBackUp.dispatch();
			scrolledBackUp.active = false;
			scrolledFarDown.active = true;
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
	//
	// if the window is wider than 740px and there exists a wide- version of
	// the requested template, it is used instead
	var render = function(elem, templateID, context) {
		var templateElem;

		if(window.innerWidth > 740) {
			templateElem = document.getElementById(templateID +'-wide-templ');
			if(!templateElem) {
				templateElem = document.getElementById(templateID +'-templ');
			}
		} else {
			templateElem = document.getElementById(templateID +'-templ');
		}

		if(!templateElem) {
			throw new Error('Could not find template: '+ templateID);
		}

		elem.innerHTML = Mustache.render(templateElem.innerHTML, context);
	};

	// expects {code, message} object and acts accordingly
	// 
	// for forbidden and not_found redirects the view
	// for bad_input, pending and bug shows error message
	var handleError = function(error) {
		log.warn(error);

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
	// views
	//

	// inits an inner view
	// 
	// includes the navigation, the search form, and the #view element that is
	// the container of all inner views
	var createInner = function(elem) {
		var navLinks, removeActiveLinks, addActiveLink;
		var movableElem, navElem, isNavOpen, view, searchIcon, searchBtn;
		var searchForm, queryField, doSearchButton, isSearchOpen;
		var showNav, hideNav, showSearch, hideSearch;
		var marker;
		var heading;

		render(elem, 'inner', {user: fa.auth.getUser()});

		// change heading
		heading = fa.dom.get('h1');

		scrolledFarDown.add(function() {
			heading.textContent = fa.title.getLastBit();
		});
		scrolledBackUp.add(function() {
			heading.textContent = 'film adder';
		});

		// nav: active links
		navLinks = fa.dom.filter('header nav a', elem);
		removeActiveLinks = function() {
			fjs.map(function(link) {
				link.classList.remove('selected');
			}, navLinks);
		};
		addActiveLink = function(navId) {
			fjs.map(function(link) {
				if(link.dataset.nav == navId) {
					setTimeout(function() {
						link.classList.add('selected');
					}, 300);
				}
			}, navLinks);
		};
		clearNavSignal.add(removeActiveLinks);
		markNavSignal.add(addActiveLink);

		// nav: open and close
		movableElem = fa.dom.get('.header-inner', elem);
		navElem = fa.dom.get('.nav', elem);
		isNavOpen = false;

		showNav = function() {
			navElem.classList.remove('hidden');
			movableElem.classList.add('move-left');
			view.classList.add('uninteractive');
			isNavOpen = true;
		};
		hideNav = function() {
			navElem.classList.add('hidden');
			movableElem.classList.remove('move-left');
			view.classList.remove('uninteractive');
			isNavOpen = false;
		}

		// the nav shows when the snake is clicked (1) and hides when isNavOpen
		// is true and either the snake (2), the view (3) or a nav link(4) is
		// clicked
		fa.dom.on(fa.dom.get('.nav-opener', elem), 'click', function() {
			if(!isNavOpen) showNav();  // (1)
			else hideNav();  // (2)
		});
		fa.dom.on(fa.dom.get('#view', elem), 'click', function() {
			if(isNavOpen) hideNav();  // (3)
		});
		fa.dom.on(navLinks, 'click', hideNav);  // (4)

		// search form
		searchForm = fa.dom.get('#search-form', elem);
		queryField = fa.dom.get('[name=q]', searchForm);
		doSearchButton = fa.dom.get('button[type=submit]', searchForm);
		view = fa.dom.get('#view', elem);
		searchIcon = fa.dom.get('.search');
		searchBtn = fa.dom.get('.search-btn');
		isSearchOpen = false;

		showSearch = function() {
			searchForm.classList.remove('hidden');
			doSearchButton.classList.remove('hidden');
			movableElem.classList.add('move-right');
			searchIcon.classList.remove('search');
			searchIcon.classList.remove('icon');
			searchIcon.classList.add('reset');
			view.classList.add('foggy');
			view.classList.add('uninteractive');
			isSearchOpen = true;
		};
		hideSearch = function() {
			searchForm.classList.add('hidden');
			movableElem.classList.remove('move-right');
			doSearchButton.classList.add('hidden');
			searchIcon.classList.remove('reset');
			searchIcon.classList.add('search');
			searchIcon.classList.add('icon');
			view.classList.remove('foggy');
			view.classList.remove('uninteractive');
			isSearchOpen = false;
		};

		// the search form shows when search btn is clicked (1) and hides when
		// isSearchOpen is true and the search btn is clicked (2) and the form
		// is submitted (3)
		fa.dom.on(searchBtn, 'click', function() {
			if(!isSearchOpen) {  // (1)
				showSearch();
				queryField.focus();
			} else {  // (2)
				hideSearch();
			}
		});
		fa.dom.on(fa.dom.get('body'), 'keypress', function(e) {
			if (e.which === 0) {
				hideSearch();
			}
		});
		// no reset btn for now
		fa.dom.on(searchForm, 'submit', function(e) {
			e.preventDefault();
			if(queryField.value) {
				fa.routing.go('search/?q='+encodeURIComponent(queryField.value));
				queryField.blur();
				queryField.value = '';
				hideSearch();  // (3)
			}
		});

		// unread updates marker
		marker = fa.dom.get('.notification-marker', elem);

		fa.models.updates.changedStatus.add(function(status) {
			if(status == 'has-unread') {
				marker.classList.remove('hidden');
			} else {
				marker.classList.add('hidden');
			}
		});

		// logout
		fa.dom.on('[data-fn=logout]', 'click', function() {
			fa.auth.logout();
			fa.routing.go('login');
		});

		// the view object
		return Promise.resolve({
			remove: function() {
				fa.models.updates.changedStatus.removeAll();

				clearNavSignal.remove(removeActiveLinks);
				markNavSignal.remove(addActiveLink);

				scrolledFarDown.removeAll();
				scrolledBackUp.removeAll();
			}
		});
	};

	// inits an error view
	// for the time being, this is the 404 view only
	var createError = function(elem) {
		render(elem, 'meta-error-404', {});
		window.scroll(0, 0);

		return Promise.resolve({
			nav: '_'
		});
	};

	// inits a message view
	// 
	// expects {type: error, code} for error messages
	// expects {type: success, text} for success messages
	var createMessage = function(elem, params) {
		if(params.type == 'error') {
			render(elem, 'meta-error-message', {
				code: {
					badInput: (params.code == 'bad_input'),
					bug: (params.code == 'bug'),
					forbidden: (params.code == 'forbidden'),
					notFound: (params.code == 'not_found'),
					pending: (params.code == 'pending')
				}
			});
			log.trace();
		}
		else if(params.type == 'success') {
			render(elem, 'meta-success-message', {
				text: params.text
			});
			window.setTimeout(removeMessage, 1500);
		}

		return Promise.resolve({});
	};


	// 
	// hier hooks
	// 

	// {path: hook} dicts to store the empty and remove hooks
	// used to invoke the hooks outside of a view.then call
	var emptyHooks = {};
	var removeHooks = {};

	// handles the nav and title view props and stores the empty and remove
	// hooks in the respective dicts
	//
	// shows the snake if loading takes too long
	hier.on('post-init', function(path, elem, view) {
		var ready = false;

		view.then(function(view) {
			ready = true;

			if(view.hasOwnProperty('nav')) {
				if(view.nav == '_') {
					clearNavSignal.dispatch();
				} else {
					markNavSignal.dispatch(view.nav);
				}
			}

			if(view.hasOwnProperty('title')) {
				fa.title.set(view.title);
			}

			if(view.hasOwnProperty('empty')) {
				emptyHooks[path] = view.empty;
			}

			if(view.hasOwnProperty('remove')) {
				removeHooks[path] = view.remove;
			}
		}).catch(handleError);

		window.setTimeout(function() {
			if(!ready) {
				render(elem, 'meta-loading', {});
				fa.title.set('loading');
			}
		}, 500);
	});

	// if a view object defines a empty method, call it right before removing
	// the node's children
	hier.on('pre-empty', function(path) {
		if(emptyHooks.hasOwnProperty(path)) {
			emptyHooks[path]();
			delete emptyHooks[path];
		}
	});

	// if a view object defines a remove method, call it right before removing
	// the view; also clears the contents of the elem
	hier.on('pre-remove', function(path, elem) {
		if(removeHooks.hasOwnProperty(path)) {
			removeHooks[path]();
			delete removeHooks[path];
		}
		elem.innerHTML = '';
	});

	// dispatches the clearNavSignal so that there are no navigation links
	// wrongly marked as active
	hier.on('post-remove', function(path) {
		clearNavSignal.dispatch();
	});


	// 
	// exports
	// 

	return {
		scrolledToBottom: scrolledToBottom,
		clearNavSignal: clearNavSignal,
		markNavSignal: markNavSignal,

		render: render,
		handleError: handleError,
		addMessage: addMessage,
		removeMessage: removeMessage,

		inner: createInner,
		error: createError,
		message: createMessage
	};

}());
