fa.auth = (function() {
	
	"use strict";
	
	// 
	// constants
	// 
	
	// the localStorage key for the auth session
	// the value should be a {token, user} object
	var STORAGE_KEY = 'fa_session';
	
	
	// 
	// constructors
	// 
	
	// session objects contain the session's token and the user's data
	// both of these could be null if the user is not authenticated
	var createSession = function(token, user) {
		var session = {};
		var store;
		
		if(token && user) {
			store = {user: user, token: token};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
		}
		else {
			store = localStorage.getItem(STORAGE_KEY);
			
			if(store) {
				try {
					store = JSON.parse(store);
					token = store.token;
					// user = fa.users.create(store.user);
					user = null;
				}
				catch (error) {
					console.error(error);
					token = null;
					user = null;
				}
			}
			else {
				token = null;
				user = null;
			}
		}
		
		session.getToken = function() {
			return token;
		};
		
		session.getUser = function() {
			return user;
		};
		
		session.destroy = function() {
			localStorage.removeItem(STORAGE_KEY);
			token = null;
			user = null;
		};
		
		return session;
	};
	
	
	// 
	// state
	// 
	
	// the currently active session object
	var session = createSession();
	
	// the public api
	var auth = {};
	
	auth.getToken = function() {
		return session.getToken();
	};
	
	auth.hasPerm = function() {
		return session.getToken() ? true : false;
	};
	
	auth.register = function(email, name, pass) {
		auth.logout();
		return new Promise(function(resolve, reject) {
			fa.conn.put('/api/auth/', {
				email: email, name: name, pass: pass
			}).then(function(data) {
				session = createSession(data);
				resolve();
			}).catch(reject);
		});
	};
	
	auth.login = function(load) {
		auth.logout();
		return new Promise(function(resolve, reject) {
			fa.conn.post('/api/auth/', {
				method: 's', email: load['email'], password: load['pass']
			}).then(function(data) {
				session = createSession(data.token, {});
				resolve();
			}).catch(reject);
		});
	};
	
	auth.logout = function() {
		if(session.getToken()) {
			session.destroy();
			session = createSession();
		}
	};
	
	return auth;
	
}());
