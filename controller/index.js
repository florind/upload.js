var http = require('http'), 
	formidable = require('formidable'), 
	sys = require('sys'), 
	url = require('url'), 
	path = require('path'), 
	storage = require('../lib/storage.js'),
	fs = require("fs");
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
			link = "/files/" + storage.put(file.path)
		});
		
		form.parse(req, function(err, fields, files) {
			sys.print('Upload Complete\n');
			res.writeHead(201, {
				'content-type' : 'text/plain'
			});
			res.end(link);
		});
	} else if(pathname.match(/\/files\/[\w.]*$/)) {	// matching /files/{fileId}
		try {
			var fileContent = storage.get(pathname.split('/')[2]);
			res.writeHead(200, {'content-type' : 'application/binary'});
			res.end(fileContent, 'utf-8');
		} catch (err) {
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.end('File not found.');
		}
	} else if(pathname == '/attachment') {
		sys.puts(sys.inspect(req.body));
		res.end('Ja')
	} else {
		res.writeHead(400);
		res.end('Error');
	}
}).listen(4010);

