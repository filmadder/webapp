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

QUnit.test('get 404', function(assert) {
	var done = assert.async();
	
	fa.db.conn
	.get('/api/dragons/')
	.catch(function(error) {
		console.log(error);
		assert.equal(true, true);
		done();
	});
});
