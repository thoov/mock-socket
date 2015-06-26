import QUnit from 'qunit';
import MockServer from './src/mock-server';
import MockSocket from './src/mock-socket';
import urlTransform from './src/helpers/url-transform';

QUnit.module('Mocksocket onmessage tests');

QUnit.test('that the mocksocket onmessage function is called after a message is sent', function(assert) {
  var messageData = 'simple string';
  var socketUrl   = 'ws://localhost:8080';
  var mockServer  = new MockServer(socketUrl);
  var mockSocket  = new MockSocket(socketUrl);
  var done        = assert.async();

  assert.expect(4);

  mockServer.on('connection', function(server) {
    server.send(messageData);
  });

  mockSocket.onmessage = function(event) {
    assert.ok(true, 'mocksocket onmessage fires as expected');
    assert.equal(this.readyState, MockSocket.OPEN, 'the readystate is correct set to open');
    assert.equal(event.currentTarget.url, urlTransform(socketUrl), 'onmessage function receives a valid event obejct');
    assert.equal(event.data, messageData, 'onmessage function receives the correct message');
    done();
  };
});
