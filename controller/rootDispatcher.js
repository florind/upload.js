var http = require('http'),	
						express = require('express'),				// http://expressjs.com
						formidable = require('formidable'),	// https://github.com/felixge/node-formidable
						form = require('connect-form'),			// http://visionmedia.github.com/connect-form
					  url = require('url'), path = require('path'), fs = require("fs"),
					 	storage = require('../lib/storage.js');

var superUploaderFile = fs.readFileSync('public/SuperUploader.html', 'utf-8');
//express.js initialization
var server = express.createServer(
	form({
		keepExtensions: true,
		uploadDir: './filestore'
	})
);
server.use(express.bodyParser());
exports.server = server;

//express.js dispatcher
server.get('/', function(req, res) {
  res.end(superUploaderFile, 'utf-8');	
});
server.post('/upload', function(req, res) {
	if(req.form) {	//the form was successfully ubmitted
		uploadFile(req, res);
	} else {				//return Bad Request otherwise
		sendResponse(res, 400, "Malformatted request data");
	}
});
server.get('/files/:fileId', function(req, res) {
	res.sendfile(storage.get(url.parse(req.url).pathname));
});
server.post('/attachment', function(req, res) {
	attachContent(req, res);
});

function uploadFile(req, res) {
  var link = '';
  req.form.on("file", function(name, file) {
    link = storage.put(file.path)
  });
  req.form.complete(function(err, fields, files) {
    res.writeHead(201, {
      'content-type' : 'text/plain',
      'Location' : link
    });
    res.end();
  });
}

function attachContent(req, res) {
   if(storage.get(req.body.fileLink) == null) {  //front door check if the resource doesn't already exist on the server
     sendResponse(res, 400, "Attached resource not found on the server.");
   } else {
    res.writeHead(201, {'Content-Type': 'text/html'});
    res.end("Success! Here's your file: " +
						"<a href='" + req.body.fileLink + "'>" + req.body.uploadfile + "</a>" +
						"<br/><br/><a href='/'>Upload some more</a>");
	}
}

function sendResponse(res, status, text) {
  res.writeHead(status, {'Content-Type': 'text/plain'});
  res.end(text);  
}
