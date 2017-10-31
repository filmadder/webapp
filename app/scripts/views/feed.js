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
		var ready = false;
		var state = fa.history.getState('feed');
		var numPages = (state) ? state.numPages : 1;

		fa.feed.get(numPages).then(function(feed) {
			var isEmpty = (feed.firstItems.length == 0);
			var appendItems = function(items) {
				var div = document.createElement('div');
				fa.views.render(div, 'feed-items-templ', {items: items});
				elem.firstChild.appendChild(div);

				fa.views.scrolledToBottom.addOnce(function() {
					feed.loadMore().then(function(newItems) {
						numPages = feed.getNumPages();
						if(newItems.length > 0) {
							appendItems(newItems);
						}
					}).catch(fa.views.handleError);
				});
			};

			ready = true;

			fa.views.render(elem, 'feed-templ', {isEmpty: isEmpty});
			fa.title.set('feed');

			if(!isEmpty) {
				appendItems(feed.firstItems);
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
			nav: 'feed',
			remove: function() {
				if(ready) {
					if(!window.pageYOffset) {
						numPages = 1;  // avoid loading too many feed items
					}
					fa.history.setState('feed', {
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

	return createFeed;

}());
