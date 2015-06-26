import QUnit from 'qunit';
import MockServer from './src/mock-server';
import MockSocket from './src/mock-socket';

var mockServer;

QUnit.module('Mock Socket Tests', {
  setup: function() {
    mockServer = new MockServer('ws://localhost:8080');
    mockServer.on('connection', function(server) {
      server.send('hello');
    });
  }
});

QUnit.asyncTest('Connection with the server happens correctly', assert => {
  var mockSocket = new MockSocket('ws://localhost:8080');

  assert.expect(1);

  mockSocket.onopen = function() {
    assert.ok(true, 'onopen fires as expected');
    assert.start();
  };
});

QUnit.asyncTest('On message with the server happens correctly', assert => {
  var mockSocket = new MockSocket('ws://localhost:8080');

  assert.expect(1);

  mockSocket.onmessage = function() {
    assert.ok(true, 'onmessage fires as expected');
    assert.start();
  };
});
