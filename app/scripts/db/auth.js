/**
 * Holds the user info.
 * Plays the role of a permission matrix.
 */
fa.db.auth = (function() {
	
	"use strict";
	
	
	/**
	 * Constants
	 */
	/**
	 * The localStorage key for the auth token.
	 */
	var STORAGE_KEY = 'faToken';
	
	
	/**
	 * Auth token
	 */
	/**
	 * Class for token storage and retrieval.
	 */
	var Token = function() {
		this.token = localStorage.getItem(STORAGE_KEY);
	};
	
	Token.prototype.get = function() {
		return this.token;
	};
	
	Token.prototype.set = function(newToken) {
		localStorage.setItem(STORAGE_KEY, newToken);
		this.token = newToken;
	};
	
	Token.prototype.remove = function() {
		localStorage.removeItem(STORAGE_KEY);
		this.token = null;
	};
	
	/**
	 * Holds the currently active Token instance.
	 */
	var token = null;
	
	
	/**
	 * Receivers
	 */
	/**
	 * Rejects signals if the user is not authenticated.
	 */
	var requireLogin = function() {
		fa.assert.notEqual(token, null);
		
		if(token.get() != null) return Promise.resolve();
		
		Promise.reject('Login required');
	};
	
	
	/**
	 * Attempts to register a new user account.
	 */
	var createAccount = function(load) {
		fa.assert.notEqual(token, null);
		
		if(!fa.db.conn.online()) {
			return Promise.reject('You must be online in order to create an account');
		}
		
		return fa.db.conn
		.put('/api/auth/', load)
		.then(function(data) {
			token.set(data.token);
		});
	};
	
	/**
	 * Attempts to authenticate the user.
	 * 
	 * The load must be {email, password}.
	 */
	var login = function(load) {
		fa.assert.notEqual(token, null);
		
		if(!fa.db.conn.online()) {
			return Promise.reject('You must be online in order to login');
		}
		
		return fa.db.conn
		.post('/api/auth/', load)
		.then(function(data) {
			token.set(data.token);
		});
	};
	
	/**
	 * Deletes the auth token.
	 */
	var logout = function() {
		fa.assert.notEqual(token, null);
		token.remove();
		return Promise.resolve();
	};
	
	
	/**
	 * Registers the signal receivers.
	 */
	var init = function() {
		token = new Token();
		
		fa.comm.receive('create account', createAccount);
		fa.comm.receive('login', login);
		fa.comm.receive('logout', logout);
		
		fa.comm.receive('search films', requireLogin);
		fa.comm.receive('get film', requireLogin);
	};
	
	var destroy = function() {
		fa.comm.disconnect('create account', createAccount);
		fa.comm.disconnect('login', login);
		fa.comm.disconnect('logout', logout);
		
		fa.comm.disconnect('search films', requireLogin);
		fa.comm.disconnect('get film', requireLogin);
		
		token = null;
	};
	
	
	/**
	 * Exports
	 */
	return {
		init: init,
		destroy: destroy,
		
		getToken: function() {
			return token ? token.get() : null;
		},
		clear: function() {
			if(token) token.remove();
		}
	};
	
}());
