fa.views.settings = (function() {

	"use strict";


	//
	// views
	//

	// inits a settings view
	// 
	// this view contains the change password form and the logout button
	var createSettings = function(elem) {
		fa.views.render(elem, 'settings-templ', {});

		window.scroll(0, 0);

		// change password
		fa.forms.create(fa.dom.get('#password-form'), function(form) {
			var load = form.getData();
			load = {oldPass: load.pass0, newPass: load.pass1};

			fa.auth.changePass(load).then(function() {
				hier.update('/inner/settings');
				fa.views.addMessage({type: 'success', text: 'password changed'});
			}).catch(function(error) {
				if(error.code == 'bad_input') {
					app.views.removeMessage();
					form.showError(error.message);
				}
				else fa.views.addMessage({type: 'error', code: error.code});
				form.enable();
			});
		})
		.add('pass0', [fa.forms.maxLen(200), fa.forms.minLen(5)])
		.add('pass1', [fa.forms.maxLen(200), fa.forms.minLen(5)])
		.add('pass2', [fa.forms.equal('pass1')]);

		return Promise.resolve({
			nav: 'settings',
			title: 'settings'
		});
	};


	//
	// exports
	//

	return createSettings;

}());
