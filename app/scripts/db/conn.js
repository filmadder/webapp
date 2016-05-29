/**
 * Handles the connection to the API.
 */
fa.db.conn = (function() {
	
	"use strict";
	
	
	/**
	 * API calls
	 * 
	 * Return Promises that resolve into the JSON data load or reject with
	 * {code, message}.
	 */
	var request = function(method, url, load) {
		var headers = {};
		var body = null;
		
		if(method == 'POST' || method == 'PUT') {
			headers['content-type'] = 'application/json';
			body = JSON.stringify(load);
		}
		if(fa.db.auth.getToken()) {
			headers['fa-token'] = fa.db.auth.getToken();
		}
		
		return new Promise(function(resolve, reject) {
			fetch(fa.settings.API_URL+url, {
				method: method,
				headers: headers,
				body: body
			})
			.then(function(response) {
				response.json()
				.then(function(data) {
					if(response.ok)
						resolve(data);
					else if('error' in data)
						reject({code: response.status, message: data['error']});
					else
						reject({code: response.status, message: response.statusText});
				})
				.catch(function(error) {
					if(response.ok) resolve({});
					else
						reject({code: response.status, message: response.statusText});
				});
			})
			.catch(function(error) {
				fa.logs.error(error);
				reject({code: null, message: error.message});
			});
		});
	};
	
	var get = function(url) {
		return request('GET', url);
	};
	
	var post = function(url, load) {
		return request('POST', url, load);
	};
	
	var put = function(url, load) {
		return request('PUT', url, load);
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
