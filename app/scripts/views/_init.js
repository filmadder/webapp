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
			hier.add('/mes', {type: 'error', code: error.code});
		}
	};

	// changes the document title to the given array/string
	var setTitle = function(arg) {
		var trail = [];

		if(fjs.isArray(arg)) {
			trail = arg.slice();
		} else if(arg) {
			trail = [arg.toString()];
		}

		if(trail.length > 0) {
			document.title = 'filmadder | '+ trail.join(' | ');
		} else {
			document.title = 'filmadder';
		}
	};


	//
	// views
	//

	// inits an error view
	// for the time being, this is the 404 view only
	var createError = function(elem) {
		render(elem, 'meta-error-404', {});
		window.scroll(0, 0);

		return Promise.resolve({});
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

			window.setTimeout(function() {
				if(hier.has('/mes')) hier.remove('/mes');
			}, 1500);
		}

		// the view object
		return Promise.resolve({});
	};

	// init a logout view
	var createLogout = function() {
		var promise = Promise.resolve({});

		promise.then(function() {
			fa.auth.logout();
			fa.routing.go('login');
		});

		return promise;
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
				if(view.nav.substr(-2) == ':_') {
					fa.nav.unmark(view.nav.substr(0, view.nav.length-2));
				} else {
					fa.nav.mark(view.nav);
				}
			}

			if(view.hasOwnProperty('title')) {
				setTitle(view.title);
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
				setTitle('loading');
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


	// 
	// exports
	// 

	return {
		scrolledToBottom: scrolledToBottom,
		scrolledFarDown: scrolledFarDown,
		scrolledBackUp: scrolledBackUp,

		render: render,
		handleError: handleError,

		error: createError,
		message: createMessage,
		logout: createLogout
	};

}());
