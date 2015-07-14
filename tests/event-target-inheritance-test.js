import QUnit from 'qunit';
import MockServer from './src/server';
import MockSocket from './src/websocket';
import socketEventMessage from './src/helpers/message-event';

var socketUrl = 'ws://localhost';
var mockSocket;
var mockServer;
var done;

QUnit.module('MockSocket inherits EventTarget', {
  setup: function() {
    mockServer = new MockServer(socketUrl);
    mockServer.on('close', function() {
      done();
    });
    mockSocket = new MockSocket(socketUrl);
  }
});

QUnit.test('has all the required methods', function(assert) {
  assert.expect(3);
  done = assert.async();

  assert.ok(mockSocket.addEventListener);
  assert.ok(mockSocket.removeEventListener);
  assert.ok(mockSocket.dispatchEvent);
  mockServer.close();
});

QUnit.test('adding/removing "message" event listeners works', function(assert) {
  var eventMessage = socketEventMessage('message', 'testing', socketUrl);
  var fired = 0;
  var handler1 = function() {
    fired++;
  };
  var handler2 = function() {
    fired++;
  };

  assert.expect(3);
  done = assert.async();

  mockSocket.addEventListener('message', handler1);
  mockSocket.addEventListener('message', handler2);
  mockSocket.dispatchEvent(eventMessage);
  assert.equal(fired, 2, '2 handlers should be executed');

  fired = 0;
  mockSocket.removeEventListener('message', handler1);
  mockSocket.dispatchEvent(eventMessage);
  assert.equal(fired, 1, 'only 1 handler should be executed');

  fired = 0;
  mockSocket.removeEventListener('message', handler2);
  mockSocket.dispatchEvent(eventMessage);
  assert.equal(fired, 0, 'no handlers should be executed');

  mockServer.close();
});

QUnit.test('sockets to different URLs should not share events', assert => {
  let socketUrl2 = 'ws://localhost/2';
  let mockServer2 = new MockServer(socketUrl2);
  mockServer2.on('close', () => {
    mockServer.close();
  });
  let mockSocket2 = new MockSocket(socketUrl2);
  let eventMessage = socketEventMessage('message', 'testing', socketUrl);
  let fired = 0;
  let handler = () => fired++;

  assert.expect(1);
  done = assert.async();

  mockSocket.addEventListener('message', handler);
  mockSocket2.addEventListener('message', handler);
  mockSocket.dispatchEvent(eventMessage);
  assert.equal(fired, 1, 'only 1 handler should be executed');
  mockServer2.close();
});
