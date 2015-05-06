var socketUrl = 'ws://localhost';
var mockSocket;
var mockServer;

module('MockSocket inherits EventTarget', {
  setup: function() {
    mockServer = new MockServer(socketUrl);
    mockServer.on('close', function() {
      start();
    });
    mockSocket = new MockSocket(socketUrl);
  }
});

asyncTest('has all the required methods', function() {
  expect(3);
  ok(mockSocket.addEventListener);
  ok(mockSocket.removeEventListener);
  ok(mockSocket.dispatchEvent);
  mockServer.close();
});

asyncTest('adding/removing "message" event listeners works', function() {
  var eventMessage = socketEventMessage('message', 'testing', socketUrl);
  var fired = 0;
  var handler1 = function(event) {
    fired++;
  };
  var handler2 = function(event) {
    fired++;
  };

  expect(3);

  mockSocket.addEventListener('message', handler1);
  mockSocket.addEventListener('message', handler2);
  mockSocket.dispatchEvent(eventMessage);
  equal(fired, 2, '2 handlers should be executed');

  fired = 0;
  mockSocket.removeEventListener('message', handler1);
  mockSocket.dispatchEvent(eventMessage);
  equal(fired, 1, 'only 1 handler should be executed');

  fired = 0;
  mockSocket.removeEventListener('message', handler2);
  mockSocket.dispatchEvent(eventMessage);
  equal(fired, 0, 'no handlers should be executed');

  mockServer.close();
});
