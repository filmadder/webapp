fa.views.updates = (function() {

	"use strict";


	//
	// views
	//

	// inits an update view
	// 
	// comprises a listing of updates, the latter being dynamically loaded each
	// time the user scrolls to the bottom of the page (unless the end of the
	// updates feed is reached)
	var createUpdates = function(elem) {
		var ready = false;
		var state = fa.history.getState('updates');
		var numPages = (state) ? state.numPages : 1;

		fa.updates.get(numPages).then(function(updates) {
			ready = true;

			var isEmpty = (updates.firstItems.length == 0);

			fa.views.render(elem, 'updates-templ', {isEmpty: isEmpty});
			fa.title.set('notifications');

			var appendItems = function(items) {
				var div = document.createElement('div');
				fa.views.render(div, 'update-items-templ', {items: items});
				elem.firstChild.appendChild(div);

				fa.views.scrolledToBottom.addOnce(function() {
					updates.loadMore().then(function(newItems) {
						numPages = updates.getNumPages();
						if(newItems.length > 0) {
							appendItems(newItems);
						}
					}).catch(fa.views.handleError);
				});
			};

			if(!isEmpty) {
				appendItems(updates.firstItems);
			}

			if(state) {
				window.scroll(0, state.scroll);
			} else {
				window.scroll(0, 0);
			}
		}).catch(fa.views.handleError);

		// show the snake if loading takes too long
		window.setTimeout(function() {
			if(!ready) {
				fa.views.render(elem, 'loading-templ', {});
				fa.title.set('loading');
			}
		}, 500);

		// the view object
		return {
			nav: 'updates',
			remove: function() {
				if(ready) {
					if(!window.pageYOffset) {
						numPages = 1;  // avoid loading too many feed items
					}
					fa.history.setState('updates', {
						numPages: numPages,
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

	return createUpdates;

}());
