/**
 * Collection of functions used throughout the project.
 * 
 * This module is not inited and/or destroyed.
 */
fa.utils = (function() {
	
	"use strict";
	
	/**
	 * I. functions
	 */
	/**
	 * Converts the object given into Map instance.
	 * 
	 * Object keys that are numbers are converted to numbers.
	 * 
	 * @param An object.
	 * @return Map instance.
	 */
	var objectToMap = function(object) {
		var map = new Map();
		var key, number;
		
		for(key of Object.keys(object)) {
			number = Number(key);
			if(!Number.isNaN(number)) {
				key = number;
			}
			map.set(key, object[key]);
		}
		
		return map;
	};
	
	/**
	 * II. exports
	 */
	return {
		objectToMap: objectToMap
	};
	
}());
