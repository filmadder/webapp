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
			fa.comm.send('login', {
				email: email.value,
				password: pass.value
			})
			.then(function() {
				hier.remove('/login');
				hier.add('/inner', 'main', createInner);
			})
			.catch(function(error) {
				console.error(error);
			});
		});
	};
	
	// inits an inner view
	var createInner = function(elem) {
		var searchForm, queryField;
		
		render(elem, 'inner-templ', {});
		
		searchForm = elem.querySelector('#search-form');
		queryField = searchForm.querySelector('[name=query]');
		
		searchForm.addEventListener('submit', function(e) {
			e.preventDefault();
			fa.comm.send('search films', {query: queryField.value})
			.then(function(results) {
				hier.add('/inner/search');  // add results as param
			})
			.catch(function(error) {
				console.error(error);
			});
		});
	};
	
	var createSearch = function(elem) {
		render(elem, 'search-templ', {films: [{id: 1, title: 'first'}, {id: 2, title: 'second'}]});
	};
	
	// inits a film view
	var createFilm = function(elem) {
		render(elem, 'film-templ', {title: 'Blackadder', year: 1983});
	};
	
	// inits a home view
	var createHome = function(elem) {
		render(elem, 'home-templ', {});
	};
	
	// inits an error view
	var createError = function(elem) {
		render(elem, 'error-templ', {});
	};
	
	
	// 
	// exports
	// 
	
	return {
		init: function() {},
		destroy: function() {},
		
		outer: createOuter,
		reg: createReg,
		login: createLogin,
		
		inner: createInner,
		search: createSearch,
		film: createFilm,
		home: createHome,
		
		error: createError
	};
	
}());
