import QUnit from 'qunit';
import Server from '../src/server';
import WebSocket from '../src/websocket';

QUnit.module('Issue #19: Mock Server on(message) argument should be a string and not an object.');

QUnit.test('that server on(message) argument should be a string and not an object', function(assert) {
  var socketUrl  = 'ws://localhost:8080';
  var mockServer = new Server(socketUrl);
  var mockSocket = new WebSocket(socketUrl);
  var done       = assert.async();

  assert.expect(1);

  mockServer.on('connection', function (socket) {
    socket.on('message', function (message) {
      assert.equal(typeof message, 'string', 'message should be a string and not an object');
      mockServer.close();
      done();
    });
  });

  mockSocket.onopen = function () {
    this.send('1');
  };
});
