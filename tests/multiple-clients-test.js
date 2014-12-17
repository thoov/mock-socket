module('Multiple clients test');

asyncTest('that the onopen function will only be called once for each client', function() {
  var socketUrl       = 'ws://localhost:8080';
  var webSocketServer = new MockServer(socketUrl);
  var socketA         = new MockSocket(socketUrl);
  var socketB         = new MockSocket(socketUrl);

  expect(4);

  // this should be called twice, once for both socketA and socketB
  webSocketServer.on('connection', function() {
    ok(true, 'mock server on connection fires as expected');
  });

  socketA.onopen = function() {
    ok(true, 'mocksocket onopen fires as expected');
  };

  socketB.onopen = function() {
    ok(true, 'mocksocket onopen fires as expected');
    start();
  };
});

asyncTest('mock clients will connect to the right mock server', function() {
  var serverA = new MockServer('ws://localhost:8080');
  var serverB = new MockServer('ws://localhost:8081');

  var socketA = new MockSocket('ws://localhost:8080');
  var socketB = new MockSocket('ws://localhost:8080');

  expect(4);

  // this should be called twice, once for both socketA and socketB
  serverA.on('connection', function() {
    ok(true, 'mock server on connection fires as expected');
  });

  serverB.on('connection', function() {
    ok(false, 'This should not be called');
  });

  socketA.onopen = function() {
    ok(true, 'mocksocket onopen fires as expected');
  };

  socketB.onopen = function() {
    ok(true, 'mocksocket onopen fires as expected');
    start();
  };
});

asyncTest('mock clients can send message to the right mock server', function() {
  var serverA = new MockServer('ws://localhost:8080');
  var serverB = new MockServer('ws://localhost:8081');
  var dataA   = 'foo';
  var dataB   = 'bar';
  var socketA = new MockSocket('ws://localhost:8080');
  var socketB = new MockSocket('ws://localhost:8081');

  expect(6);

  serverA.on('connection', function(server) {
    ok(true, 'mock server on connection fires as expected');

    server.on('message', function(event) {
      equal(event.data, dataA);
    });
  });

  serverB.on('connection', function(server) {
    ok(true, 'mock server on connection fires as expected');

    server.on('message', function(event) {
      equal(event.data, dataB);
      start();
    });
  });

  socketA.onopen = function() {
    ok(true, 'mocksocket onopen fires as expected');
    this.send(dataA);
  };

  socketB.onopen = function() {
    ok(true, 'mocksocket onopen fires as expected');
    this.send(dataB);
  };
});


asyncTest('mock clients can send message to the right mock server', function() {
  var semaphore  = 0;
  var mockServer = new MockServer('ws://localhost:8080');
  var socketA    = new MockSocket('ws://localhost:8080');
  var socketB    = new MockSocket('ws://localhost:8080');

  expect(2);

  mockServer.on('connection', function(server) {
    semaphore++;

    // Wait for both clients to connect then close the connection.
    if(semaphore === 2) {
      server.close();
    }
  });

  socketA.onclose = function() {
    ok(true, 'mocksocket onclose fires as expected');
  };

  socketB.onclose = function() {
    ok(true, 'mocksocket onclose fires as expected');
    start();
  };
});
