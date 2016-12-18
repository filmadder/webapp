fa.auth = (function() {
	
	"use strict";
	
	// 
	// constants
	// 
	
	// the localStorage key for the auth session
	// the value should be an auth token
	var STORAGE_KEY = 'fa_session';
	
	
	// 
	// constructors
	// 
	
	// returns a session object
	// 
	// if inited with a token (this is assumed to be valid), it stores it
	// if inited without token, it will try to recover it from storage
	var createSession = function(token) {
		if(token) {
			localStorage.setItem(STORAGE_KEY, token);
		}
		else {
			token = localStorage.getItem(STORAGE_KEY);
		}
		
		return {
			getToken: function() {
				return token;
			},
			destroy: function() {
				localStorage.removeItem(STORAGE_KEY);
				token = null;
			}
		};
	};
	
	
	// 
	// state
	// 
	
	// the currently active session object
	var session = createSession();
	
	// the public api
	var auth = {};
	
	// returns the auth token
	auth.getToken = function() {
		return session.getToken();
	};
	
	// the permission system is simple: either the user can access the inner
	// views or not; this could be extended in the future
	auth.hasPerm = function() {
		return session.getToken() ? true : false;
	};
	
	// returns a promise that resolves when the user is registered and logged
	// in or rejects with an error
	auth.register = function(load) {
		auth.logout();
		return fa.http.put('/api/auth/', {
			email: load['email'], name: load['name'], pass: load['pass']
		}).then(function(data) {
			session = createSession(data);
			return fa.ws.open();
		});
	};
	
	// returns a promise that resolves when the socket connection is ready to
	// use or rejects with an error
	auth.login = function(load) {
		auth.logout();
		return fa.http.post('/api/auth/', {
			method: 's', email: load['email'], password: load['pass']
		}).then(function(data) {
			session = createSession(data.token);
			return fa.ws.open();
		});
	};
	
	// resets the session and closes the socket connection
	auth.logout = function() {
		if(session.getToken()) {
			session.destroy();
			session = createSession();
		}
		fa.ws.close();
	};
	
	return auth;
	
}());
