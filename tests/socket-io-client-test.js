var mockServer;

module('Socket.io client tests', {
  setup: function() {
    mockServer = new MockServer('ws://localhost:3456');
    mockServer.on('connection', function(socket) {
      mockServer.emit('new connection', 'hello');
    });

    mockServer.on('happy days', function(socket, msg) {
      mockServer.emit('happy days', msg.data);
    });
  }
});

asyncTest('On message with the server happens correctly', function() {
  var mockSocket = MockSocketIO('ws://localhost:3456');

  expect(2);

  mockSocket.on('new connection', function(eventData) {
    ok(true, 'on fires as expected');
    equal(eventData, 'hello', 'on function receives the correct message');
    start();
  });
});

asyncTest('Can initialise the socket with the connect method', function() {
  var mockSocket = MockSocketIO.connect('ws://localhost:3456');

  expect(2);

  mockSocket.on('new connection', function(eventData) {
    ok(true, 'on fires as expected');
    equal(eventData, 'hello', 'on function receives the correct message');
    start();
  });
});

asyncTest('Can send data to the server', function() {
  var mockSocket = MockSocketIO.connect('ws://localhost:3456');
  expect(2);

  mockSocket.emit('happy days', 'Monday Tuesday');

  mockSocket.on('happy days', function(eventData) {
    ok(true, 'on fires as expected');
    equal(eventData, 'Monday Tuesday', 'on function receives the correct message');
    start();
  });
});
