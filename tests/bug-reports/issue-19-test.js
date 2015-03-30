module('Issue #19: Mock Server on(message) argument should be a string and not an object.');

asyncTest('Mock Server on(message) argument should be a string and not an object.', function() {
  var socketUrl             = 'ws://localhost:8080';
  var mockServer            = new MockServer(socketUrl);
  var mockSocket            = new MockSocket(socketUrl);

  expect(1);

  mockServer.on('connection', function (socket) {
      socket.on('message', function (message) {
          equal(typeof message, 'string', 'message should be a string and not an object');
          start();
      });
  });

  mockSocket.onopen = function () {
      mockSocket.send('1');
  };
});
