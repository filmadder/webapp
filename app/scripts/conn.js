fa.conn = (function() {
	
	"use strict";
	
	// 
	// http
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
	// sockets
	// 
	
	// returns a generator object with a single method getId
	// the latter always returns an unused id
	var createIdGenerator = function() {
		var generator = {};
		var id = -1;
		
		generator.getId = function() {
			id += 1;
			return id;
		};
		
		return generator;
	};
	
	// returns a promise that resolves into the server's response to an
	// outgoing message with the given id or rejects with an error if the
	// response is of type error or if the socket breaks
	var createSocketPromise = function(id, received, erred, closed) {
		return new Promise(function(resolve, reject) {
			var onMessage = function(data) {
				if(data.hasOwnProperty('id') && data.id == id) {
					clear();
					resolve(data);
				}
			};
			
			var onError = function(error) {
				clear();
				reject(error);
			};
			
			var onClose = function() {
				clear();
				reject({code: 'pending', message: 'Closed socket connection'});
			};
			
			var clear = function() {
				received.remove(onMessage);
				erred.remove(onError);
				closed.remove(onClose);
			};
			
			received.add(onMessage);
			erred.add(onError);
			closed.add(onClose);
		});
	};
	
	// a socket connection object is a wrapper around WebSocket
	// the socket connection is opened at init
	// throws an error if the socket could not be opened
	var createSocketConn = function() {
		var received = new signals.Signal();
		var erred = new signals.Signal();
		var closed = new signals.Signal();
		
		var idGen = createIdGenerator();
		var socket = fa.settings.SOCKET_API_URL +'/'+ fa.auth.getToken();
		
		try {
			socket = new WebSocket(socket);
		} catch(err) {
			console.error(err);
			throw new Error('Could not open socket connection');
		}
		
		// dispatches a received or an erred signal when a message arrives
		// unless the message is malformed in which case it is ignored
		socket.onmessage = function(e) {
			try {
				var data = JSON.parse(e.data);
				
				if(data.type == 'error') {
					erred.dispatch({code: data.code, message: data.message});
				}
				else {
					received.dispatch(data);
				}
			}
			catch (err) {
				console.error(err);  // do not propagate non-json messages
			}
		};
		
		// dispatches an erred signal when an error occurs
		socket.onerror = function(e) {
			erred.dispatch(e);
		};
		
		// dispatches a closed signal when the socket closes
		socket.onclose = function(e) {
			closed.dispatch();
		};
		
		// the socket connection object
		return {
			received: received,
			erred: erred,
			closed: closed,
			
			send: function(type, load) {
				var id = idGen.getId();
				var mes = fjs.assign({id: id, type: type}, load);
				
				try {
					socket.send(JSON.stringify(mes));
				}
				catch (err) {
					return Promise.reject({code: 'bug', message: err.message});
				}
				
				return createSocketPromise(id, received, erred, closed);
			},
			
			close: function() {
				socket.close();
				received.removeAll();
				erred.removeAll();
				closed.removeAll();
			}
		};
	};
	
	// a socket manager object takes care of opening, re-opening and closing a
	// socket connection object
	var createSocketManager = function() {
		var manager = {};
		var conn = null;
		
		// returns a promise that resolves upon establishing connection
		// and rejects with an error otherwise
		manager.open = function() {
			if(conn) {
				return Promise.reject({
					code: 'bug',
					message: 'There is an open connection' });
			}
			
			try {
				conn = createSocketConn();
			}
			catch (err) {
				return Promise.reject({
					code: 'pending', message: err.message});
			}
			
			conn.closed.addOnce(manager.close);
			
			return createSocketPromise(0, conn.received, conn.erred, conn.closed);
		};
		
		// returns a promise that resolves with the same-ID message returned by
		// the server, unless the message is of type error
		manager.send = function(type, load) {
			if(!conn) {
				return Promise.reject({
					code: 'bug', message: 'No open socket connection'});
			}
			
			return conn.send(type, load);
		};
		
		// closes the current socket connection, if such
		// this should be always safe to call
		manager.close = function() {
			if(conn) {
				conn.close();
				conn = null;
			}
		};
		
		return manager;
	};
	
	
	// 
	// state
	// 
	
	// the currently active socket manager
	var socketManager = createSocketManager();
	
	// the public api
	var api = {};
	
	api.get = function(url) {
		return request('GET', url);
	};
	
	api.post = function(url, load) {
		return request('POST', url, load);
	};
	
	api.put = function(url, load) {
		return request('PUT', url, load);
	};
	
	api.open = function() {
		return socketManager.open();
	};
	
	api.send = function(type, load) {
		return socketManager.send(type, load);
	};
	
	api.close = function() {
		socketManager.close();
	};
	
	return api;
	
}());
