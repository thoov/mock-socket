var originalWebSocket;
var webSocketServer;

module('Mock Socks Tests', {
  setup: function() {
    originalWebSocket = window.WebSocket;
    window.WebSocket = window.MockSocket;

    webSocketServer = new WebSocketServer('ws://localhost:8080');
    webSocketServer.on('connection', function(server) {
      server.send('hello');
    });
  },

  teardown: function() {
    window.WebSocket = originalWebSocket;
  }
});


asyncTest('Connection with the server happens correctly', function() {
  var mockWebsockets = new WebSocket('ws://localhost:8080');

  mockWebsockets.onopen = function() {
    ok(true, 'onopen fires as expected');
    start();
  };
});

asyncTest('On message with the server happens correctly', function() {
  var mockWebsockets = new WebSocket('ws://localhost:8080');

  mockWebsockets.onmessage = function() {
    ok(true, 'onmessage fires as expected');
    start();
  };
});
