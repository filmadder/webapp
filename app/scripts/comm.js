/**
 * The comm module handles the communication between the other modules.
 */
fa.comm = (function() {
	
	"use strict";
	
	/**
	 * I. class definitions
	 */
	/**
	 * Signals are like sentences, with subject, object, and verb.
	 */
	var Signal = function(verb, object) {
		var self = this;
		
		self.verb = verb;
		self.object = object;
		self.subject = null;
	};
	
	/**
	 * Returns registered handler of the signal, if such.
	 * 
	 * @return The signal handler or false.
	 */
	Signal.prototype.route = function() {
		var self = this;
		
		if(activeRegistry == null) {
			return false;
		}
		
		return activeRegistry.findSignal(self.verb, self.object);
	};
	
	/**
	 * Starts off the signal.
	 * 
	 * Looks for registered handlers, calls these, and returns a Promise.
	 * 
	 * @param The dispatch load.
	 * @return Promise instance.
	 */
	Signal.prototype.dispatch = function(load) {
		var self = this;
		
		var handler = self.route();
		if(handler == false) {
			var name = self.verb +' '+ self.object;
			fa.logging.error('Signal '+ name +' not found.');
			return Promise.reject('Internal error: could not '+ name +'.');
		}
		
		var map = new Map();
		if(load) {
			if(load instanceof Map) map = load;
			else map = fa.utils.objectToMap(load);
		}
		
		return Promise.resolve(handler(map));
	};
	
	
	/**
	 * The Registry singleton keeps track of the active signal handlers.
	 * 
	 * It is a wrapper around a dict with verbs as keys and dicts as values,
	 * with the latter having objects as keys and handlers as values.
	 */
	var Registry = function() {
		var self = this;
		self.dict = {};
	};
	
	/**
	 * Registers a new signal handler.
	 * 
	 * If there is already handler identified with the given verb and object,
	 * it will be overwritten.
	 * 
	 * @param The verb associated with the signal.
	 * @param The object associated with the signal.
	 * @param The signal handler.
	 */
	Registry.prototype.addSignal = function(verb, object, handler) {
		var self = this;
		
		if(!(verb in self.dict)) {
			self.dict[verb] = {};
		}
		
		self.dict[verb][object] = handler;
	};
	
	/**
	 * Returns the signal handler associated with the given verb and object.
	 * If there is not such handler, returns false.
	 * 
	 * @param The verb associated with the signal.
	 * @param The object associated with the signal.
	 * @return The signal handler or false.
	 */
	Registry.prototype.findSignal = function(verb, object) {
		var self = this;
		
		if(!(verb in self.dict)) {
			return false;
		}
		
		if(!(object in self.dict[verb])) {
			return false;
		}
		
		return self.dict[verb][object];
	};
	
	/**
	 * Returns list of all registered signals.
	 * 
	 * @return The list.
	 */
	Registry.prototype.listSignals = function() {
		var self = this;
	};
	
	
	/**
	 * II. module variables and functions
	 */
	var activeRegistry = null;
	
	/**
	 * Inits the module.
	 */
	var init = function() {
		if(activeRegistry != null) {
			return;
		}
		activeRegistry = new Registry();
	};
	
	/**
	 * Deactivates the module. 
	 */
	var destroy = function() {
		activeRegistry = null;
	};
	
	/**
	 * Registers a new signal handler.
	 * 
	 * @see Registry.addSignal().
	 */
	var register = function(verb, object, handler) {
		if(activeRegistry == null) {
			return;
		}
		activeRegistry.addSignal(verb, object, handler);
	};
	
	/**
	 * Shortcut for creating and dispatching a one-off Signal.
	 * 
	 * @param The verb of the signal to be dispatched.
	 * @param The object of the signal to be dispatched.
	 * @param The signal load.
	 * 
	 * @return Promise.
	 */
	var send = function(verb, object, load) {
		return new Signal(verb, object).dispatch(load);
	};
	
	
	/**
	 * III. module exports
	 */
	return {
		init: init,
		destroy: destroy,
		register: register,
		send: send,
		Signal: Signal
	};
	
}());
