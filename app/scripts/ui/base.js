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
		 * jQuery Validation setup.
		 */
		$.validator.setDefaults({
			errorElement: 'span'
		});
		
		/**
		 * Knockout setup.
		 * http://www.knockmeout.net/2012/05/quick-tip-skip-binding.html
		 */
		ko.bindingHandlers.stopBinding = {
			init: function() {
				return {
					controlsDescendantBindings: true
				}
			}
		};
		ko.virtualElements.allowedBindings.stopBinding = true;
		
		/**
		 * Init the fa.ui.* modules.
		 * The order matters: fa.ui.routing uses fa.ui.keys.
		 */
		fa.ui.messages.init($('#messages'));
		fa.ui.routing.init($('#main'));
	};
	
	
	/**
	 * Deactivates the fa.ui.* modules.
	 */
	var destroy = function() {
		fa.ui.routing.destroy();
		fa.ui.messages.destroy();
	};
	
	
	/**
	 * Module exports.
	 * 
	 * fa.ui.components.* and fa.ui.forms.* need the explicit {} declaration,
	 * while fa.ui.messages and fa.ui.routing are listed here for completeness.
	 */
	return {
		components: {},
		forms: {},
		messages: {},
		routing: {},
		
		init: init,
		destroy: destroy
	};
	
}());
