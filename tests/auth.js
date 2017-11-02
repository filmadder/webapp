QUnit.module('auth', function(hooks) {
	hooks.beforeEach(function() {
		this.rawUser = {pk: 1, name: 'ghost', avatarUrl: 'snake.png'};
		this.user = fa.models.users.unpackUser(this.rawUser);
		this.token = 'implausible-auth-token';

		fa.auth.init();
	});

	hooks.afterEach(function(assert) {
		fa.auth.destroy();
		assert.equal(localStorage.getItem('fa_session'), null);
	});

	QUnit.test('register', function(assert) {
		var done = assert.async();
		var user = this.user, token = this.token;

		var httpPut = sinon.stub(fa.http, 'put')
					  .resolves({token: this.token, user: this.rawUser});
		var wsOpen = sinon.stub(fa.ws, 'open').resolves();

		fa.auth.register({}).then(function() {
			assert.ok(httpPut.calledOnce);
			assert.ok(wsOpen.calledOnce);

			assert.ok(fa.auth.hasPerm());
			assert.deepEqual(fa.auth.getUser(), user);
			assert.equal(fa.auth.getToken(), token);

			httpPut.restore(); wsOpen.restore();
			done();
		});
	});

	QUnit.test('login', function(assert) {
		var done = assert.async();
		var user = this.user, token = this.token;

		var httpPost = sinon.stub(fa.http, 'post')
						.resolves({token: this.token, user: this.rawUser});
		var wsOpen = sinon.stub(fa.ws, 'open').resolves();

		fa.auth.login({}).then(function() {
			assert.ok(httpPost.calledOnce);
			assert.ok(wsOpen.calledOnce);

			assert.ok(fa.auth.hasPerm());
			assert.deepEqual(fa.auth.getUser(), user);
			assert.equal(fa.auth.getToken(), token);

			httpPost.restore(); wsOpen.restore();
			done();
		});
	});

	QUnit.test('restore', function(assert) {
		var done = assert.async();
		var user = this.user, token = this.token;

		var httpPost = sinon.stub(fa.http, 'post')
						.resolves({token: this.token, user: this.rawUser});
		var wsOpen = sinon.stub(fa.ws, 'open').resolves();

		fa.auth.login({}).then(function() {
			fa.auth.init();

			assert.ok(fa.auth.hasPerm());
			assert.deepEqual(fa.auth.getUser(), user);
			assert.equal(fa.auth.getToken(), token);

			httpPost.restore(); wsOpen.restore();
			done();
		});
	});
});
