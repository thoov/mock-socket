import QUnit from 'qunit';
import Server from '../src/server';
import WebSocket from '../src/websocket';

QUnit.module('Issue #13: Sockets send messages multiple times');

QUnit.test('mock sockets sends double messages', function(assert) {
  var socketUrl             = 'ws://localhost:8080';
  var mockServer            = new Server(socketUrl);
  var mockSocketA           = new WebSocket(socketUrl);
  var mockSocketB           = new WebSocket(socketUrl);
  var done                  = assert.async();

  var numMessagesSent     = 0;
  var numMessagesReceived = 0;

  var serverMessageHandler = function() {
    numMessagesReceived++;
  };
  var connectionsCreated  = 0;

  mockServer.on('connection', function(server,socket) {
    connectionsCreated++;
    server.on('message', serverMessageHandler);
  });

  mockSocketA.onopen = function() {
      numMessagesSent++;
      this.send('1');
  };

  mockSocketB.onopen = function() {
      numMessagesSent++;
      this.send('2');
  };

  setTimeout(function() {
    assert.equal(connectionsCreated,2);
    assert.equal(numMessagesReceived, numMessagesSent);
    mockServer.close();
    done();
  }, 500);
});
