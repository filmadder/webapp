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
			return Promise.reject({code: 'not_found', message: ''});
		}

		// shows the more results button
		var showMoreResults = function() {
			var button = fa.dom.get('.more-results', elem);
			fa.dom.on(button, 'click', function() {
				hier.update('/inner/results', params);
			});
			button.classList.remove('no-display');
		};

		return fa.search.search(params.q).then(function(res) {
			var state = fa.history.getState('results');

			fa.views.render(elem, 'results', {
				type: {
					films: (res.type == 'films'),
					users: (res.type == 'users')
				},
				items: res.items
			});

			window.scroll(0, state ? state.scroll : 0);

			if(res.type == 'films') {
				fa.films.gotMoreResults.addOnce(function(mesQuery) {
					if(mesQuery == params.q) {
						showMoreResults();
					}
				});
			}

			return {
				nav: '_',
				title: 'search results',
				remove: function() {
					fa.films.gotMoreResults.removeAll();
					fa.history.setState('results', {
						scroll: window.pageYOffset
					});
				}
			};
		});
	};


	//
	// exports
	//

	return createResults;

}());
