QUnit.module('fa.comm', {
	beforeEach: function() {
		fa.comm.init();
	},
	afterEach: function() {
		fa.comm.destroy();
	}
});

QUnit.test('handler returning promise', function(assert) {
	assert.expect(1);
	
	var done = assert.async();
	
	var calculateAnswer = function() {
		return new Promise(function(resolve, reject) {
			resolve(42);
		});
	};
	fa.comm.register('calculate', 'answer', calculateAnswer);
	
	var signal = new fa.comm.Signal('calculate', 'answer');
	
	signal.dispatch().then(function(data) {
		assert.strictEqual(data, 42);
		done();
	});
});

QUnit.test('handler returning promise (2)', function(assert) {
	assert.expect(1);
	
	var done = assert.async();
	
	var calculateAnswer = function() {
		return new Promise(function(resolve, reject) {
			reject('Come back in 7½ million years.');
		});
	};
	fa.comm.register('calculate', 'answer', calculateAnswer);
	
	var signal = new fa.comm.Signal('calculate', 'answer');
	
	signal.dispatch().catch(function(error) {
		assert.strictEqual(error, 'Come back in 7½ million years.');
		done();
	});
});

QUnit.test('handler returning value', function(assert) {
	assert.expect(2);
	
	var done1 = assert.async();
	var done2 = assert.async();
	
	var isTheAnswer = function(load) {
		if(load.get('answer') == 42) return true;
		return false;
	};
	fa.comm.register('check', 'answer', isTheAnswer);
	
	var signal = new fa.comm.Signal('check', 'answer');
	
	signal.dispatch({answer: 2}).then(function(data) {
		assert.strictEqual(data, false);
		done1();
	});
	
	signal.dispatch({answer: 42}).then(function(data) {
		assert.strictEqual(data, true);
		done2();
	});
});

QUnit.test('send', function(assert) {
	assert.expect(3);
	
	var done1 = assert.async();
	var done2 = assert.async();
	var done3 = assert.async();
	
	var isTheAnswer = function(load) {
		if(load.get('answer') == 42) return true;
		return false;
	};
	fa.comm.register('check', 'answer', isTheAnswer);
	
	fa.comm.send('check', 'answer', {answer: 2}).then(function(data) {
		assert.strictEqual(data, false);
		done1();
	});
	
	fa.comm.send('check', 'answer', {answer: 42}).then(function(data) {
		assert.strictEqual(data, true);
		done2();
	});
	
	fa.comm.send('fake', 'answer', {answer: 42}).catch(function(error) {
		assert.equal(error, 'Internal error: could not fake answer.');
		done3();
	});
});
