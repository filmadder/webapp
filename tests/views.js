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

		fa.views.outer.login(this.mainElem).then(function(view) {
			assert.equal(view.title, 'login');
			assert.ok(mainElem.querySelector('input[name=email]'));
			assert.ok(mainElem.querySelector('input[name=pass]'));
			done();
		});
	});

	QUnit.test('reg', function(assert) {
		var done = assert.async();
		var mainElem = this.mainElem;

		fa.views.outer.reg(this.mainElem).then(function(view) {
			assert.equal(view.title, 'create account');
			assert.ok(mainElem.querySelector('input[name=email]'));
			assert.ok(mainElem.querySelector('input[name=name]'));
			assert.ok(mainElem.querySelector('input[name=pass1]'));
			assert.ok(mainElem.querySelector('input[name=pass2]'));
			done();
		});
	});
});
