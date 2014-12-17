module('Mock Socket Update Readystate Test', {
  setup: function() {
    var mockServer = new MockServer('ws://localhost:8080');
  }
});

test('that ready state can only be set to 0-4', function() {
  var mockSockets = new MockSocket('ws://localhost:8080');

  expect(3);

  equal(mockSockets.readyState, 0);
  mockSockets._updateReadyState(5);
  equal(mockSockets.readyState, 0);
  mockSockets._updateReadyState(4);
  equal(mockSockets.readyState, 4);
});
