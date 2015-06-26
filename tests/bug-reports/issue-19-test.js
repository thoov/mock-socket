import QUnit from 'qunit';
import MockServer from '../src/mock-server';
import MockSocket from '../src/mock-socket';

QUnit.module('Issue #19: Mock Server on(message) argument should be a string and not an object.');

QUnit.test('Mock Server on(message) argument should be a string and not an object.', function(assert) {
  var socketUrl             = 'ws://localhost:8080';
  var mockServer            = new MockServer(socketUrl);
  var mockSocket            = new MockSocket(socketUrl);
  var done                  = assert.async();

  assert.expect(1);

  mockServer.on('connection', function (socket) {
      socket.on('message', function (message) {
          assert.equal(typeof message, 'string', 'message should be a string and not an object');
          done();
      });
  });

  mockSocket.onopen = function () {
      mockSocket.send('1');
  };
});
