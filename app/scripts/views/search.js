fa.views.search = (function() {

	"use strict";


	//
	// views
	//

	// inits a search results view
	// 
	// comprises the list of results of any film or user search
	// 
	// as param expects an object with a property q that contains the
	// yet-to-be-processed search query
	var createResults = function(elem, params) {
		if(!params.hasOwnProperty('q') || !params.q) {
			fa.routing.go('error');
			return;
		}

		var ready = false;
		var state = fa.history.getState('results');

		// shows the more results button
		var showMoreResults = function() {
			var button = fa.dom.get('.more-results', elem);
			fa.dom.on(button, 'click', function() {
				hier.update('/inner/results', params);
			});
			button.classList.remove('no-display');
		};

		fa.search.search(params.q).then(function(res) {
			ready = true;

			fa.views.render(elem, 'results-templ', {
				type: {
					films: (res.type == 'films'),
					users: (res.type == 'users')
				},
				items: res.items
			});
			fa.title.set('search results');

			if(state) {
				window.scroll(0, state.scroll);
			} else {
				window.scroll(0, 0);
			}

			if(res.type == 'films') {
				fa.films.gotMoreResults.addOnce(function(mesQuery) {
					if(mesQuery == params.q) {
						showMoreResults();
					}
				});
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
				fa.films.gotMoreResults.removeAll();
				if(ready) {
					fa.history.setState('results', {
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

	return createResults;

}());
