QUnit.module('fa.db.conn', {
	beforeEach: function() {
		fa.db.conn.init();
	},
	afterEach: function() {
		fa.db.conn.destroy();
	}
});

QUnit.test('get 200', function(assert) {
	assert.expect(1);
	
	var done = assert.async();
	
	fa.db.conn
	.get('/api/films/1/review/')
	.then(function(data) {
		assert.equal(data['film']['title'], 'Ghost in the Shell');
		done();
	});
});

QUnit.test('get 200 bad json', function(assert) {
	assert.expect(1);
	
	var done = assert.async();
	
	fa.db.conn
	.get('/api/bad/json/')
	.catch(function(error) {
		assert.equal(error, 'Server response could not be decoded');
		done();
	});
});

QUnit.test('get 404', function(assert) {
	assert.expect(1);
	
	var done = assert.async();
	
	fa.db.conn
	.get('/api/dragons/')
	.catch(function(error) {
		assert.equal(error, 404);
		done();
	});
});

QUnit.test('post 200', function(assert) {
	assert.expect(1);
	
	var done = assert.async();
	
	fa.db.conn
	.post('/api/auth/', {answer: 42})
	.then(function(data) {
		assert.equal(data['token'], 'implausible-auth-token');
		done();
	});
});
