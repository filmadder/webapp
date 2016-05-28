/**
 * The fa.ui.* modules handle all interaction between the user and fa's core.
 * They are the only modules that directly interact with the html.
 */
fa.ui = (function() {
	
	"use strict";
	
	
	/**
	 * Inits the fa.ui.* modules and setups their dependencies.
	 */
	var init = function() {
		
		/**
		 * Init the fa.ui.* modules.
		 * The order matters: fa.ui.routing uses fa.ui.keys.
		 */
		fa.ui.components.init();
		fa.ui.routing.init();
	};
	
	
	/**
	 * Deactivates the fa.ui.* modules.
	 */
	var destroy = function() {
		fa.ui.routing.destroy();
		fa.ui.components.destroy();
	};
	
	
	/**
	 * Exports
	 */
	return {
		components: {},
		routing: {},
		
		init: init,
		destroy: destroy
	};
	
}());
