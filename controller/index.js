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
		case '/uploadfile':
req.setBodyEncoding('binary');

  var stream = new multipart.Stream(req);
  stream.addListener('part', function(part) {
    part.addListener('body', function(chunk) {
      var progress = (stream.bytesReceived / stream.bytesTotal * 100).toFixed(2);
      var mb = (stream.bytesTotal / 1024 / 1024).toFixed(1);

      sys.print("Uploading "+mb+"mb ("+progress+"%)\015");

      // chunk could be appended to a file if the uploaded file needs to be saved
    });
  });
  stream.addListener('complete', function() {
    res.sendHeader(200, {'Content-Type': 'text/plain'});
    res.sendBody('Thanks for playing!');
    res.finish();
    sys.puts("\n=> Done");
  });
		default:
				res.writeHead(400);
				res.end('Error');
 
	}
}).listen(4010);
