QUnit.module('fa.logging', {
	beforeEach: fa.logging.clear,
	afterEach: fa.logging.clear
});

QUnit.test('write, retrieve and clear', function(assert) {
	var logs = fa.logging.retrieve();
	assert.deepEqual(logs, []);
	
	fa.logging.error('some error');
	fa.logging.info('some info');
	
	logs = fa.logging.retrieve();
	assert.equal(logs.length, 2);
	
	assert.equal(logs[0].type, 'error');
	assert.equal(logs[0].text, 'some error');
	
	assert.equal(logs[1].type, 'info');
	assert.equal(logs[1].text, 'some info');
	
	fa.logging.clear();
	
	logs = fa.logging.retrieve();
	assert.deepEqual(logs, []);
});
