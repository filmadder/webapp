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
		var ready = false;
		var state = fa.history.getState('tag:'+params.tag);

		fa.tags.get(params.tag).then(function(tagObj) {
			ready = true;

			fa.views.render(elem, 'tag-templ', {tag: tagObj});
			fa.title.set(['tag', tagObj.tag]);

			if(state) {
				for (var i = 0; i < state.opened.length; i++) {
					fa.dom.get('#' + state.opened[i]).checked = true;
				}
				window.scroll(0, state.scroll);
			} else {
				window.scroll(0, 0);
			}
		}).catch(fa.views.handleError);

		window.setTimeout(function() {
			if(!ready) {
				fa.views.render(elem, 'loading-templ', {});
				fa.title.set('loading');
			}
		}, 500);

		return {
			nav: '_',
			remove: function() {
				if(ready) {
					var opened = fjs.map(function(currentElem) {
						return currentElem.id;
					}, fa.dom.filter('.accordion:checked'));

					fa.history.setState('tag:'+params.tag, {
						opened: opened,
						scroll: window.pageYOffset
					});
				}
				elem.innerHTML = '';
			}
		};
	};


	//
	// exports
	//

	return createTag;

}());
