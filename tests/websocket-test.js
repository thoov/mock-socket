var originalWebSocket;
var webSocketServer;

module('Mock Socks Tests', {
  setup: function() {
    webSocketServer = new WebSocketServer('ws://localhost:8080');
    webSocketServer.on('connection', function(server) {
      server.send('hello');
    });
  }
});

asyncTest('Connection with the server happens correctly', function() {
  var mockWebsockets = new MockSocket('ws://localhost:8080');

  expect(1);

  mockWebsockets.onopen = function() {
    ok(true, 'onopen fires as expected');
    start();
  };
});

asyncTest('On message with the server happens correctly', function() {
  var mockWebsockets = new MockSocket('ws://localhost:8080');

  expect(1);

  mockWebsockets.onmessage = function() {
    ok(true, 'onmessage fires as expected');
    start();
  };
});
