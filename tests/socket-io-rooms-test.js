var mockServer;

module('Socket.io rooms tests', {
  setup: function() {
    mockServer = new MockServer('ws://localhost:34567');
  }
});

asyncTest('Can join rooms with the server', function() {
  mockServer.on('connection', function(socket) {
    mockServer.join('green room');
  });

  mockServer.on('say it to the room', function(socket, msg) {
    mockServer.to('green room').emit('chat message', msg.data);
  });

  var mockSocket = MockSocketIO('ws://localhost:34567');

  expect(2);

  mockSocket.on('chat message', function(eventData) {
    ok(true, 'on fires as expected');
    equal(eventData, 'hello', 'on function receives the correct message');
    start();
  });

  mockSocket.emit('say it to the room', 'hello');
});

test('Can leave rooms', function() {
  expect(2);
  mockServer.join('my room');
  deepEqual(mockServer.rooms, {'my room': true});
  mockServer.leave('my room');
  deepEqual(mockServer.rooms, {});
});
