var http = require('http'),
  server = require('../controller/rootDispatcher.js').server,
  fs = require('fs');

var testFilePath = './spec/testdoc.txt';
var fname = testFilePath.split('/');
fname = fname[fname.length-1];

var serverPort = 40101;
server.listen(serverPort);

var client = http.createClient(serverPort, 'localhost');

exports['GET nonexistent file should return 404 Not Found'] =function(test) {
  var req = client.request('GET', '/files/nothing');
  req.on('response', function(res) {
    res.on('end', function() {
      test.equal(res.statusCode, 404);

      cleanup();
      test.done();
    });
  });
  req.end();
}

exports['POST a file should return 201 Created and a valid link to the newly created resource'] = function(test) {
  var postData = createPostData(testFilePath);
  var req = client.request('POST', '/upload', postData['headers']);
  var resourceLink = '';

  req.on('response', function(res) {
    res.on('end', function() {
      test.equal(res.statusCode, 201);
      resourceLink = res.headers["location"];
      test.ok(resourceLink.indexOf('files') >= 0);
      
      var getFileReq = client.request('GET', resourceLink);
      getFileReq.on('response', function(getFileRes) {
        getFileRes.on('end', function() {
          test.equal(getFileRes.statusCode, 200);

          cleanup();
          test.done();
        });
      });
      getFileReq.end();
    });
  });
  req.write(postData['payload']);
  req.end();
}

exports['POST a corrupt data should return 400 '] = function(test) {
  
  //Post null headers. This should force an error on the server.
  var req = client.request('POST', '/upload', null);
  req.on('response', function(res) {
    var resourceLink = '';
    res.on('end', function() {
      test.equal(res.statusCode, 400);

      cleanup();
      test.done();
    });
  });
  req.write("corrupt payload");
  req.end();
}

exports['POST an attachment link and comment should return 201 Created and the response should contain the path to that attachment'] =
    function(test) {
  var postData = createPostData(testFilePath);
  var uploadReq = client.request('POST', '/upload', postData['headers']);
  var resourceLink = '';

  uploadReq.on('response', function(uploadRes) {
    uploadRes.on('end', function() {
      test.equal(uploadRes.statusCode, 201);
      resourceLink = uploadRes.headers["location"];
      //now post the link and comment to the server.
      var postAttachment = "fileLink=" + resourceLink + "&uploadfile=" + fname + "&comment=awesome-comment";
      var headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": postAttachment.length
      };
      var attachReq = client.request('POST', '/attachment', headers);
      attachReq.on('response', function(attachRes) {
        var attachResponseData = '';
        attachRes.on('data', function(chunk) {
          attachResponseData += chunk;
        });
        attachRes.on('end', function() {
          test.equal(attachRes.statusCode, 201);
          test.ok(attachResponseData.indexOf(resourceLink) > 0);

          cleanup();
          test.done();
        });
      });
      attachReq.write(postAttachment);
      attachReq.end();
    });
  });
  uploadReq.write(postData['payload']);
  uploadReq.end();  
}

exports['POST a non-existent attachment should return 400 Bad Request'] = function(test) {
  var postAttachment = "fileLink=nowhere&uploadfile=someFileName&comment=awesome-comment";
  var headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "Content-Length": postAttachment.length
    
  };
  var attachReq = client.request('POST', '/attachment', headers);
  attachReq.on('response', function(attachRes) {
    var attachResponseData = '';
    attachRes.on('data', function(chunk) {
      attachResponseData += chunk;
    });
    attachRes.on('end', function() {
      test.equal(attachRes.statusCode, 400);

      cleanup();
      test.done();
    });
  });
  attachReq.write(postAttachment);
  attachReq.end();
}

//Compiles the file upload payload and headers to be POSTed to the server. 
//Returns a two element map keyed by 'payload' and 'headers'.
function createPostData(filePath) {
  var fileContents = fs.readFileSync(filePath, 'utf-8');
  var boundary = "AJAX-----" + (new Date).getTime();
  
  var CRLF = "\r\n";
  var payload = "--" + boundary + CRLF;
  payload += 'Content-Disposition: attachment; name="file"; filename="' + fname + '";' + CRLF ;
  payload += 'Content-Type: application/octet-stream' + CRLF + CRLF;
  payload += fileContents + CRLF;
  payload += CRLF + "--" + boundary + "--" + CRLF;
  var headers = {
      'Content-Type': "multipart/form-data; boundary=" + boundary,
    'Content-Length': payload.length
  };  
  //return a convenience object containing both headers and payload. We'll form the request using these.
  return {
    'payload': payload,
    'headers': headers
  };
}



var globalTestCount = 5;  //total number of tests.
var currentExecutedTestCount = 0;
/*
This method increments the number of executed tests
Call cleanup() after test.done.
shutdown the server if all tests have executed.
*/
function cleanup() {
  currentExecutedTestCount++;
  if(currentExecutedTestCount == globalTestCount) {
    server.close();
  }
}
