var zombie = require('zombie'),
		assert = require('assert'),
		testCase = require('nodeunit').testCase;

exports['Page should properly render'] =function(test) {
	var browser = new zombie.Browser({debug: true})
	browser.visit("http://localhost:4010", function(err, browser, status) {
		test.equal(err, null)
		test.equal(status, 200);
		test.equal(browser.text("title"), "SuperUpload");	
		test.done();
	});
};
	
