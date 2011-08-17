var http = require('http'), formidable = require('formidable'), 
  url = require('url'), path = require('path'), qs = require('querystring'),
  storage = require('../lib/storage.js'), fs = require("fs"), sys=require('sys');

var superUploaderFile = fs.readFileSync('public/SuperUploader.html', 'utf-8');

var server = http.createServer(function(req, res) {
  var pathname = url.parse(req.url).pathname;
  if(pathname == '/' && req.method == 'GET') {
    res.writeHead(200, {'content-type' : 'text/html'});
    res.end(superUploaderFile, 'utf-8');
  } else if(pathname == '/upload' && req.method == 'POST') {
    uploadFile(req, res);
  } else if(pathname.match(/\/files\/[\w.]*$/) && req.method == 'GET') {  // path matching /files/{fileId}
    serveFile(pathname, res);
  } else if(pathname == '/attachment' && req.method == 'POST') {
    attachContent(req, res);
  } else {
    sendResponse(res, 400, "Bad Request");
  }
});
exports.server = server;

function uploadFile(req, res) {
  var form = new formidable.IncomingForm();
  form.uploadDir = './filestore';
  var link = '';
  form.addListener("file", function(name, file) {
    link = storage.put(file.path)
  });
  form.addListener('error', function() {
    sendResponse(res, 400, "Malformatted request data");
  });
  form.parse(req, function(err, fields, files) {
    res.writeHead(201, {
      'content-type' : 'text/plain',
      'Location' : link
    });
    res.end();
  });
}

function serveFile(pathname, res) {
  if(storage.get(pathname) == null) {
    sendResponse(res, 404, 'File not found.');    
  } else {
    fs.readFile(storage.get(pathname), function(err, data) {
      if (err) sendResponse(res, 500, 'Internal Server Error');
      res.writeHead(200, {'content-type' : 'application/binary'});
      res.end(data);
    });
  }
}

function attachContent(req, res) {
  var fullBody = '';
    req.on('data', function(chunk) {
    fullBody += chunk;
    });
  req.on('end', function() {
    var posted = qs.parse(fullBody);
    if(storage.get(posted.fileLink) == null) {  //front door check if the resource doesn't exist on the server
      sendResponse(res, 400, "Attached resource not found on the server.");
    }
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end("Success! Here's your file: <a href='" + posted.fileLink + "'>" + 
    posted.uploadfile + "</a><br/><br/><a href='/'>Upload some more</a>");
  });
}

function sendResponse(res, status, text) {
  res.writeHead(status, {'Content-Type': 'text/plain'});
  res.end(text);  
}
