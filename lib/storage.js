/*
Maintains a map keyed by the file URL resource. The value is the local file system path.
Note that the logic that sores and serves the files is not encapsulated here (bad, subject to a future refactoring) and currently
is coded in the controller/rootDispatcher.js where there's direct access to the request/response streams.
*/

var sys = require('sys'),
	fs = require('fs');

var store = {};
/*Stores a local file path and returns a unique resource prefixed by /files/
TODO: externalize the file prefix, it is also used in controller/rootDispatcher.js!
*/
module.exports.put = function(localPath) {
	//get the file name
	var fileParts = localPath.split('/');
	var key = "/files/" + fileParts[fileParts.length-1];
	store[key] = localPath;
	return key;
};

module.exports.get = function(key) {
	return store[key];
};
