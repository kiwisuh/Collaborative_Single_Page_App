
var fs = require('fs'); //need to read static files
//Server Code
var http = require('http'); //need to http
var url = require('url');  //to parse url strings
var WebSocketServer = require('ws').Server; //provides web sockets
var ecStatic = require('ecstatic');  //provides static file server service
var counter = 1000; //to count invocations of function(req,res)
var ROOT_DIR = 'html'; //dir to serve static files from
var MIME_TYPES = {
  'css': 'text/css',
  'gif': 'image/gif',
  'htm': 'text/html',
  'html': 'text/html',
  'ico': 'image/x-icon',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'js': 'text/javascript', //should really be application/javascript
  'json': 'application/json',
  'png': 'image/png',
  'txt': 'text/plain'
};

var client = [];

var get_mime = function(filename) {
  var ext, type;
  for (ext in MIME_TYPES) {
    type = MIME_TYPES[ext];
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return type;
    }
  }
  return MIME_TYPES['txt'];
};

var server = http.createServer(function (request,response){
  var urlObj = url.parse(request.url, true, false);
  console.log('\n============================');
  console.log("PATHNAME: " + urlObj.pathname);
  console.log("REQUEST: " + ROOT_DIR + urlObj.pathname);
  console.log("METHOD: " + request.method);

  var receivedData = '';

  //attached event handlers to collect the message data
  request.on('data', function(chunk) {
    receivedData += chunk;
  });

  //event handler for the end of the message
  request.on('end', function(){
    console.log('received data: ', receivedData);
    console.log('type: ', typeof receivedData);

    //if it is a POST request then echo back the data.
    if(request.method == "POST"){
      var dataObj = JSON.parse(receivedData);
      console.log('received data object: ', dataObj);
      console.log('type: ', typeof dataObj);
      //Here we can decide how to process the data object and what
      //object to send back to client.
      //FOR NOW EITHER JUST PASS BACK AN OBJECT
      //WITH "text" PROPERTY
      if(typeof dataObj == 'number'){
        console.log("this should be a number: " + dataObj);
      }
      if (typeof dataObj == 'object') canvas = dataObj;
      //TO DO: return the words array that the client requested
      //if it exists

      console.log("USER REQUEST: " + dataObj.id);
      console.log(dataObj.x +', '+dataObj.y);

      var returnObj = JSON.stringify(dataObj);
      //object to return to client
      response.writeHead(200, {'Content-Type': MIME_TYPES["text"]});  //does not work with application/json MIME
      response.end(returnObj); //send just the JSON object
    }
  });

  if(request.method == "GET"){
    //handle GET requests as static file requests
    var filePath = ROOT_DIR + urlObj.pathname;
    if(urlObj.pathname === '/') filePath = ROOT_DIR + '/assignment2.html';

    fs.readFile(filePath, function(err,data){
      if(err){
        //report error to console
        console.log('ERROR: ' + JSON.stringify(err));
        //respond with not found 404 to client
        response.writeHead(404);
        response.end(JSON.stringify(err));
        return;
      }
      response.writeHead(200, {'Content-Type': get_mime(filePath)});
      response.end(data);
    });

  }
}).listen(3000);
var connections = [];
var connectionIDCounter = 0;

function addClient(name, color) {
  client.push({name: name, color: color});
}

var wss = new WebSocketServer({server: server});
wss.on('connection', function(ws) {
  console.log('Client connected');
  for (var i = 0; i < client.length; i++)
    broadcast(JSON.stringify(client[i]));
  ws.on('message', function(msg) {
    var person = JSON.parse(msg);
    if (person.name != null) {
      addClient(person.name, person.color);
    }
    // console.log('Message: ' + msg);
    broadcast(msg);
  });
});

function broadcast(msg) {
  wss.clients.forEach(function(client) {
    client.send(msg);
  });
}

console.log('Server Running at http://127.0.0.1:3000  CNTL-C to quit');
