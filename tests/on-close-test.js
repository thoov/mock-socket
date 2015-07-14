import QUnit from 'qunit';
import MockServer from './src/server';
import MockSocket from './src/websocket';
import urlTransform from './src/helpers/url-transform';

QUnit.module('Mocksocket onclose test');

QUnit.test('that the mocksocket onclose function is called after closing mocksocket', function(assert) {
  var socketUrl  = 'ws://localhost:8080';
  var mockServer = new MockServer(socketUrl);
  var mockSocket = new MockSocket(socketUrl);
  var done       = assert.async();

  assert.expect(4);

  mockServer.on('close', function() {
    assert.ok(true, 'mock server on close fires as expected');
    done();
  });

  mockSocket.onclose = function(event) {
    assert.ok(true, 'mocksocket onclose fires as expected');
    assert.equal(this.readyState, MockSocket.CLOSING, 'the readystate is correct to closed');
    assert.equal(event.currentTarget.url, urlTransform(socketUrl), 'onclose function receives a valid event obejct');
  };

  mockServer.close();
});

QUnit.test('that the mocksocket onclose function is called after closing the mockserver', function(assert) {
  var socketUrl  = 'ws://localhost:8080';
  var mockServer = new MockServer(socketUrl);
  var mockSocket = new MockSocket(socketUrl);
  var done       = assert.async();

  assert.expect(4);

  mockServer.on('close', function() {
    assert.ok(true, 'mock server on close fires as expected');
    done();
  });

  mockSocket.onclose = function(event) {
    assert.ok(true, 'onclose fires as expected');
    assert.equal(this.readyState, MockSocket.CLOSING, 'the readystate is correct to closed');
    assert.equal(event.currentTarget.url, urlTransform(socketUrl), 'onclose function receives a valid event obejct');
  };

  mockServer.close();
});

QUnit.test('that closing a mock socket will only call the mock servers onclose callback once', function(assert) {
  var socketUrl  = 'ws://localhost:8080';
  var mockServer = new MockServer(socketUrl);
  var mockSocket = new MockSocket(socketUrl);
  var done       = assert.async();
  assert.expect(1);

  mockServer.on('close', function() {
    assert.ok(true, 'mock server on close fires as expected');
  });

  mockSocket.close();
  mockSocket.close();

  setTimeout(function() {
    done();
  }, 100);
});
