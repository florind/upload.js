var zombie = require('zombie'),
		sys = require('sys');
		
var browser = new zombie.Browser({debug: false})

exports['Page should properly render'] =function(test) {
	browser.runScripts = true;
	browser.visit("http://localhost:4010", function(err, browser, status) {
		if(err)	{
			console.log(err.message)
		}
		test.equal(err, null)
		test.equal(status, 200);
		test.equal(browser.text("title"), "SuperUpload");	
		test.equal(browser.document.getElementById("uploadForm").tagName.toUpperCase(), "FORM");
		test.ok(browser.document.querySelector(':input[name:comment]') != null);
		test.ok(browser.document.querySelector(':input[name:fileLink]') != null);
		test.ok(browser.document.querySelector(':input[name:fileupload]') != null);
		test.ok(browser.document.querySelector(':input[name:Save]') != null);
		test.done();
	});
}
