fa.views.tag = (function() {

	"use strict";


	//
	// views
	//

	// inits a tag view
	// 
	// this view contains the users that have been used a particular tag and
	// the films that have been tagged with it
	// 
	// the params argument is expected to be a {tag} object
	var createTag = function(elem, params) {
		return fa.tags.get(params.tag).then(function(tagObj) {
			var state = fa.history.getState('tag:'+params.tag);
			var i;

			fa.views.render(elem, 'tag-templ', {tag: tagObj});

			if(state) {
				for (i = 0; i < state.opened.length; i++) {
					fa.dom.get('#' + state.opened[i]).checked = true;
				}
				window.scroll(0, state.scroll);
			} else {
				window.scroll(0, 0);
			}

			return {
				nav: '_',
				title: ['tag', tagObj.tag],
				remove: function() {
					var opened = fjs.map(function(currentElem) {
						return currentElem.id;
					}, fa.dom.filter('.accordion:checked'));

					fa.history.setState('tag:'+params.tag, {
						opened: opened,
						scroll: window.pageYOffset
					});
				}
			};
		});
	};


	//
	// exports
	//

	return createTag;

}());
