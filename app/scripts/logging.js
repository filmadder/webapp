/**
 * Handles the logging.
 * 
 * This module is not inited and/or destroyed.
 */
fa.logging = (function() {
	
	"use strict";
	
	
	/**
	 * Makes a log entry.
	 * 
	 * Log entries comprise {time, type, text} objects.
	 * 
	 * @param The message.
	 * @param Whether it is an error or info.
	 */
	var log = function(text, type) {
		var time = new Date();
		time = time.getTime();
		
		var entry = {
			time: time,
			type: type,
			text: text
		};
		
		var key = 'qLog' + time.toString();
		for(var i = 0; true; i++) {
			if(localStorage.getItem(key) != null) {
				if(i > 0) {
					key = key.split('-')[0];
				}
				key = key + '-' + i.toString();
			}
			else break;
		}
		
		localStorage.setItem(key, JSON.stringify(entry));
	};
	
	/**
	 * Logs an error.
	 * 
	 * @param The error's message.
	 */
	var error = function(text) {
		log(text, 'error');
		if(fa.settings.DEBUG) {
			console.error(text);
		}
	};
	
	/**
	 * Logs an info message.
	 * 
	 * @param The message.
	 */
	var info = function(text) {
		log(text, 'info');
		if(fa.settings.DEBUG) {
			console.log(text);
		}
	};
	
	/**
	 * Retrieves the stored logs.
	 * 
	 * @return [] of {time, type, text} entries.
	 */
	var retrieve = function() {
		var i, key, entry;
		var entries = [];
		
		for(i = 0; i < localStorage.length; i++) {
			key = localStorage.key(i);
			if(!key.startsWith('qLog')) {
				continue;
			}
			
			entry = JSON.parse(localStorage.getItem(key));
			
			entries.push(entry);
		}
		
		return entries;
	};
	
	/**
	 * Deletes all the q logs.
	 * The two loops are needed.
	 */
	var clear = function() {
		var i, key;
		var keysToClear = [];
		
		for(i = 0; i < localStorage.length; i++) {
			key = localStorage.key(i);
			if(!key.startsWith('qLog')) {
				continue;
			}
			keysToClear.push(key);
		}
		
		for(i = 0; i < keysToClear.length; i++) {
			localStorage.removeItem(keysToClear[i]);
		}
	};
	
	
	/**
	 * Module exports.
	 */
	return {
		error: error,
		info: info,
		retrieve: retrieve,
		clear: clear
	};
	
}());
