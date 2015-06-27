import QUnit from 'qunit';
import MockServer from './src/mock-server';
import MockSocket from './src/mock-socket';
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
