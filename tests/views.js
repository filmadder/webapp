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

	QUnit.test('user', function(assert) {
		var done = assert.async();
		var mainElem = this.mainElem;
		var getUser = sinon.stub(fa.models.users, 'get').resolves({
			pk: 1, name: 'ghost', avatarUrl: '',
			status: {
				unknown: true, waiting: false, asked: false,
				friend: false, self: false
			}
		});

		fa.views.user(mainElem).then(function(view) {
			assert.deepEqual(view.title, ['users', 'ghost']);
			done();
		});
	});
});
