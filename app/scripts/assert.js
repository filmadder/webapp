/**
 * Provides assertion functions. All assertions are strict.
 * 
 * This module is not inited and/or destroyed.
 */
fa.assert = (function() {
	
	"use strict";
	
	
	/**
	 * Whenever an assertion fails, instance of this class is thrown.
	 * 
	 * @param The error message (optional).
	 */
	var AssertionError = function(message) {
		if(message) {
			fa.logging.error(message);
		}
	};
	
	
	/**
	 * Dictionary of true/false functions checking equality between two
	 * variables of specific type.
	 * 
	 * Objects are compared using their own keys only.
	 * 
	 * Equality between functions has not been implemented.
	 * 
	 * @see https://github.com/jquery/qunit/blob/master/src/equiv.js
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
	 */
	var isEqual = {
		'boolean': function(a, b) {
			return a == b;
		},
		'function': function(a, b) {
			return true;
		},
		'number': function(a, b) {
			if(isNaN(a)) return isNaN(b);
			return a == b;
		},
		'object': function(a, b) {
			if(a == null) return b == null;
			else if(b == null) return false;
			
			if(Array.isArray(a) && Array.isArray(b)) {
				if(a.length !== b.length) return false;
				
				try {
					for(var i = 0; i < a.length; i++) {
						equal(a[i], b[i]);
					}
				}
				catch (error) {
					return false;
				}
			}
			else if(Array.isArray(a) || Array.isArray(b)) {
				return false;
			}
			
			else {
				var keysA = Object.keys(a).sort();
				var keysB = Object.keys(b).sort();
				
				if(keysA.length !== keysB.length) return false;
				
				try {
					for(var j = 0; j < keysA.length; j++) {
						equal(keysA[j], keysB[j]);
						equal(a[keysA[j]], b[keysB[j]]);
					}
				}
				catch (error) {
					return false;
				}
			}
			
			return true;
		},
		'string': function(a, b) {
			return a == b;
		},
		'symbol': function(a, b) {
			return a == b;
		},
		'undefined': function(a, b) {
			return true;
		}
	};
	
	
	/**
	 * Asserts equality between the given items.
	 * 
	 * @param One item.
	 * @param Another item.
	 * @return True.
	 */
	var equal = function(left, right) {
		var errorText = 'assert '+ left +' == '+ right +' failed';
		
		if(typeof left !== typeof right) {
			throw new AssertionError(errorText);
		}
		
		if(!isEqual[typeof left](left, right)) {
			throw new AssertionError(errorText);
		}
		
		return true;
	};
	
	
	/**
	 * Asserts inequality between the given items.
	 * 
	 * @param One item.
	 * @param Another item.
	 * @return True.
	 */
	var notEqual = function(left, right) {
		var errorText = 'assert '+ left +' != '+ right +' failed';
		
		if(typeof left !== typeof right) {
			return true;
		}
		
		if(!isEqual[typeof left](left, right)) {
			return true;
		}
		
		throw new AssertionError(errorText);
	};
	
	
	/**
	 * Asserts that the first item is greater than the second.
	 * If any of the parameters is not a number, the assertion will fail.
	 * 
	 * @param First item.
	 * @param Second item.
	 * @return True.
	 */
	var greater = function(left, right) {
		var errorText = 'assert '+ left +' > '+ right +' failed';
		
		if(typeof left !== typeof right) {
			throw new AssertionError(errorText);
		}
		
		if(typeof left !== 'number') {
			throw new AssertionError(errorText);
		}
		
		if(left <= right) {
			throw new AssertionError(errorText);
		}
		
		return true;
	};
	
	
	/**
	 * Asserts that the first item is less than the second.
	 * If any of the parameters is not a number, the assertion will fail.
	 * 
	 * @param First item.
	 * @param Second item.
	 * @return True.
	 */
	var less = function(left, right) {
		var errorText = 'assert '+ left +' < '+ right +' failed';
		
		if(typeof left !== typeof right) {
			throw new AssertionError(errorText);
		}
		
		if(typeof left !== 'number') {
			throw new AssertionError(errorText);
		}
		
		if(left >= right) {
			throw new AssertionError(errorText);
		}
		
		return true;
	};
	
	
	/**
	 * Asserts that the item given == true.
	 */
	var isTrue = function(item) {
		return equal(item, true);
	};
	
	
	/**
	 * Asserts that the item given == false.
	 */
	var isFalse = function(item) {
		return equal(item, false);
	};
	
	
	/**
	 * Module exports.
	 */
	return {
		AssertionError: AssertionError,
		equal: equal,
		notEqual: notEqual,
		greater: greater,
		less: less,
		isTrue: isTrue,
		isFalse: isFalse
	};
	
}());
