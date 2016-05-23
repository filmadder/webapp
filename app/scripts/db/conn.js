/**
 * Handles the connection to the API.
 */
fa.db.conn = (function() {
	
	"use strict";
	
	
	/**
	 * API calls
	 * 
	 * Resolve with ready-to-use objects. Reject with an error message.
	 */
	var get = function(url) {
		return new Promise(function(resolve, reject) {
			fetch(fa.settings.API_URL+url, {
				method: 'GET'
			})
			.then(function(response) {
				if(response.ok) {
					response.json()
					.then(function(data) {
						resolve(data);
					})
					.catch(function(error) {
						fa.logs.error(error);
						reject({
							error: 'Server response could not be decoded'
						});
					});
				}
				else if(response.status == 400) {
					response.json()
					.then(function(data) {
						reject({
							'status': 400,
							'error': data['error']
						});
					})
					.catch(function(error) {
						fa.logs.error(error);
						reject({
							error: 'Server response could not be decoded'
						});
					});
				}
				else {
					reject({
						'status': response.status
					});
				}
			});
		});
	};
	
	var post = function(url, load) {
		
	};
	
	
	/**
	 * Checks whether the app is online.
	 */
	var online = function() {
		return true;
	};
	
	
	/**
	 * Module turn on/off functions
	 */
	var init = function() {
		
	};
	
	var destroy = function() {
		
	};
	
	
	/**
	 * Exports
	 */
	return {
		init: init,
		destroy: destroy,
		
		online: online,
		
		get: get,
		post: post
	};
	
}());
