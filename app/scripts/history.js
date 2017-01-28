fa.history = (function() {
	
	"use strict";
	
	
	// 
	// constants
	// 
	
	var STORAGE_KEY = 'fa_history';
	
	
	// 
	// constructors
	// 
	
	// returns a history object
	var createHistory = function() {
		var history = {};
		var data;
		
		// load the data from storage, if anything is stored 
		data = sessionStorage.getItem(STORAGE_KEY);
		if(data) {
			try {
				data = JSON.parse();
			} catch (error) {
				data = {};
			}
		} else {
			data = {};
		}
		
		history.save = function() {
			try {
				sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
			} catch (error) {
				console.error(error);
			}
		};
		
		history.setState = function(viewId, state) {
			data[viewId] = state;
			history.save();
		};
		
		history.getState = function(viewId) {
			if(data.hasOwnProperty(viewId)) {
				return data[viewId];
			}
			else return null;
		};
		
		return history;
	};
	
	
	// 
	// state
	// 
	
	var history = createHistory();
	
	
	// 
	// exports
	// 
	
	return {
		getState: history.getState,
		setState: history.setState
	};
	
}());
