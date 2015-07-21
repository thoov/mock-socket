import QUnit from 'qunit';
import Server from './src/server';
import WebSocket from './src/websocket';
import networkBridge from './src/network-bridge';

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
    mockSocket.send('Testing');
  };
});
