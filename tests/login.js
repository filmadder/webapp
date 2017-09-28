module.exports = {
	firstTest: function(browser) {
		browser
			.url(browser.launchUrl)
			.waitForElementVisible('body', 1000)
			.end();
	}
};
