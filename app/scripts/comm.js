/**
 * The comm module handles the communication between the other modules.
 */
fa.comm = (function() {
	
	"use strict";
	
	
	/**
	 * Variables
	 */
	/**
	 * Map(predicate: Map(priority: function))
	 */
	var signals = null;
	
	
	/**
	 * Functions
	 */
	/**
	 * Sends off a signal.
	 * 
	 * If there is no registered receiver, it resolves into silence.
	 */
	var send = function(predicate, load) {
		fa.assert.notEqual(signals, null);
		if(!signals.has(predicate)) return Promise.resolve();
		
		var key, keys = [];
		for(key of signals.get(predicate).keys()) {
			keys.push(key);
		}
		keys.sort();
		
		var result = Promise.resolve();
		keys.forEach(function(key) {
			result = result.then(function() {
				var func = signals.get(predicate).get(key);
				return func(load);
			});
		});
		
		return result;
	};
	
	/**
	 * Registers a new signal handler.
	 * The last argument is optional, defaults to 5.
	 */
	var receive = function(predicate, handler, priority) {
		fa.assert.notEqual(signals, null);
		
		if(typeof priority != 'number') priority = 5;
		
		if(!signals.has(predicate)) signals.set(predicate, new Map());
		
		signals.get(predicate).set(priority, handler);
	};
	
	
	/**
	 * Inits the module.
	 */
	var init = function() {
		fa.assert.equal(signals, null);
		signals = new Map();
	};
	
	/**
	 * Deactivates the module.
	 */
	var destroy = function() {
		fa.assert.notEqual(signals, null);
		signals = null;
	};
	
	
	/**
	 * Exports
	 */
	return {
		init: init,
		destroy: destroy,
		send: send,
		receive: receive
	};
	
}());
