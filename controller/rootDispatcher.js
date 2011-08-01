var http = require('http'), sys = require('sys'),
	formidable = require('formidable'), 
	url = require('url'), path = require('path'), qs = require('querystring'),
	storage = require('../lib/storage.js'), fs = require("fs");

var superUploaderFile = fs.readFileSync('public/SuperUploader.html', 'utf-8');

var server = http.createServer(function(req, res) {
		var urlParts = url.parse(req.url);
		var pathname = urlParts.pathname;
		if(pathname == '/') {
			res.writeHead(200, {
				"Content-Type" : "text/html"
			});
			res.end(superUploaderFile);
		} else if(pathname == '/upload') {
			uploadFile(req, res);
		} else if(pathname.match(/\/files\/[\w.]*$/)) {	// matching /files/{fileId}
			serveFile(pathname, res);
		} else if(pathname == '/attachment' && req.method == 'POST') {
			attachContent(req, res);
		} else {
			res.writeHead(400);
			res.end('Error');
		}
	});
exports.server = server;

var uploadFile = function(req, res) {
	var form = new formidable.IncomingForm();
	form.uploadDir = './filestore';
	form.keepExtensions = true;
	var link = '';
	form.addListener("progress", function(bytesReceived, bytesExpected) {
		progress = (bytesReceived / bytesExpected * 100).toFixed(2);
		mb = (bytesExpected / 1024 / 1024).toFixed(1);
		sys.print("Uploading " + mb + "mb (" + progress + "%)\015");
	});
	form.addListener("file", function(name, file) {
		link = storage.put(file.path)
	});
	form.addListener("end", function() {
		sys.print('Upload Complete\n');
		res.writeHead(201, {
			'content-type' : 'text/plain',
			'Location' : link
		});
		res.end();
	});

	try {
		form.parse(req, function(err, fields, files) {
			if(err) {
				res.writeHead(400, {'content-type' : 'text/plain'});
				res.end("An error occured.");
			}
		});	
	} catch (err) {
		res.writeHead(400, {'content-type' : 'text/plain'});
		res.end("Malformatted request data.");
	}
}

var serveFile = function(pathname, res) {
	if(storage.get(pathname) == null) {
		res.writeHead(404, {'Content-Type': 'text/plain'});
		res.end('File not found.');		
	} else {
		fs.readFile(storage.get(pathname), function(err, data) {
			if (err) {
				console.log(err);
				res.writeHead(404, {'Content-Type': 'text/plain'});
				res.end('File not found.');
			}
			res.writeHead(200, {'content-type' : 'application/binary'});
			res.end(data);
		});
	}
}

var attachContent = function(req, res) {
	var fullBody = '';
	try {
	    req.on('data', function(chunk) {
			fullBody += chunk;
	    });
		req.on('end', function() {
			var posted = qs.parse(fullBody);
			if(storage.get(posted.fileLink) == null) {
				res.writeHead(400, {'Content-Type': 'text/html'});
				res.end("Attached resource not found on the server.")
			}
			res.writeHead(201, {'Content-Type': 'text/html'});
			res.end("Success! Here's your file: <a href='" + posted.fileLink + "'>" + 
			posted.uploadfile + "</a><br/><br/><a href='/'>Upload some more</a>");
	    });
	} catch (err) {
		console.log("Error on posting attachment: " + err);
		res.writeHead(400, {'content-type' : 'text/plain'});
		res.end("Malformatted request data.");
		return;
	}
}

//TODO: uncomment when we figure how to unit test using mock req/responses
//exports.attachContent = attachContent;
//exports.serveFile = serveFile;
//exports.uploadFile = uploadFile;
