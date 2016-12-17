fa.views = (function() {
	
	"use strict";
	
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
	// only useful for get promises as it cannot handle 400
	var handleGetError = function(error) {
		if(error.code == 403) {
			fa.routing.go('login');
		}
		if(error.code == 404) {
			fa.routing.go('error');
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
				form.showError(error.message);
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
				form.showError(error.message);
			});
		})
		.add('email', [fa.forms.maxLen(200), fa.forms.email])
		.add('pass', [fa.forms.maxLen(200), fa.forms.minLen(5)]);
	};
	
	// inits an inner view
	var createInner = function(elem) {
		render(elem, 'inner-templ', {});
		
		var searchForm = elem.querySelector('#search-form');
		var queryField = searchForm.querySelector('[name=query]');
		
		searchForm.addEventListener('submit', function(e) {
			e.preventDefault();
			fa.routing.go('search');
			fa.films.search(queryField.value).then(function(results) {
				hier.update('/inner/search', results);
			}).catch(handleGetError);
		});
	};
	
	// inits a search view
	var createSearch = function(elem, results) {
		if(results) {
			render(elem, 'search-templ', results);
		}
	};
	
	// inits a film view
	var createFilm = function(elem, id) {
		fa.films.get(id).then(function(data) {
			render(elem, 'film-templ', data);
			
			var replyButtons = elem.querySelectorAll('button[data-fn=reply]');
			var commentButton = elem.querySelector('button[data-fn=comment]');
			
			commentButton.addEventListener('click', function(e) {
				var div = document.createElement('div');
				commentButton.parentNode.insertBefore(div, commentButton);
				render(div, 'comment-form-templ');
				commentButton.remove();
			});
		}).catch(handleGetError);
	};
	
	// inits a home view
	var createHome = function(elem) {
		render(elem, 'home-templ', {});
	};

	// inits a feed view
	var createFeed = function(elem) {
		render(elem, 'feed-templ', {});
	};

	// inits a feed view
	var createUpdates = function(elem) {
		render(elem, 'updates-templ', {});
	};
	
	// inits a profile view
	var createProfile = function(elem) {
		render(elem, 'profile-templ', {});
	};
	
	// inits an error view
	var createError = function(elem) {
		render(elem, 'error-templ', {});
	};
	
	
	// 
	// exports
	// 
	
	return {
		outer: createOuter,
		reg: createReg,
		login: createLogin,
		
		inner: createInner,
		search: createSearch,
		film: createFilm,
		home: createHome,
		feed: createFeed,
		updates: createUpdates,
		profile: createProfile,
		
		error: createError
	};
	
}());
