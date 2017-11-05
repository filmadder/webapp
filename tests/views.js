QUnit.module('views', function(hooks) {
	hooks.beforeEach(function() {
		var key, html = '<main></main>';

		for(key in window.__html__) {
			if(window.__html__.hasOwnProperty(key)) {
				html += '<script id="'+ key +'">';
				html += window.__html__[key];
				html += '</script>';
			}
		}

		this.fixtureElem = document.getElementById('qunit-fixture');
		this.fixtureElem.innerHTML = html;

		this.mainElem = this.fixtureElem.querySelector('main');
	});

	QUnit.test('login', function(assert) {
		var done = assert.async();
		var mainElem = this.mainElem;

		fa.views.outer.login(mainElem).then(function(view) {
			assert.equal(view.title, 'login');
			assert.ok(mainElem.querySelector('input[name=email]'));
			assert.ok(mainElem.querySelector('input[name=pass]'));
			done();
		});
	});

	QUnit.test('reg', function(assert) {
		var done = assert.async();
		var mainElem = this.mainElem;

		fa.views.outer.reg(mainElem).then(function(view) {
			assert.equal(view.title, 'create account');
			assert.ok(mainElem.querySelector('input[name=email]'));
			assert.ok(mainElem.querySelector('input[name=name]'));
			assert.ok(mainElem.querySelector('input[name=pass1]'));
			assert.ok(mainElem.querySelector('input[name=pass2]'));
			done();
		});
	});

	QUnit.module('user', function(hooks) {
		hooks.beforeEach(function() {
			this.getUser = sinon.stub(fa.models.users, 'get');
		});

		hooks.afterEach(function(assert) {
			assert.ok(this.getUser.calledOnce);
			this.getUser.restore();
		});

		QUnit.test('user (unknown)', function(assert) {
			var done = assert.async();
			var mainElem = this.mainElem;

			this.getUser.resolves(fa.models.users.createProfile({
				user: {pk: 1, name: 'ghost', avatarUrl: ''},
				friendship_status: 'u',
			}));

			fa.views.user(mainElem).then(function(view) {
				assert.deepEqual(view.title, ['users', 'ghost']);

				assert.ok(mainElem.querySelector('[data-fn=request-friend]'));
				assert.notOk(mainElem.querySelector('[data-fn=accept-friend]'));
				assert.notOk(mainElem.querySelector('[data-fn=reject-friend]'));

				done();
			});
		});

		QUnit.test('user (asked viewer)', function(assert) {
			var done = assert.async();
			var mainElem = this.mainElem;

			this.getUser.resolves(fa.models.users.createProfile({
				user: {pk: 1, name: 'ghost', avatarUrl: ''},
				friendship_status: 'r',
			}));

			fa.views.user(mainElem).then(function(view) {
				assert.deepEqual(view.title, ['users', 'ghost']);

				assert.notOk(mainElem.querySelector('[data-fn=request-friend]'));
				assert.ok(mainElem.querySelector('[data-fn=accept-friend]'));
				assert.ok(mainElem.querySelector('[data-fn=reject-friend]'));

				done();
			});
		});

		QUnit.test('user (asked by viewer)', function(assert) {
			var done = assert.async();
			var mainElem = this.mainElem;

			this.getUser.resolves(fa.models.users.createProfile({
				user: {pk: 1, name: 'ghost', avatarUrl: ''},
				friendship_status: 'v',
			}));

			fa.views.user(mainElem).then(function(view) {
				assert.deepEqual(view.title, ['users', 'ghost']);

				assert.notOk(mainElem.querySelector('[data-fn=request-friend]'));
				assert.notOk(mainElem.querySelector('[data-fn=accept-friend]'));
				assert.notOk(mainElem.querySelector('[data-fn=reject-friend]'));

				done();
			});
		});

		QUnit.test('user (friend)', function(assert) {
			var done = assert.async();
			var mainElem = this.mainElem;

			this.getUser.resolves(fa.models.users.createProfile({
				user: {pk: 1, name: 'ghost', avatarUrl: ''},
				friendship_status: 'f',
			}));

			fa.views.user(mainElem).then(function(view) {
				assert.deepEqual(view.title, ['users', 'ghost']);

				assert.notOk(mainElem.querySelector('[data-fn=request-friend]'));
				assert.notOk(mainElem.querySelector('[data-fn=accept-friend]'));
				assert.notOk(mainElem.querySelector('[data-fn=reject-friend]'));

				done();
			});
		});

		QUnit.test('user (self)', function(assert) {
			var done = assert.async();
			var mainElem = this.mainElem;

			this.getUser.resolves(fa.models.users.createProfile({
				user: {pk: 1, name: 'ghost', avatarUrl: ''},
				friendship_status: 's',
			}));

			fa.views.user(mainElem).then(function(view) {
				assert.deepEqual(view.title, 'me');

				assert.notOk(mainElem.querySelector('[data-fn=request-friend]'));
				assert.notOk(mainElem.querySelector('[data-fn=accept-friend]'));
				assert.notOk(mainElem.querySelector('[data-fn=reject-friend]'));

				done();
			});
		});
	});
});
