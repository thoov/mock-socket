import QUnit from 'qunit';
import MockServer from './src/server';
import MockSocket from './src/websocket';

QUnit.module('Multiple clients test');

QUnit.test('that the onopen function will only be called once for each client', function(assert) {
  var socketUrl       = 'ws://localhost:8080';
  var webSocketServer = new MockServer(socketUrl);
  var socketA         = new MockSocket(socketUrl);
  var socketB         = new MockSocket(socketUrl);
  var done            = assert.async();
  assert.expect(4);

  debugger;

  // this should be called twice, once for both socketA and socketB
  webSocketServer.on('connection', function() {
    assert.ok(true, 'mock server on connection fires as expected');
  });

  socketA.onopen = function() {
    assert.ok(true, 'mocksocket onopen fires as expected');
  };

  socketB.onopen = function() {
    assert.ok(true, 'mocksocket onopen fires as expected');
    done();
  };
});

QUnit.test('mock clients will connect to the right mock server', function(assert) {
  var serverA = new MockServer('ws://localhost:8080');
  var serverB = new MockServer('ws://localhost:8081');

  var socketA = new MockSocket('ws://localhost:8080');
  var socketB = new MockSocket('ws://localhost:8080');
  var done    = assert.async();
  var counter = 0;

  assert.expect(4);

  // this should be called twice, once for both socketA and socketB
  serverA.on('connection', function() {
    assert.ok(true, 'mock server on connection fires as expected');
    counter++;
    if (counter === 2) {
      serverA.close();
      serverB.close();
      done();
    }
  });

  serverB.on('connection', function() {
    assert.ok(false, 'This should not be called');
  });

  socketA.onopen = function() {
    assert.ok(true, 'mocksocket onopen fires as expected');
  };

  socketB.onopen = function() {
    assert.ok(true, 'mocksocket onopen fires as expected');
  };
});

QUnit.test('mock clients onopen functions are fired only once', function(assert) {
  var socketURL  = 'ws://localhost:8080';
  var mockServer = new MockServer(socketURL);
  var socketA    = new MockSocket(socketURL);
  var done       = assert.async();

  assert.expect(2);

  socketA.onopen = function() {
    assert.ok(true, 'mocksocket onopen fires as expected');

    var socketB = new MockSocket(socketURL);
    socketB.onopen = function() {
      assert.ok(true, 'mocksocket onclose fires as expected');
      mockServer.close();
      done();
    };
  };
});

QUnit.test('mock clients can send message to the right mock server', function(assert) {
  var serverA = new MockServer('ws://localhost:8080');
  var serverB = new MockServer('ws://localhost:8081');
  var dataA   = 'foo';
  var dataB   = 'bar';
  var socketA = new MockSocket('ws://localhost:8080');
  var socketB = new MockSocket('ws://localhost:8081');
  var done    = assert.async();
  debugger;

  assert.expect(6);

  serverA.on('connection', function(server) {
    assert.ok(true, 'mock server on connection fires as expected');

    server.on('message', function(event) {
      assert.equal(event, dataA);
    });
  });

  serverB.on('connection', function(server) {
    assert.ok(true, 'mock server on connection fires as expected');

    server.on('message', function(event) {
      assert.equal(event, dataB);
      done();
    });
  });

  socketA.onopen = function() {
    assert.ok(true, 'mocksocket onopen fires as expected');
    this.send(dataA);
  };

  socketB.onopen = function() {
    assert.ok(true, 'mocksocket onopen fires as expected');
    this.send(dataB);
  };
});

QUnit.test('mock clients can send message to the right mock server', function(assert) {
  var semaphore  = 0;
  var mockServer = new MockServer('ws://localhost:8080');
  var socketA    = new MockSocket('ws://localhost:8080');
  var socketB    = new MockSocket('ws://localhost:8080');
  var done       = assert.async();

  assert.expect(2);

  mockServer.on('connection', function(server) {
    semaphore++;

    // Wait for both clients to connect then close the connection.
    if(semaphore === 2) {
      server.close();
    }
  });

  socketA.onclose = function() {
    assert.ok(true, 'mocksocket onclose fires as expected');
  };

  socketB.onclose = function() {
    assert.ok(true, 'mocksocket onclose fires as expected');
    done();
  };
});


QUnit.test('closing a client will only close itself and not other clients', function(assert) {
  var semaphore  = 0;
  var mockServer = new MockServer('ws://localhost:8080');
  var socketA    = new MockSocket('ws://localhost:8080');
  var socketB    = new MockSocket('ws://localhost:8080');
  var done       = assert.async();

  assert.expect(1);

  mockServer.on('connection', function(server) {
    semaphore++;

    // Wait for both clients to connect then send the message.
    if(semaphore === 2) {
      server.send('Closing socket B');
    }
  });

  socketA.onclose = function() {
    assert.ok(false, 'mocksocket should not close');
  };

  socketB.onmessage = function() {
    this.close();
  };

  socketB.onclose = function() {
    assert.ok(true, 'mocksocket onclose fires as expected');
    done();
  };
});
