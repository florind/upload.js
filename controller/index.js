var port = process.env.PORT || 8099;
console.log("Running on port: " + port);
require('./rootDispatcher.js').server.listen(port);
