var mockServer;

module('Socket.io tests', {
  setup: function() {
    mockServer = new MockServer('ws://localhost:8080');
    mockServer.on('connection', function(server) {
      server.emit('crazyevent', 'hello');
    });
  }
});

asyncTest('On message with the server happens correctly', function() {
  var mockSocket = MockSocketIO('ws://localhost:8080');

  expect(2);

  mockSocket.on('crazyevent', function(eventData) {
    ok(true, 'on fires as expected');
    equal(eventData, 'hello', 'on function receives the correct message');
    start();
  });
});

asyncTest('Can initialise the socket with the connect method', function() {
  var mockSocket = MockSocketIO.connect('ws://localhost:8080');

  expect(2);

  mockSocket.on('crazyevent', function(eventData) {
    ok(true, 'on fires as expected');
    equal(eventData, 'hello', 'on function receives the correct message');
    start();
  });
});
