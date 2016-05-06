/**
 * Handles messages to user.
 */
fa.ui.messages = (function() {
	
	"use strict";
	
	/**
	 * I. class definitions
	 */
	/**
	 * Class definition for messages.
	 * 
	 * @param One of ('error', 'info', 'success').
	 * @param The message contents.
	 */
	var Message = function(type, text) {
		this.type = type;
		this.text = text;
		this.elem = null;
		this._handleClick = this.remove.bind(this);
	};
	
	/**
	 * Creates the message's dom element.
	 * Removes the currently active message, if such.
	 */
	Message.prototype.initDom = function() {
		clear();
		current = this;
		
		this.elem = $('<div>' + this.text + '</div>');
		this.elem.addClass('message ' + this.type);
		this.elem.appendTo(dom);
		
		document.addEventListener('click', this._handleClick);
	};
	
	/**
	 * Removes the message's dom element.
	 */
	Message.prototype.remove = function() {
		document.removeEventListener('click', this._handleClick);
		
		if(this.elem) {
			this.elem.remove();
			this.elem = null;
		}
	};
	
	
	/**
	 * Class definition for error messages.
	 * 
	 * @extends Message
	 * 
	 * @param The error text.
	 */
	var Error = function(text) {
		Message.call(this, 'error', text);
		this.initDom();
	};
	Error.prototype = Object.create(Message.prototype);
	Error.prototype.constructor = Error;
	
	
	/**
	 * Class definition for info messages.
	 * 
	 * @extends Message
	 * 
	 * @param The info text.
	 */
	var Info = function(text) {
		Message.call(this, 'info', text);
		this.initDom();
	};
	Info.prototype = Object.create(Message.prototype);
	Info.prototype.constructor = Info;
	
	
	/**
	 * Class definition for success messages.
	 * 
	 * @extends Message
	 * 
	 * @param The success text.
	 */
	var Success = function(text) {
		Message.call(this, 'success', text);
		this.initDom();
	};
	Success.prototype = Object.create(Message.prototype);
	Success.prototype.constructor = Success;
	
	
	/**
	 * II. module variables and functions
	 */
	/**
	 * The dom to contain them all.
	 */
	var dom = null;
	
	/**
	 * One active message at a time.
	 */
	var current = null;
	
	/**
	 * Inits the module.
	 * 
	 * @param The jQuery element to contain the messages. Optional.
	 */
	var init = function(element) {
		if(element) {
			dom = element;
		}
		else {
			dom = $('#messages');
		}
		
		fa.comm.register('show', 'error', showError);
		fa.comm.register('show', 'success', showSuccess);
	};
	
	/**
	 * Creates new Error instance.
	 * 
	 * @param Map(text).
	 * @return Promise that resolves into new Error instance.
	 */
	var showError = function(load) {
		fa.assert.isTrue(load.has('text'));
		return Promise.resolve(new Error(load.get('text')));
	};
	
	/**
	 * Creates new Success instance.
	 * 
	 * @param Map(text).
	 * @return Promise that resolves into new Success instance.
	 */
	var showSuccess = function(load) {
		fa.assert.isTrue(load.has('text'));
		return Promise.resolve(new Success(load.get('text')));
	};
	
	/**
	 * Removes the currently active message, if such.
	 */
	var clear = function() {
		if(current) {
			current.remove();
			current = null;
		}
	};
	
	/**
	 * Deactivates the module.
	 */
	var destroy = function() {
		clear();
		dom.empty();
		dom = null;
	};
	
	
	/**
	 * III. module exports
	 */
	return {
		Error: Error,
		Info: Info,
		Success: Success,
		init: init,
		clear: clear,
		destroy: destroy
	};
	
}());
