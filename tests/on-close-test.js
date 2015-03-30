module('Mocksocket onclose test');

asyncTest('that the mocksocket onclose function is called after closing mocksocket', function() {
  var socketUrl  = 'ws://localhost:8080';
  var mockServer = new MockServer(socketUrl);
  var mockSocket = new MockSocket(socketUrl);

  expect(4);

  mockServer.on('close', function() {
    ok(true, 'mock server on close fires as expected');
  });

  mockSocket.onclose = function(event) {
    ok(true, 'mocksocket onclose fires as expected');
    equal(this.readyState, MockSocket.CLOSING, 'the readystate is correct to closed');
    equal(event.currentTarget.url, urlTransform(socketUrl), 'onclose function receives a valid event obejct');

    // TODO: add more checks to validate the event object
    start();
  };

  mockServer.close();
});

asyncTest('that the mocksocket onclose function is called after closing the mockserver', function() {
  var socketUrl  = 'ws://localhost:8080';
  var mockServer = new MockServer(socketUrl);
  var mockSocket = new MockSocket(socketUrl);

  expect(4);

  mockServer.on('close', function() {
    ok(true, 'mock server on close fires as expected');
  });

  mockSocket.onclose = function(event) {
    ok(true, 'onclose fires as expected');
    equal(this.readyState, MockSocket.CLOSING, 'the readystate is correct to closed');
    equal(event.currentTarget.url, urlTransform(socketUrl), 'onclose function receives a valid event obejct');

    // TODO: add more checks to validate the event object
    start();
  };

  mockServer.close();
});

asyncTest('that closing a mock socket will only call the mock servers onclose callback once', function() {
  var socketUrl  = 'ws://localhost:8080';
  var mockServer = new MockServer(socketUrl);
  var mockSocket = new MockSocket(socketUrl);

  expect(1);

  mockServer.on('close', function() {
    ok(true, 'mock server on close fires as expected');
  });

  mockSocket.close();
  mockSocket.close();

  setTimeout(function() {
    start();
  }, 100);
});
