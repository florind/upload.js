var storage = require('../lib/storage.js'),
	fs = require('fs');


exports['Should store the file path'] = function(test) {
	var filePath = '/tmp/some-file.txt';
	var key = storage.put(filePath);
	test.ok(key != null, "The key was null");
	test.done();
}
exports['Should retrieve the local file path by its key'] = function(test) {
	var filePath = 'spec/testdoc.txt';
	var key = storage.put(filePath);
	var localPath = storage.get(key);
	test.equals(localPath, filePath);
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