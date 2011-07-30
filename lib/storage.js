var sys = require('sys'),
	fs = require('fs');

var store = {}
module.exports.put = function(localPath) {
	//get the file name
	var fileParts = localPath.split('/');
	var key = fileParts[fileParts.length-1];
	store[key] = localPath;
	return key;
}

module.exports.get = function(key) {
	return fs.readFileSync(store[key]);
}