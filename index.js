var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('something');
});


var express = require('express');
var app = express();

app.get('/', function(req, res) {
  res.sendFile('playground.html', {
    root: __dirname + '/helpers',
  });
});

app.use('/dist', express.static('dist'));

app.listen(7000);

console.log('Running ws on port 8080 and express at: http://localhost:7000');
