/**
 * Data.
 */
fa.db = (function() {
	
	"use strict";
	
	
	/**
	 * Inits the second-tier sub-modules.
	 */
	var init = function() {
		fa.db.films.init();
	};
	
	/**
	 * De-activates the module and its sub-modules.
	 */
	var destroy = function() {
		fa.db.films.destroy();
	};
	
	
	/**
	 * Module exports.
	 */
	return {
		films: {},
		reviews: {},
		users: {},
		
		init: init,
		destroy: destroy
	};
	
}());
