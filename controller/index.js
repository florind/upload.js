var http = require('http'),
	multipart = require('../lib/multipart'),
	sys = require('sys'),
	url = require('url'),
	path = require('path'),
	fs = require("fs");
	var superUploaderFile;

fs.readFile('./public/SuperUploader.html', function (err, data) {
    if (err) {
        throw err; 
    }
    superUploaderFile = data;
});

exports.server = http.createServer(function(req, res) {
	var urlParts = url.parse(req.url);
	switch(urlParts.pathname) {
		case '/':
			res.writeHead(200, {"Content-Type": "text/html"});
			res.end(superUploaderFile);
			break;
		default:
				res.writeHead(400);
				res.end('Error');
 
	}
}).listen(4010);
