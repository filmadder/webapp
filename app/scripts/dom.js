fa.dom = (function() {
	
	"use strict";
	
	
	// 
	// retrieving
	// 
	
	// returns the dom element that matches the query
	// wrapper around querySelector
	// 
	// the optional ancestor argument could be a dom element or a query
	// specifying such
	// 
	// throws an error if there is no element matching the query
	var get = function(query, ancestor) {
		var res;
		
		if(fjs.isString(ancestor)) {
			ancestor = get(ancestor);
		} else if(!(ancestor instanceof Element)) {
			ancestor = document;
		}
		
		res = ancestor.querySelector(query);
		
		if(res === null) {
			throw new Error('Could not find '+query);
		}
		
		return res;
	};
	
	// returns [] of elements that match the query
	// 
	// the optional ancestor argument could be a dom element or a query
	// specifying such
	var filter = function(query, ancestor) {
		var i, res, li = [];
		
		if(fjs.isString(ancestor)) {
			ancestor = get(ancestor);
		} else if(!(ancestor instanceof Element)) {
			ancestor = document;
		}
		
		res = ancestor.querySelectorAll(query);
		
		for(i = 0; i < res.length; i++) {
			li.push(res[i]);
		}
		
		return li;
	};
	
	
	// 
	// event listeners
	// 
	
	// wrapper around addEventListener
	// 
	// elem can be a dom element, a [] of dom elements, or a query that will be
	// fed into filter(elem) to obtain a [] of dom elements
	// 
	// this means that if you pass a query that returns no elements, then no
	// event listeners will be attached
	var on = function(elem, eventType, callback) {
		var i;
		
		if(fjs.isString(elem)) {
			elem = filter(elem);
		}
		
		if(fjs.isArray(elem)) {
			for(i = 0; i < elem.length; i++) {
				elem[i].addEventListener(eventType, callback, false);
			}
		}
		else {
			elem.addEventListener(eventType, callback, false);
		}
	};
	
	
	// 
	// exports
	// 
	
	return {
		get: get,
		filter: filter,
		on: on
	};
	
}());
