import QUnit from 'qunit';
import MockServer from './src/mock-server';
import MockSocket from './src/mock-socket';

QUnit.module('Mocksocket onopen tests');

QUnit.asyncTest('that the mocksocket onopen function is called after mocksocket object is created', function(assert) {
  var socketUrl  = 'ws://localhost:8080';
  var mockServer = new MockServer(socketUrl);
  var mockSocket = new MockSocket(socketUrl);

  assert.expect(3);

  mockSocket.onopen = function(event) {
    assert.ok(true, 'mocksocket onopen fires as expected');
    assert.equal(this.readyState, MockSocket.OPEN, 'the readystate is correct set to open');
    assert.equal(event.currentTarget.url, urlTransform(socketUrl), 'onopen function receives a valid event obejct');
    assert.start();
  };
});


QUnit.asyncTest('that the mock server connection function is called after mocksocket object is created', function(assert) {
  var socketUrl  = 'ws://localhost:8080';
  var mockServer = new MockServer(socketUrl);
  var mockSocket = new MockSocket(socketUrl);

  assert.expect(1);

  mockServer.on('connection', function() {
    assert.ok(true, 'mock server on connection fires as expected');
    assert.start();
  });
});


QUnit.asyncTest('that the mock server connection function is called after mocksocket object is created', function(assert) {
  var semaphore  = false;
  var socketUrl  = 'ws://localhost:8080';
  var mockServer = new MockServer(socketUrl);
  var mockSocket = new MockSocket(socketUrl);

  assert.expect(2);

  mockServer.on('connection', function() {
    assert.ok(!semaphore, 'The mock server\'s connection was called first before the onopen function');
    semaphore = true;
  });

  mockSocket.onopen = function(event) {
    assert.ok(semaphore, 'The onopen function was called second after the mock server\'s connection function');
    semaphore = true;
    assert.start();
  };
});
