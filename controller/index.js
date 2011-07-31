var http = require('http'), sys = require('sys'),
	formidable = require('formidable'), 
	url = require('url'), path = require('path'), qs = require('querystring'),
	storage = require('../lib/storage.js'), fs = require("fs");

var superUploaderFile;

fs.readFile('public/SuperUploader.html', function(err, data) {
	if (err) {
		throw err;
	}
	superUploaderFile = data;
});

exports.server = http.createServer(function(req, res) {
	var urlParts = url.parse(req.url);
	var pathname = urlParts.pathname;
	if(pathname == '/') {
		res.writeHead(200, {
			"Content-Type" : "text/html"
		});
		res.end(superUploaderFile);
	} else if(pathname == '/upload') {
			var form = new formidable.IncomingForm();
			form.uploadDir = './filestore';
			form.keepExtensions = true;
			var link;
			form.addListener("progress", function(bytesReceived, bytesExpected) {
				progress = (bytesReceived / bytesExpected * 100).toFixed(2);
				mb = (bytesExpected / 1024 / 1024).toFixed(1);
				sys.print("Uploading " + mb + "mb (" + progress + "%)\015");
			});
			form.addListener("file", function(name, file) {
				link = storage.put(file.path)
			});

			form.parse(req, function(err, fields, files) {
				if(err) {
					console.log(err);
					res.writeHead(500, {'content-type' : 'text/plain'});
					res.end("Internal error");
				} else {
					sys.print('Upload Complete\n');
					res.writeHead(201, {
						'content-type' : 'text/plain'
					});
					res.end(link);
				}
			});
	} else if(pathname.match(/\/files\/[\w.]*$/)) {	// matching /files/{fileId}
		fs.readFile(storage.get(pathname), function(err, data) {
			if (err) {
				console.log(err);
				res.writeHead(404, {'Content-Type': 'text/plain'});
				res.end('File not found.');
			}
			res.writeHead(200, {'content-type' : 'application/binary'});
			res.end(data);
		});
	} else if(pathname == '/attachment' && req.method == 'POST') {
		var fullBody = '';
	    req.on('data', function(chunk) {
			fullBody += chunk;
	    });
		req.on('end', function() {
			var posted = qs.parse(fullBody);
			res.writeHead(201, {'Content-Type': 'text/html'});
			res.end("Success! Here's your file: <a href='" + posted.fileLink + "'>" + posted.uploadfile + "</a>");
	    });
	} else {
		res.writeHead(400);
		res.end('Error');
	}
}).listen(4010);

