import QUnit from 'qunit';
import MockServer from '../src/server';
import MockSocket from '../src/websocket';

QUnit.module('Issue #13: Sockets send messages multiple times');

QUnit.test('mock sockets sends double messages', function(assert) {
  var socketUrl             = 'ws://localhost:8080';
  var mockServer            = new MockServer(socketUrl);
  var mockSocketA           = new MockSocket(socketUrl);
  var mockSocketB           = new MockSocket(socketUrl);
  var done                  = assert.async();

  var numMessagesSent     = 0;
  var numMessagesReceived = 0;

  mockServer.on('connection', function (socket) {
      socket.on('message', function () {
          numMessagesReceived++;
      });
  });

  mockSocketA.onopen = function () {
      numMessagesSent++;
      mockSocketA.send('1');
  };

  mockSocketB.onopen = function () {
      numMessagesSent++;
      mockSocketB.send('2');
  };

  setTimeout(function () {
    assert.equal(numMessagesReceived, numMessagesSent);
    done();
  }, 500);
});
