fa.views.settings = (function() {

	"use strict";


	//
	// views
	//

	// inits a settings view
	// 
	// this view contains the change password form and the logout button
	var createSettings = function(elem) {
		fa.views.render(elem, 'settings', {});

		window.scroll(0, 0);

		// change password
		fa.forms.create(fa.dom.get('#password-form'), function(form) {
			var load = form.getData();
			load = {oldPass: load.pass0, newPass: load.pass1};

			fa.auth.changePass(load).then(function() {
				hier.update('/inner/settings');
				hier.add('/mes', {type: 'success', text: 'password changed'});
			}).catch(function(error) {
				if(error.code == 'bad_input') {
					if(hier.has('/mes')) hier.remove('/mes');
					form.showError(error.message);
				}
				else hier.add('/mes', {type: 'error', code: error.code});
				form.enable();
			});
		})
		.add('pass0', [fa.forms.maxLen(200), fa.forms.minLen(5)])
		.add('pass1', [fa.forms.maxLen(200), fa.forms.minLen(5)])
		.add('pass2', [fa.forms.equal('pass1')]);

		return Promise.resolve({
			nav: 'main:settings',
			title: 'settings'
		});
	};


	//
	// exports
	//

	return createSettings;

}());
