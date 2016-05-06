QUnit.module('fa.assert');

QUnit.test('boolean', function(assert) {
	assert.expect(16);
	
	assert.ok(fa.assert.equal(true, true));
	assert.ok(fa.assert.equal(false, false));
	assert.ok(fa.assert.notEqual(true, false));
	
	try {
		fa.assert.equal(true, false);
	}
	catch (error) {
		assert.ok(error instanceof fa.assert.AssertionError);
	}
	
	assert.ok(fa.assert.isTrue(true));
	assert.ok(fa.assert.isFalse(false));
	
	var item;
	for(item of [false, 42, 'stela', null, undefined]) {
		try {
			fa.assert.isTrue(item);
		}
		catch (error) {
			assert.ok(error instanceof fa.assert.AssertionError);
		}
	}
	for(item of [true, 42, 'stela', null, undefined]) {
		try {
			fa.assert.isFalse(item);
		}
		catch (error) {
			assert.ok(error instanceof fa.assert.AssertionError);
		}
	}
});

QUnit.test('number', function(assert) {
	assert.expect(9);
	
	assert.ok(fa.assert.equal(-Infinity, -Infinity));
	assert.ok(fa.assert.equal(42, 42));
	assert.ok(fa.assert.equal(NaN, NaN));
	assert.ok(fa.assert.equal(Infinity, Infinity));
	
	try {
		fa.assert.equal(0, 1);
	} catch (error) { assert.ok(error instanceof fa.assert.AssertionError); }
	
	assert.ok(fa.assert.notEqual(1, 0));
	
	try {
		fa.assert.notEqual(NaN, NaN);
	} catch (error) { assert.ok(error instanceof fa.assert.AssertionError); }
	
	assert.ok(fa.assert.greater(Infinity, -Infinity));
	assert.ok(fa.assert.less(0, 42));
});

QUnit.test('object', function(assert) {
	assert.expect(15);
	
	assert.ok(fa.assert.equal(null, null));
	
	assert.ok(fa.assert.equal([], []));
	assert.ok(fa.assert.equal([1, 2, 3], [1, 2, 3]));
	try {
		fa.assert.equal([undefined], []);
	} catch (error) { assert.ok(error instanceof fa.assert.AssertionError); }
	
	assert.ok(fa.assert.equal({}, {}));
	assert.ok(fa.assert.equal({name: 'stella'}, {name: 'stella'}));
	assert.ok(fa.assert.equal(
		{'question': 'the meaning', 'answer': 42},
		{question: 'the meaning', answer: 42}
	));
	
	assert.ok(fa.assert.notEqual({}, []));
	assert.ok(fa.assert.notEqual([], {}));
	assert.ok(fa.assert.notEqual([], null));
	assert.ok(fa.assert.notEqual(null, []));
	assert.ok(fa.assert.notEqual({}, null));
	assert.ok(fa.assert.notEqual(null, {}));
	
	assert.ok(fa.assert.equal(
		new Map([['question', 'the meaning'], ['answer', 42]]),
		new Map([['question', 'the meaning'], ['answer', 42]])
	));
	assert.ok(fa.assert.equal(
		new Set(['stella', 42, null]),
		new Set(['stella', 42, null])
	));
});

QUnit.test('string', function(assert) {
	assert.expect(5);
	
	assert.ok(fa.assert.equal('stella', 'stella'));
	assert.ok(fa.assert.equal('', ''));
	
	assert.ok(fa.assert.equal('42', '42'));
	try {
		fa.assert.equal(42, '42');
	} catch (error) { assert.ok(error instanceof fa.assert.AssertionError); }
	
	assert.ok(fa.assert.notEqual('42', 42));
});

QUnit.test('undefined', function(assert) {
	assert.expect(3);
	
	assert.ok(fa.assert.equal(undefined, undefined));
	
	try {
		fa.assert.equal(undefined, null);
	} catch (error) { assert.ok(error instanceof fa.assert.AssertionError); }
	
	assert.ok(fa.assert.notEqual(null, undefined));
});
