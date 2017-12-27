QUnit.module('ws', function(hooks) {
	var server;

	hooks.beforeEach(function() {
		fa.settings.overwrite('SOCKET_API_URL', 'fakeurl');
		var socket = fa.settings.SOCKET_API_URL +'/'+ fa.auth.getToken();
		console.log(socket);
		server = new Mock.Server(socket);
	});

	hooks.afterEach(function() {
		server.stop();
	});

	QUnit.test('open successful', function(assert) {
		var done = assert.async();

		server.on('connection', function() {
			server.send(JSON.stringify({ id: 0 }));
		});

		fa.ws.open().then(function() {
			done();
		});
	});

	// QUnit.todo('open error');
	// QUnit.todo('send successful');
	// QUnit.todo('send when socket is not open');
	// QUnit.todo('receive in order');
	// QUnit.todo('receive out of order');
	// QUnit.todo('receive non-json message');
	// QUnit.todo('receive an error');
	// QUnit.todo('close while waiting for message');
});
