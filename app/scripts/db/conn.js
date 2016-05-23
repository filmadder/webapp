/**
 * Handles the connection to the API.
 */
fa.db.conn = (function() {
	
	"use strict";
	
	
	/**
	 * API calls
	 * 
	 * Return Promises that resolve into the JSON data load or reject with the
	 * respective error.
	 */
	var _addAuthToken = function(headers) {
		var token = fa.db.auth.getToken();
		if(token) headers['fa-token'] = token;
		return headers;
	};
	
	var get = function(url) {
		var headers = _addAuthToken({});
		
		return new Promise(function(resolve, reject) {
			fetch(fa.settings.API_URL+url, {
				method: 'GET', headers: headers
			})
			.then(function(response) {
				if(response.ok) {
					response.json()
					.then(resolve)
					.catch(function(error) {
						fa.logs.error(error);
						reject('Server response could not be decoded');
					});
				}
				else if(response.status == 400) {
					response.json()
					.then(function(data) {
						if('error' in data) reject(data['error']);
						else reject(response.status);
					})
					.catch(function(error) {
						fa.logs.error(error);
						reject('Server response could not be decoded');
					});
				}
				else reject(response.status);
			})
			.catch(function(error) {
				fa.logs.error(error);
				reject(error);
			});
		});
	};
	
	var post = function(url, load) {
		var headers = _addAuthToken({
			'content-type': 'application/json'
		});
		
		return new Promise(function(resolve, reject) {
			fetch(fa.settings.API_URL+url, {
				method: 'POST',
				headers: headers,
				body: JSON.stringify(load)
			})
			.then(function(response) {
				if(response.ok) {
					response.json()
					.then(resolve)
					.catch(function(error) {
						fa.logs.error(error);
						reject('Server response could not be decoded');
					});
				}
				else if(response.status == 400) {
					response.json()
					.then(function(data) {
						if('error' in data) reject(data['error']);
						else reject(response.status);
					})
					.catch(function(error) {
						fa.logs.error(error);
						reject('Server response could not be decoded');
					});
				}
				else reject(response.status);
			})
			.catch(function(error) {
				fa.logs.error(error);
				reject(error);
			});
		});
	};
	
	var put = function(url, load) {
		var headers = _addAuthToken({
			'content-type': 'application/json'
		});
		
		return new Promise(function(resolve, reject) {
			fetch(fa.settings.API_URL+url, {
				method: 'PUT',
				headers: headers,
				body: JSON.stringify(load)
			})
			.then(function(response) {
				if(response.ok) {
					response.json()
					.then(resolve)
					.catch(function(error) {
						fa.logs.error(error);
						reject('Server response could not be decoded');
					});
				}
				else if(response.status == 400) {
					response.json()
					.then(function(data) {
						if('error' in data) reject(data['error']);
						else reject(response.status);
					})
					.catch(function(error) {
						fa.logs.error(error);
						reject('Server response could not be decoded');
					});
				}
				else reject(response.status);
			})
			.catch(function(error) {
				fa.logs.error(error);
				reject(error);
			});
		});
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
		return;
	};
	
	var destroy = function() {
		return;
	};
	
	
	/**
	 * Exports
	 */
	return {
		init: init,
		destroy: destroy,
		
		online: online,
		
		get: get,
		post: post,
		put: put
	};
	
}());
