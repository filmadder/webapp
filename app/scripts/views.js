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
	var handleError = function(error) {
		if(error.code == 403) {
			fa.routing.go('login');
		}
		console.error(error);
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
			}).catch(handleError);
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
		}).catch(handleError);
	};
	
	// inits a home view
	var createHome = function(elem) {
		render(elem, 'home-templ', {});
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
		profile: createProfile,
		
		error: createError
	};
	
}());
