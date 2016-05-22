QUnit.module('fa.logs', {
	beforeEach: fa.logs.clear,
	afterEach: fa.logs.clear
});

QUnit.test('write, retrieve and clear', function(assert) {
	var logs = fa.logs.retrieve();
	assert.deepEqual(logs, []);
	
	fa.logs.error('some error');
	fa.logs.info('some info');
	
	logs = fa.logs.retrieve();
	assert.equal(logs.length, 2);
	
	assert.equal(logs[0].type, 'error');
	assert.equal(logs[0].text, 'some error');
	
	assert.equal(logs[1].type, 'info');
	assert.equal(logs[1].text, 'some info');
	
	fa.logs.clear();
	
	logs = fa.logs.retrieve();
	assert.deepEqual(logs, []);
});
