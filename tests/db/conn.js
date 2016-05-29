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

QUnit.skip('get 200 bad json', function(assert) {
	assert.expect(2);
	
	var done = assert.async();
	
	fa.db.conn
	.get('/api/bad/json/')
	.catch(function(error) {
		assert.equal(error.code, 200);
		assert.equal(error.message, 'Here you go Bro');
		done();
	});
});

QUnit.test('get 404', function(assert) {
	assert.expect(2);
	
	var done = assert.async();
	
	fa.db.conn
	.get('/api/dragons/')
	.catch(function(error) {
		assert.equal(error.code, 404);
		assert.equal(error.message, 'Sorry, not here Bro');
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
