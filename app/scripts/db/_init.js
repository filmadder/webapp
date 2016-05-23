/**
 * Data.
 */
fa.db = (function() {
	
	"use strict";
	
	
	/**
	 * Inits the second-tier sub-modules.
	 */
	var init = function() {
		fa.db.conn.init();
		fa.db.auth.init();
		fa.db.films.init();
	};
	
	/**
	 * De-activates the sub-modules.
	 */
	var destroy = function() {
		fa.db.films.destroy();
		fa.db.auth.destroy();
		fa.db.conn.destroy();
	};
	
	
	/**
	 * Exports
	 */
	return {
		conn: {},
		auth: {},
		
		films: {},
		
		init: init,
		destroy: destroy
	};
	
}());
