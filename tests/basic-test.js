import QUnit from 'qunit';
import MockServer from './src/server';
import MockSocket from './src/websocket';

var mockServer;

QUnit.module('Mock Socket Tests', {
  setup: function() {
    mockServer = new MockServer('ws://localhost:8080');
    mockServer.on('connection', function(server) {
      server.send('hello');
    });
  }
});

QUnit.test('Connection with the server happens correctly', assert => {
  var mockSocket = new MockSocket('ws://localhost:8080');
  var done = assert.async();

  assert.expect(1);

  mockSocket.onopen = function() {
    assert.ok(true, 'onopen fires as expected');
    done();
  };
});

QUnit.test('On message with the server happens correctly', assert => {
  var mockSocket = new MockSocket('ws://localhost:8080');
  var done = assert.async();

  assert.expect(1);

  mockSocket.onmessage = function() {
    assert.ok(true, 'onmessage fires as expected');
    done();
  };
});
