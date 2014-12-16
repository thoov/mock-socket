module('Mock Socket Update Readystate Test', {
  setup: function() {
    var webSocketServer = new WebSocketServer('ws://localhost:8080');
  }
});

test('that ready state can only be set to 0-4', function() {
  var mockWebsockets = new MockSocket('ws://localhost:8080');

  expect(3);

  equal(mockWebsockets.readyState, 0);
  mockWebsockets._updateReadyState(5);
  equal(mockWebsockets.readyState, 0);
  mockWebsockets._updateReadyState(4);
  equal(mockWebsockets.readyState, 4);
});
