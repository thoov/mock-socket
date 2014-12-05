module('Mocksocket onopen tests');

asyncTest('that the mocksocket onopen function is called after mocksocket object is created', function() {
  var mockWebsockets;
  var socketUrl       = 'ws://localhost:8080';
  var webSocketServer = new WebSocketServer(socketUrl);
  mockWebsockets = new MockSocket(socketUrl);

  expect(3);

  mockWebsockets.onopen = function(event) {
    ok(true, 'mocksocket onopen fires as expected');
    equal(this.readyState, MockSocket.OPEN, 'the readystate is correct set to open');
    equal(event.currentTarget.url, urlTransform(socketUrl), 'onopen function receives a valid event obejct');
    start();
  };
});


asyncTest('that the mock server connection function is called after mocksocket object is created', function() {
  var mockWebsockets;
  var socketUrl       = 'ws://localhost:8080';
  var webSocketServer = new WebSocketServer(socketUrl);
  mockWebsockets = new MockSocket(socketUrl);

  expect(1);

  webSocketServer.on('connection', function() {
    ok(true, 'mock server on connection fires as expected');
    start();
  });
});
