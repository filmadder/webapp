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
		render(elem, 'create-account-templ', {});
	};
	
	// inits a login view
	var createLogin = function(elem) {
		var form, email, pass;
		
		render(elem, 'login-templ', {});
		
		form = elem.querySelector('form');
		email = form.querySelector('[name=email]');
		pass = form.querySelector('[name=pass]');
		
		form.addEventListener('submit', function(e) {
			e.preventDefault();
			fa.auth.login(email.value, pass.value).then(function() {
				fa.routing.go('');
			}).catch(function(error) {
				console.error(error);
			});
		});
	};
	
	// inits an inner view
	var createInner = function(elem) {
		render(elem, 'inner-templ', {});
		
		var searchForm = elem.querySelector('#search-form');
		var queryField = searchForm.querySelector('[name=query]');
		
		searchForm.addEventListener('submit', function(e) {
			e.preventDefault();
			fa.films.search(queryField.value).then(function(results) {
				hier.add('/inner/search');  // add results as param
			}).catch(function(error) {
				console.error(error);
			});
		});
	};
	
	// inits a search view
	var createSearch = function(elem) {
		render(elem, 'search-templ', {films: [{id: 1, title: 'first'}, {id: 2, title: 'second'}]});
	};
	
	// inits a film view
	var createFilm = function(elem, id) {
		var film = {};
		
		fa.films.get(id).then(function(filmData) {
			film = filmData;
			render(elem, 'film-templ', film);
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
