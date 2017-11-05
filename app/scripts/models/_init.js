fa.models = (function() {

	"use strict";


	// knows which sub-modules need to be inited and does so
	var init = function() {
		fa.models.films.init();
		fa.models.updates.init();
	};


	return {
		init: init
	};

}());
