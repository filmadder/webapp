fa.auth = (function() {
	
	"use strict";
	
	// 
	// constants
	// 
	
	// the localStorage key for the auth session
	// the value should be a {token, user: {pk, name}} object
	var STORAGE_KEY = 'fa_session';
	
	
	// 
	// constructors
	// 
	
	// returns a session object
	// 
	// if inited with params (these are assumed to be valid), it stores them
	// if inited without params, it will try to recover them from storage
	var createSession = function(token, user) {
		
		// tries to recover token and user from storage
		// throws an error if unsuccessful
		var recover = function() {
			var store = localStorage.getItem(STORAGE_KEY);
			if(!store) {
				throw new Error();
			}
			
			store = JSON.parse(store);
			
			token = store.token;
			user = store.user;
			if(!token || !user || !user.pk || !user.name) {
				throw new Error();
			}
		};
		
		// removes any stored session from storage and resets token and user to
		// some default values
		var destroy = function() {
			localStorage.removeItem(STORAGE_KEY);
			token = null;
			user = {pk: 0, name: ''};
		};
		
		// init the session
		// 
		// if token and user are given, use them
		// otherwise, try to recover them from storage
		if(token && user) {
			localStorage.setItem(STORAGE_KEY,
					JSON.stringify({token: token, user: user}));
		}
		else {
			try {
				recover();
			} catch (e) {
				destroy();
			}
		}
		
		// the session object
		return {
			getToken: function() {
				return token;
			},
			getUser: function() {
				return user;
			},
			destroy: destroy
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
	
	// returns {pk, name} for the logged in user
	// returns {0, ''} if there is not such
	auth.getUser = function() {
		return session.getUser();
	};
	
	// returns a promise that resolves when the user is registered and logged
	// in or rejects with an error
	auth.register = function(load) {
		auth.logout();
		return fa.http.put('/auth/', {
			email: load['email'], name: load['name'],
			password1: load['pass1'], password2: load['pass2']
		}).then(function(data) {
			session = createSession(data.token, data.user);
			return fa.ws.open();
		});
	};
	
	// returns a promise that resolves when the socket connection is ready to
	// use or rejects with an error
	auth.login = function(load) {
		auth.logout();
		return fa.http.post('/auth/', {
			method: 's', email: load['email'], password: load['pass']
		}).then(function(data) {
			session = createSession(data.token, data.user);
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
