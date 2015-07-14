import QUnit from 'qunit';
import MockServer from './src/server';
import MockSocket from './src/websocket';

QUnit.module('Mock Socket Update Readystate Test', {
  setup: function() {
    var mockServer = new MockServer('ws://localhost:8080');
  }
});

QUnit.test('that ready state can only be set to 0-4', function(assert) {
  var mockSockets = new MockSocket('ws://localhost:8080');

  assert.expect(3);

  assert.equal(mockSockets.readyState, 0);
  mockSockets._updateReadyState(5);
  assert.equal(mockSockets.readyState, 0);
  mockSockets._updateReadyState(4);
  assert.equal(mockSockets.readyState, 4);
});
