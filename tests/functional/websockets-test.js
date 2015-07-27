import QUnit from 'qunit';
import Server from '../src/server';
import WebSocket from '../src/websocket';
import networkBridge from '../src/network-bridge';

QUnit.module('Functional - WebSockets', {
  teardown() {
    networkBridge.urlMap = {};
  }
});

QUnit.test('that creating a websocket with no server invokes the onerror method', assert => {
  assert.expect(1);

  var done = assert.async();
  var mockSocket = new WebSocket('ws://localhost:8080');
  mockSocket.onerror = function(event) {
    assert.equal(event.target.readyState, WebSocket.CLOSED, 'onerror fires as expected');
    done();
  };
});

QUnit.test('that onopen is called after successfully connection to the server', assert => {
  assert.expect(1);
  var done       = assert.async();
  new Server('ws://localhost:8080');
  var mockSocket = new WebSocket('ws://localhost:8080');

  mockSocket.onopen = function(event) {
    assert.equal(event.target.readyState, WebSocket.OPEN, 'onopen fires as expected');
    done();
  };
});

QUnit.test('that onmessage is called after the server sends a message', assert => {
  assert.expect(1);
  var done = assert.async();
  var test = new Server('ws://localhost:8080');

  test.on('connection', function(server) {
    server.send('Testing');
  });

  var mockSocket = new WebSocket('ws://localhost:8080');

  mockSocket.onmessage = function(event) {
    assert.equal(event.data, 'Testing', 'onmessage fires as expected');
    done();
  };
});

QUnit.test('that onclose is called after the client closes the connection', assert => {
  assert.expect(1);
  var done = assert.async();
  var test = new Server('ws://localhost:8080');

  test.on('connection', function(server) {
    server.send('Testing');
  });

  var mockSocket = new WebSocket('ws://localhost:8080');

  mockSocket.onmessage = function() {
    mockSocket.close();
  };

  mockSocket.onclose = function(event) {
    assert.equal(event.target.readyState, WebSocket.CLOSED, 'onclose fires as expected');
    done();
  };
});

QUnit.test('that the server gets called when the client sends a message', assert => {
  assert.expect(1);
  var done = assert.async();
  var test = new Server('ws://localhost:8080');

  test.on('message', function(data) {
    assert.equal(data, 'Testing', 'on message fires as expected');
    done();
  });

  var mockSocket = new WebSocket('ws://localhost:8080');

  mockSocket.onopen = function() {
    this.send('Testing');
  };
});

QUnit.test('that the onopen function will only be called once for each client', function(assert) {
  var socketUrl       = 'ws://localhost:8080';
  var mockServer      = new Server(socketUrl);
  var websocketFoo    = new WebSocket(socketUrl);
  var websocketBar    = new WebSocket(socketUrl);
  var done            = assert.async();
  assert.expect(2);

  websocketFoo.onopen = function() {
    assert.ok(true, 'mocksocket onopen fires as expected');
  };

  websocketBar.onopen = function() {
    assert.ok(true, 'mocksocket onopen fires as expected');
    mockServer.close();
    done();
  };
});

QUnit.test('closing a client will only close itself and not other clients', function(assert) {
  new Server('ws://localhost:8080');
  var websocketFoo    = new WebSocket('ws://localhost:8080');
  var websocketBar    = new WebSocket('ws://localhost:8080');
  var done            = assert.async();

  assert.expect(1);

  websocketFoo.onclose = function() {
    assert.ok(false, 'mocksocket should not close');
  };

  websocketBar.onopen = function() {
    this.close();
  };

  websocketBar.onclose = function() {
    assert.ok(true, 'mocksocket onclose fires as expected');
    done();
  };
});

QUnit.test('mock clients can send messages to the right mock server', function(assert) {
  var serverFoo = new Server('ws://localhost:8080');
  var serverBar = new Server('ws://localhost:8081');
  var dataFoo   = 'foo';
  var dataBar   = 'bar';
  var socketFoo = new WebSocket('ws://localhost:8080');
  var socketBar = new WebSocket('ws://localhost:8081');
  var done    = assert.async();

  assert.expect(6);

  serverFoo.on('connection', function(server) {
    assert.ok(true, 'mock server on connection fires as expected');

    server.on('message', function(data) {
      assert.equal(data, dataFoo);
    });
  });

  serverBar.on('connection', function(server) {
    assert.ok(true, 'mock server on connection fires as expected');

    server.on('message', function(data) {
      assert.equal(data, dataBar);
      done();
    });
  });

  socketFoo.onopen = function() {
    assert.ok(true, 'mocksocket onopen fires as expected');
    this.send(dataFoo);
  };

  socketBar.onopen = function() {
    assert.ok(true, 'mocksocket onopen fires as expected');
    this.send(dataBar);
  };
});

QUnit.test('that closing a websocket removes it from the network bridge', function(assert) {
  assert.expect(3);
  var server = new Server('ws://localhost:8080');
  var socket = new WebSocket('ws://localhost:8080');
  var done   = assert.async();

  socket.onopen = function() {
    var urlMap = networkBridge.urlMap['ws://localhost:8080/'];
    assert.equal(urlMap.websockets.length, 1, 'the websocket is in the network bridge');
    assert.deepEqual(urlMap.websockets[0], this, 'the websocket is in the network bridge');
    this.close();
  };

  socket.onclose = function() {
    var urlMap = networkBridge.urlMap['ws://localhost:8080/'];
    assert.equal(urlMap.websockets.length, 0, 'the websocket was removed from the network bridge');
    server.close();
    done();
  };
});
