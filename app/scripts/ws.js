fa.ws = (function() {

	"use strict";


	// 
	// state
	// 

	// the currently active socket wrapper
	var socket = null;

	// dispatches the incoming messages whenever one arrives
	var received = new signals.Signal();


	// 
	// constructors
	// 

	// returns a generator object with a single method getId
	// the latter always returns an unused id
	var createIdGenerator = function() {
		var generator = {};
		var id = 0;

		generator.getId = function() {
			id += 1;
			return id;
		};

		return generator;
	};

	// returns a queue object that keeps track of outgoing messages that wait
	// for their incoming counterparts
	var createQueue = function() {
		var wrapper = {};
		var queue = {};

		// registers a new ID with the queue; the callback will be executed
		// upon receiving a response from the server
		wrapper.add = function(id, callback) {
			if(queue.hasOwnProperty(id)) {
				throw new Error('Overwrote message '+id+' in the queue');
			}

			queue[id] = new signals.Signal();
			queue[id].addOnce(callback);
		};

		// removes the given ID from the queue with the an incoming message
		wrapper.resolve = function(id, message) {
			if(queue.hasOwnProperty(id)) {
				queue[id].dispatch({ok: true, message: message});
				queue[id].removeAll();
				delete queue[id];
			}
		};

		// removes the given ID from the queue with an error
		wrapper.reject = function(id, error) {
			if(queue.hasOwnProperty(id)) {
				queue[id].dispatch({ok: false, error: error});
				queue[id].removeAll();
				delete queue[id];
			}
		};

		// removes all IDs from the queue with an error
		wrapper.rejectAll = function(error) {
			for(var id in queue) {
				wrapper.reject(id, error);
			}
		};

		return wrapper;
	};

	// returns a socket object, a wrapper around a WebSocket instance
	// throws an error if the socket connection could not be opened
	var createSocket = function() {
		var idGen = createIdGenerator();
		var queue = createQueue();

		// 
		// establish the connection
		// 
		var socket = fa.settings.SOCKET_API_URL +'/'+ fa.auth.getToken();

		try {
			socket = new WebSocket(socket);
		} catch(err) {
			log.warn(err); log.trace();
			throw new Error('Could not open socket connection');
		}

		socket.onmessage = function(e) {
			try {
				var data = JSON.parse(e.data);

				if(data.type == 'error') {
					queue.reject(data.id, {code: data.code, message: data.message});
				}
				else {
					if(data.hasOwnProperty('id')) {
						queue.resolve(data.id, data);
					}
					received.dispatch(data);
				}
			} catch (err) {  // do not propagate non-json messages
				log.error(err); log.trace();
			}
		};

		socket.onerror = function(e) {
			log.error(e); log.trace();
		};

		socket.onclose = function(e) {
			log.warn(e);
			queue.rejectAll({code: 'forbidden',
				message: 'The server connection was closed'});
		};

		// 
		// the wrapper object
		// 
		var wrapper = {};

		// returns a boolean indicating whether the socket is operational
		wrapper.isOpen = function() {
			return socket.readyState === socket.OPEN;
		};

		// returns a promise that resolves/rejects with a message/error
		// identified by the given ID
		wrapper.await = function(id) {
			return new Promise(function(resolve, reject) {
				queue.add(id, function(res) {
					if(res.ok) resolve(res.message);
					else reject(res.error);
				});
			});
		};

		// returns a promise that resolves into a same-ID message returned by
		// the server or rejects with a same-ID error
		wrapper.send = function(type, load) {
			var id = idGen.getId();
			var mes = fjs.assign({id: id, type: type}, load);

			try {
				socket.send(JSON.stringify(mes));
			} catch (err) {
				log.warn(err); log.trace();
				return Promise.reject({code: 'bug', message: err.message});
			}

			return wrapper.await(id);
		};

		// closes the underlying socket
		wrapper.close = function() {
			socket.close();
		};

		return wrapper;
	};


	// 
	// functions
	// 

	// opens a new websocket connection; if there is one, it gets closed
	// 
	// returns a promise that resolves upon establishing a connection or
	// rejects with an error otherwise
	var open = function() {
		close();

		if(!fa.auth.hasPerm()) {
			return Promise.reject({code: 'forbidden',
				message: 'You are not logged in'});
		}

		try {
			socket = createSocket();
		} catch (err) {
			log.warn(err); log.trace();
			return Promise.reject({code: 'bug', message: err.message});
		}

		return socket.await(0);
	};

	// closes the current websocket connection, if there is such
	// this function should always be safe to call
	var close = function() {
		if(socket) {
			socket.close();
			socket = null;
		}
	};

	// returns a promise that resolves into a same-ID message returned by the
	// server, unless the message is of type error
	// 
	// if there is no open connection, it tries to establish one
	var send = function(type, load) {
		var prom = (socket && socket.isOpen()) ? Promise.resolve() : open();
		return prom.then(function() {
			return socket.send(type, load);
		});
	};


	// 
	// exports
	// 

	return {
		received: received,
		open: open,
		send: send,
		close: close
	};

}());
