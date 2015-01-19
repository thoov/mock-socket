var mockServer;

module('Mock Socket Tests', {
  setup: function() {
    mockServer = new MockServer('ws://localhost:8080');
    mockServer.on('connection', function(server) {
      server.send('hello');
    });
  }
});

asyncTest('Connection with the server happens correctly', function() {
  var mockSocket = new MockSocket('ws://localhost:8080');

  expect(1);

  mockSocket.onopen = function() {
    ok(true, 'onopen fires as expected');
    start();
  };
});

asyncTest('On message with the server happens correctly', function() {
  var mockSocket = new MockSocket('ws://localhost:8080');

  expect(1);

  mockSocket.onmessage = function() {
    ok(true, 'onmessage fires as expected');
    start();
  };
});

asyncTest('Connection with the server with query params happens correctly', function() {
  var mockSocket = new MockSocket('ws://localhost:8080?param1=2&param2=1');

  expect(1);

  mockSocket.onopen = function() {
    ok(true, 'onopen fires as expected');
    start();
  };
});
