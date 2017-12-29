QUnit.module('ws', function(hooks) {
	var sandbox = sinon.createSandbox();
	var server;

	hooks.beforeEach(function() {
		sandbox.stub(fa.auth, 'hasPerm').returns(true);
		sandbox.stub(fa.auth, 'getToken').returns('faketoken');

		fa.settings.overwrite('SOCKET_API_URL', 'fakeurl');
		server = new Mock.Server(fa.settings.SOCKET_API_URL +'/faketoken');
	});

	hooks.afterEach(function() {
		server.stop();
		sandbox.restore();
	});

	QUnit.module('open', function(hooks) {
		QUnit.test('open successful', function(assert) {
			var done = assert.async();

			server.on('connection', function() {
				server.send(JSON.stringify({ id: 0 }));
			});

			fa.ws.open().then(function(data) {
				assert.deepEqual(data, {id: 0});
				done();
			});
		});

		QUnit.test('open error (no auth token)', function(assert) {
			var done = assert.async();

			sandbox.restore();
			sandbox.stub(fa.auth, 'hasPerm').returns(false);

			fa.ws.open().catch(function(error) {
				assert.equal(error.code, 'forbidden');
				done();
			});
		});

		QUnit.test('open error (server closes)', function(assert) {
			var done = assert.async();

			server.on('connection', function() {
				server.close();
			});

			fa.ws.open().catch(function(error) {
				assert.equal(error.code, 'forbidden');
				done();
			});
		});

		QUnit.test('open error (server rejects)', function(assert) {
			var done = assert.async();

			server.on('connection', function() {
				res = {id: 0, type: 'error', code: 'a', message: 'b'};
				server.send(JSON.stringify(res));
			});

			fa.ws.open().catch(function(error) {
				assert.equal(error.code, 'a');
				assert.equal(error.message, 'b');
				done();
			});
		});
	});

	QUnit.module('send', function(hooks) {
		hooks.beforeEach(function() {
			server.on('connection', function() {
				server.send(JSON.stringify({ id: 0 }));
			});
		});

		QUnit.test('send successful', function(assert) {
			var done = assert.async();

			server.on('message', function(message) {
				server.send(message);
			});

			fa.ws.open().then(function() {
				return fa.ws.send('bag', {balls: ['black', 'white']});
			}).then(function(res) {
				assert.equal(res.type, 'bag');
				assert.deepEqual(res.balls, ['black', 'white']);
				done();
			});
		});

		QUnit.test('send when socket is not open', function(assert) {
			var done = assert.async();

			server.on('message', function(message) {
				server.send(message);
			});

			fa.ws.send('bag', {balls: 3}).then(function(res) {
				assert.equal(res.type, 'bag');
				assert.equal(res.balls, 3);
				done();
			});
		});

		// QUnit.todo('receive in order');
		// QUnit.todo('receive out of order');
		// QUnit.todo('receive non-json message');

		QUnit.test('receive an error', function(assert) {
			var done = assert.async();

			server.on('message', function(message) {
				var id = JSON.parse(message).id;
				var res = {id: id, type: 'error', code: 'a', message: 'b'};

				server.send(JSON.stringify(res));
			});

			fa.ws.send('bag', {balls: 3}).catch(function(error) {
				assert.equal(error.code, 'a');
				assert.equal(error.message, 'b');

				done();
			});
		});

		QUnit.test('close while waiting for message', function(assert) {
			var done = assert.async();

			server.on('message', function() {
				server.close();
			});

			fa.ws.send('bag', {balls: 4}).catch(function(error) {
				assert.equal(error.code, 'forbidden');
				done();
			});
		});
	});
});
