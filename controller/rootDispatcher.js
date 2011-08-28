var http = require('http'), express = require('express'), form = require('connect-form'),
// node-formidable module for expressjs
// http://visionmedia.github.com/connect-form
url = require('url'), path = require('path'), fs = require("fs"), jade = require('jade'), storage = require('../lib/storage.js');

var superUploaderFile;

jade.renderFile('public/SuperUploader.jade', function(err, html) {
	superUploaderFile = html;
});

var server = express.createServer(form({
	keepExtensions : true,
	uploadDir : 'filestore'
}));
server.use(express.bodyParser());
exports.server = server;

// request router
server.get('/', function(req, res) {
	res.send(superUploaderFile);
});

server.post('/upload', function(req, res) {
	if (req.form) { // the form was successfully submitted
		uploadFile(req, res);
	} else { // otherwise return Bad Request
		res.send('Malformatted request data', {
			'Content-Type' : 'text/plain'
		}, 400);
	}
});

server.get('/files/:fileId', function(req, res) {
  var file = storage.get(url.parse(req.url).pathname);
  if(file == null) {
    res.send('File not found.', {
      'Content-Type' : 'text/plain'
    }, 404);    
  } else {
    res.sendfile(file);
  }
});

server.post('/attachment', function(req, res) {
	attachContent(req, res);
});

function uploadFile(req, res) {
	var link = '';
	req.form.on("file", function(name, file) {
		link = storage.put(file.path);
	});
	req.form.complete(function(err, fields, files) {
		res.send('Success!', {
			'Content-Type' : 'text/plain',
			'Location' : link
		}, 201);
	});
}

function attachContent(req, res) {
	if (storage.get(req.body.fileLink) == null) { //front door check if the resource doesn't already exist on the server
		res.send('Attached resource not found on the server.', {
			'Content-Type' : 'text/plain'
		}, 400);
	} else {
		jade.renderFile("public/UploadSuccess.jade", {
			locals : {
				fileLink : req.body.fileLink,
				fileName : req.body.uploadfile
			}
		}, function(err, html) {
			res.send(html, {
				'Content-Type' : 'text/html'
			}, 200);
		});
	}
}