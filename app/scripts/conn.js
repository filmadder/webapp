fa.conn = (function() {
	
	"use strict";
	
	
	// 
	// functions
	// 
	
	// returns {method, headers, body}, ready to be plugged into fetch
	// helper for the request function
	var getOptions = function(method, load) {
		var op = {'method': method, 'headers': {}};
		
		if(fa.auth.hasPerm()) {
			op['headers']['fa-token'] = fa.auth.getToken();
		}
		
		if(method == 'POST' || method == 'PUT') {
			op['headers']['content-type'] = 'application/json';
			op['body'] = JSON.stringify(load);
		}
		
		return op;
	};
	
	// returns promise that resolves for 200 and rejects otherwise
	// helper for the request function
	var handleResponse = function(response) {
		return new Promise(function(resolve, reject) {
			var ctype = response.headers.get('content-type');
			
			if(ctype && ctype.indexOf('application/json') >= 0) {
				response.json().then(function(data) {
					if(response.ok) resolve(data);
					else reject({
						code: response.status,
						message: data.error
					});
				}).catch(function(error) {
					reject({code: response.status, message: error.message});
				});
			}
			else {
				if(response.ok) resolve();
				else reject({
					code: response.status,
					message: response.statusText
				});
			}
		});
	};
	
	// wrapper around fetch
	// returns promise that resolves into the JSON data (if such) or rejects
	// with {code, message}
	var request = function(method, path, load) {
		var url = fa.settings.HTTP_API_URL + path;
		var options = getOptions(method, load);
		
		return new Promise(function(resolve, reject) {
			fetch(url, options).then(function(response) {
				handleResponse(response).then(resolve).catch(reject);
			}).catch(function(error) {  // http request could not be fulfilled
				reject({code: null, message: error.message});
			});
		});
	};
	
	
	// 
	// the public api
	// 
	
	return {
		get: function(url) {
			return request('GET', url);
		},
		post: function(url, load) {
			return request('POST', url, load);
		},
		put: function(url, load) {
			return request('PUT', url, load);
		}
	};
	
}());
