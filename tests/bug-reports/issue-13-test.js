import QUnit from 'qunit';
import MockServer from '../src/mock-server';
import MockSocket from '../src/mock-socket';

QUnit.module('Issue #13: Sockets send messages multiple times');

QUnit.asyncTest('mock sockets sends double messages', function(assert) {
  var socketUrl             = 'ws://localhost:8080';
  var mockServer            = new MockServer(socketUrl);
  var mockSocketA           = new MockSocket(socketUrl);
  var mockSocketB           = new MockSocket(socketUrl);

  var num_messages_sent     = 0;
  var num_messages_received = 0;

  mockServer.on('connection', function (socket) {
      socket.on('message', function (event) {
          num_messages_received++;
      });
  });

  mockSocketA.onopen = function () {
      num_messages_sent++;
      mockSocketA.send('1');
  };

  mockSocketB.onopen = function () {
      num_messages_sent++;
      mockSocketB.send('2');
  };

  setTimeout(function () {
    assert.equal(num_messages_received, num_messages_sent);
    assert.start();
  }, 500);
});
