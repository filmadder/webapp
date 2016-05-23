QUnit.module('fa.db.auth', {
	beforeEach: function() {
		fa.comm.init();
		fa.db.conn.init();
		fa.db.auth.init();
		fa.db.auth.clear();
	},
	afterEach: function() {
		fa.db.auth.clear();
		fa.db.auth.destroy();
		fa.db.conn.destroy();
		fa.comm.destroy();
	}
});

QUnit.test('login', function(assert) {
	var done = assert.async();
	assert.equal(fa.db.auth.getToken(), null);
	
	fa.comm.send('login', {})
	.then(function() {
		assert.equal(fa.db.auth.getToken(), 'implausible-auth-token');
		done();
	});
});

QUnit.test('logout', function(assert) {
	var done = assert.async();
	
	fa.comm.send('login', {})
	.then(function() {
		assert.equal(fa.db.auth.getToken(), 'implausible-auth-token');
		return fa.comm.send('logout');
	})
	.then(function() {
		assert.equal(fa.db.auth.getToken(), null);
		done();
	});
});

QUnit.test('create account', function(assert) {
	var done = assert.async();
	
	fa.comm.send('create account', {})
	.then(function() {
		assert.equal(fa.db.auth.getToken(), 'implausible-auth-token');
		done();
	});
});
