var storage = require('../lib/storage.js'),
	fs = require('fs');


exports['Should store the file path'] = function(test) {
	var filePath = '/tmp/some-file.txt';
	var key = storage.put(filePath);
	test.ok(key != null, "The key was null");
	test.done();
}
exports['Should retrieve the contents of a file by its key'] = function(test) {
	var filePath = 'spec/testdoc.txt';
	var key = storage.put(filePath);
	var fileContent = storage.get(key);
	test.ok(bufferEquals(fileContent, fs.readFileSync(filePath)), "File contents from storage not equal to original file");
	test.done();
}

function bufferEquals(b1, b2) {
	if(b1.length == b2.length) {
		for(i=0;i<b1.length;i++) {
			if(b1[i] != b2[i]) return false;
		}
		return true;
	}
	return false;
}