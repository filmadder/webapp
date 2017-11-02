fa.views.feed = (function() {

	"use strict";


	//
	// views
	//

	// inits a feed view
	// 
	// comprises a listing of feed items, the latter being dynamically loaded
	// each time the user scrolls to the bottom of the page (unless the end of
	// the feed is reached)
	var createFeed = function(elem) {
		var state = fa.history.getState('feed');
		var numPages = (state) ? state.numPages : 1;

		return fa.feed.get(numPages).then(function(feed) {
			var isEmpty = (feed.firstItems.length == 0);

			var appendItems = function(items) {
				var div = document.createElement('div');
				fa.views.render(div, 'feed-item', {items: items});
				elem.firstElementChild.appendChild(div);

				fa.views.scrolledToBottom.addOnce(function() {
					feed.loadMore().then(function(newItems) {
						numPages = feed.getNumPages();
						if(newItems.length > 0) {
							appendItems(newItems);
						}
					}).catch(fa.views.handleError);
				});
			};

			fa.views.render(elem, 'feed-base', {isEmpty: isEmpty});

			if(!isEmpty) {
				appendItems(feed.firstItems);
			}

			window.scroll(0, state ? state.scroll : 0);

			// the view object
			return {
				nav: 'feed',
				title: 'feed',
				remove: function() {
					if(!window.pageYOffset) {
						numPages = 1;  // avoid loading too many feed items
					}
					fa.history.setState('feed', {
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

	return createFeed;

}());
