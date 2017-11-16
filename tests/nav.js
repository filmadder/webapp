QUnit.module('nav', function(hooks) {
	hooks.beforeEach(function() {
		this.fixtureElem = document.getElementById('qunit-fixture');

		this.createLink = function(dataNav) {
			var elem = document.createElement('a');
			elem.setAttribute('data-nav', dataNav);
			this.fixtureElem.appendChild(elem);
			return elem;
		};
	});

	hooks.afterEach(function() {
		fa.nav.reset();
	});

	QUnit.test('reg with bad data-nav', function(assert) {
		var logError = sinon.stub(log, 'error');
		var badLink = this.createLink('bad');

		fa.nav.reg(badLink);
		assert.ok(logError.calledOnce);

		badLink.removeAttribute('data-nav');

		fa.nav.reg(badLink);
		assert.ok(logError.calledTwice);
	});

	QUnit.test('mark', function(assert) {
		var linkA = this.createLink('one:a');
		var linkB = this.createLink('one:b');
		var linkC = this.createLink('two:c');
		fa.nav.reg([linkA, linkB, linkC]);

		fa.nav.mark('one:a');
		assert.ok(linkA.classList.contains('selected'));
		assert.notOk(linkB.classList.contains('selected'));
		assert.notOk(linkC.classList.contains('selected'));

		fa.nav.mark('one:b');
		assert.notOk(linkA.classList.contains('selected'));
		assert.ok(linkB.classList.contains('selected'));
		assert.notOk(linkC.classList.contains('selected'));

		fa.nav.mark('two:c');
		assert.notOk(linkA.classList.contains('selected'));
		assert.ok(linkB.classList.contains('selected'));
		assert.ok(linkC.classList.contains('selected'));
	});

	QUnit.test('unmark', function(assert) {
		var linkA = this.createLink('one:a');
		fa.nav.reg(linkA);

		fa.nav.unmark('one:a');
		assert.notOk(linkA.classList.contains('selected'));

		fa.nav.mark('one:a');
		fa.nav.unmark('one:a');
		assert.notOk(linkA.classList.contains('selected'));

		fa.nav.mark('one:a');
		fa.nav.unmark('one');
		assert.notOk(linkA.classList.contains('selected'));
	});

	QUnit.test('mark and unmark, data-nav repeating', function(assert) {
		var linkB1 = this.createLink('one:b');
		var linkB2 = this.createLink('one:b');
		fa.nav.reg([linkB1, linkB2]);

		fa.nav.mark('one:b');
		assert.ok(linkB1.classList.contains('selected'));
		assert.ok(linkB2.classList.contains('selected'));

		fa.nav.unmark('one:b');
		assert.notOk(linkB1.classList.contains('selected'));
		assert.notOk(linkB2.classList.contains('selected'));
	});
});
