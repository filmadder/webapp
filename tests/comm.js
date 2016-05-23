QUnit.module('fa.comm', {
	beforeEach: function() {
		fa.comm.init();
	},
	afterEach: function() {
		fa.comm.destroy();
	}
});

QUnit.test('handler that resolves', function(assert) {
	assert.expect(1);
	
	var done = assert.async();
	
	var calculateAnswer = function() {
		return new Promise(function(resolve, reject) {
			resolve(42);
		});
	};
	fa.comm.receive('calculate answer', calculateAnswer);
	
	fa.comm.send('calculate answer').then(function(data) {
		assert.strictEqual(data, 42);
		done();
	});
});

QUnit.test('handler that rejects', function(assert) {
	assert.expect(1);
	
	var done = assert.async();
	
	var calculateAnswer = function() {
		return new Promise(function(resolve, reject) {
			reject('Come back in 7½ million years.');
		});
	};
	fa.comm.receive('calculate answer', calculateAnswer);
	
	fa.comm.send('calculate answer').catch(function(error) {
		assert.strictEqual(error, 'Come back in 7½ million years.');
		done();
	});
});

QUnit.test('handler with load', function(assert) {
	assert.expect(2);
	
	var done1 = assert.async();
	var done2 = assert.async();
	
	var isTheAnswer = function(load) {
		return new Promise(function(resolve, reject) {
			if(load == 42) resolve(true);
			else resolve(false);
		});
	};
	fa.comm.receive('check answer', isTheAnswer);
	
	fa.comm.send('check answer', 2).then(function(data) {
		assert.strictEqual(data, false);
		done1();
	});
	
	fa.comm.send('check answer', 42).then(function(data) {
		assert.strictEqual(data, true);
		done2();
	});
});

QUnit.test('handlers that reject', function(assert) {
	assert.expect(1);
	
	var done = assert.async();
	
	var intercept = function() {
		return Promise.reject('You asked the wrong question!');
	};
	var calculateAnswer = function() {
		return Promise.reject('Come back in 7½ million years.');
	};
	fa.comm.receive('calculate answer', intercept, 6);
	fa.comm.receive('calculate answer', calculateAnswer, 7);
	
	fa.comm.send('calculate answer').catch(function(error) {
		assert.strictEqual(error, 'You asked the wrong question!');
		done();
	});
});

QUnit.test('handlers that reject/resolve', function(assert) {
	assert.expect(1);
	
	var done = assert.async();
	
	var intercept = function() {
		return Promise.reject('You asked the wrong question!');
	};
	var calculateAnswer = function() {
		return Promise.resolve('Come back in 7½ million years.');
	};
	fa.comm.receive('calculate answer', intercept, 6);
	fa.comm.receive('calculate answer', calculateAnswer, 7);
	
	fa.comm.send('calculate answer').catch(function(error) {
		assert.strictEqual(error, 'You asked the wrong question!');
		done();
	});
});

QUnit.test('handlers that resolve', function(assert) {
	assert.expect(1);
	
	var done = assert.async();
	
	var intercept = function() {
		return Promise.resolve('You asked the wrong question!');
	};
	var calculateAnswer = function() {
		return Promise.resolve('Come back in 7½ million years.');
	};
	fa.comm.receive('calculate answer', intercept, 6);
	fa.comm.receive('calculate answer', calculateAnswer, 7);
	
	fa.comm.send('calculate answer').then(function(data) {
		assert.strictEqual(data, 'Come back in 7½ million years.');
		done();
	});
});

QUnit.test('send unknown signal', function(assert) {
	assert.expect(1);
	
	var done = assert.async();
	
	fa.comm.send('get answer').then(function(data) {
		assert.equal(data, undefined);
		done();
	});
});

QUnit.test('disconnect', function(assert) {
	assert.expect(1);
	
	var done = assert.async();
	
	var calculateAnswer = function() {
		return Promise.resolve('Come back in 7½ million years.');
	};
	
	fa.comm.receive('calculate answer', calculateAnswer);
	fa.comm.disconnect('calculate answer', calculateAnswer);
	
	fa.comm.send('calculate answer').then(function(data) {
		assert.equal(data, undefined);
		done();
	});
});
