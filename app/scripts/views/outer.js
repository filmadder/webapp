fa.views.outer = (function() {

	"use strict";


	//
	// views
	//

	// inits an outer view
	// 
	// this view is a simple container for the login and reg views and
	// comprises a header containing the name and logo
	var createOuter = function(elem) {
		fa.views.render(elem, 'outer-templ', {});
		return Promise.resolve({});
	};

	// inits a create account view
	// 
	// comprises the registration form
	var createReg = function(elem) {
		fa.views.render(elem, 'reg-templ', {});

		fa.forms.create(fa.dom.get('form', elem), function(form) {
			fa.auth.register(form.getData()).then(function() {
				fa.routing.go('');
				fa.views.addMessage({type: 'success', text: 'you are now an adder!'});
			}).catch(function(error) {
				if(error.code == 'bad_input') {
					fa.views.removeMessage();
					form.showError(error.message);
				}
				else fa.views.addMessage({type: 'error', code: error.code});
				form.enable();
			});
		})
		.add('email', [fa.forms.maxLen(200), fa.forms.email])
		.add('name', [fa.forms.maxLen(200), fa.forms.minLen(5)])
		.add('pass1', [fa.forms.maxLen(200), fa.forms.minLen(5)])
		.add('pass2', fa.forms.equal('pass1'));

		return Promise.resolve({
			title: 'create account'
		});
	};

	// inits a login view
	// 
	// comprises the login form
	var createLogin = function(elem) {
		fa.views.render(elem, 'login-templ', {});

		fa.forms.create(fa.dom.get('form', elem), function(form) {
			fa.auth.login(form.getData()).then(function() {
				fa.routing.go('');
			}).catch(function(error) {
				if(error.code == 'bad_input') {
					fa.views.removeMessage();
					form.showError(error.message);
				}
				else fa.views.addMessage({type: 'error', code: error.code});
				form.enable();
			});
		})
		.add('email', [fa.forms.maxLen(200), fa.forms.email])
		.add('pass', [fa.forms.maxLen(200), fa.forms.minLen(5)]);

		return Promise.resolve({
			title: 'login'
		});
	};


	//
	// exports
	//

	createOuter.reg = createReg;
	createOuter.login = createLogin;

	return createOuter;

}());
