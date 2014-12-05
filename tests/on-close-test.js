module('Mocksocket onclose test');

asyncTest('that the mocksocket onclose function is called after closing mocksocket', function() {
  var mockWebsockets;
  var socketUrl       = 'ws://localhost:8080';
  var webSocketServer = new WebSocketServer(socketUrl);
  mockWebsockets = new MockSocket(socketUrl);

  expect(4);

  webSocketServer.on('close', function() {
    ok(true, 'mock server on close fires as expected');
  });

  mockWebsockets.onclose = function(event) {
    ok(true, 'mocksocket onclose fires as expected');
    equal(this.readyState, MockSocket.CLOSED, 'the readystate is correct to closed');
    equal(event.currentTarget.url, urlTransform(socketUrl), 'onclose function receives a valid event obejct');

    // TODO: add more checks to validate the event object
    start();
  };

  mockWebsockets.close();
});

asyncTest('that the mocksocket onclose function is called after closing the mockserver', function() {
  var mockWebsockets;
  var socketUrl       = 'ws://localhost:8080';
  var webSocketServer = new WebSocketServer(socketUrl);
  mockWebsockets = new MockSocket(socketUrl);

  expect(4);

  webSocketServer.on('close', function() {
    ok(true, 'mock server on close fires as expected');
  });

  mockWebsockets.onclose = function(event) {
    ok(true, 'onclose fires as expected');
    equal(this.readyState, MockSocket.CLOSED, 'the readystate is correct to closed');
    equal(event.currentTarget.url, urlTransform(socketUrl), 'onclose function receives a valid event obejct');

    // TODO: add more checks to validate the event object
    start();
  };

  webSocketServer.close();
});
