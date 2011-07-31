var zombie = require('zombie'),
		sys = require('sys');
		
var browser = new zombie.Browser({debug: true})

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
		test.ok(browser.document.querySelector(':input[name:Save]') != null);
		test.done();
	});
}

exports['While uploading, the percentage complete is visible on the page.'] = function(test) {
  browser.visit("http://localhost:4010", function(err, browser, status) {
		browser.attach("input#uploadfile", "/Users/florin/detail.html");
		browser.document.upload();
//		sys.puts(sys.inspect(browser.evaluate("$('#uploadfile')")));
//		browser.evaluate("$('#uploadfile').val('/Users/florin/detail.html').change()");
//		browser.document.getElementById('uploadfile').onchange();
//		browser.fire('change', browser.document.getElementById('uploadfile'), callback); 
		browser.wait(this.callback);
		var statusVal = browser.document.getElementById("uploadStatus").innerHTML;
		test.ok(statusVal.indexOf('%') > 0, "Fail, got " + statusVal);
		test.done();
	});
};



function callback() {
	sys.puts('lalala')
}	
