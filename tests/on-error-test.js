import QUnit from 'qunit';
import MockServer from './src/server';
import MockSocket from './src/websocket';

QUnit.module('Mocksocket onerror tests');

QUnit.test('that server rejects connection to unresolvable URL', function(assert) {
  var mockServer = new MockServer(MockServer.unresolvableURL);
  var mockSocket = new MockSocket(MockServer.unresolvableURL);
  var done       = assert.async();

  assert.expect(2);

  mockSocket.onerror = function() {
    assert.ok(true, 'mocksocket onerror fires as expected');
    assert.equal(this.readyState, MockSocket.CLOSED, 'the readystate is correctly set to CLOSED');
    done();
  };
});
