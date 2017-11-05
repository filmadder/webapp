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
		var state = fa.history.getState('updates');
		var numPages = (state) ? state.numPages : 1;

		return fa.models.updates.get(numPages).then(function(updates) {
			var isEmpty = (updates.firstItems.length == 0);

			var appendItems = function(items) {
				var div = document.createElement('div');
				fa.views.render(div, 'updates-item', {items: items});
				elem.firstElementChild.appendChild(div);

				fa.views.scrolledToBottom.addOnce(function() {
					updates.loadMore().then(function(newItems) {
						numPages = updates.getNumPages();
						if(newItems.length > 0) {
							appendItems(newItems);
						}
					}).catch(fa.views.handleError);
				});
			};

			fa.views.render(elem, 'updates-base', {isEmpty: isEmpty});

			if(!isEmpty) {
				appendItems(updates.firstItems);
			}

			window.scroll(0, state ? state.scroll : 0);

			// the view object
			return {
				nav: 'updates',
				title: 'notifications',
				remove: function() {
					if(!window.pageYOffset) {
						numPages = 1;  // avoid loading too many feed items
					}
					fa.history.setState('updates', {
						numPages: numPages,
						scroll: window.pageYOffset
					});
				}
			};
		});
	};


	//
	// exports
	//

	return createUpdates;

}());
