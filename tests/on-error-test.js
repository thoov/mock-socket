module('Mocksocket onerror tests');

asyncTest('that server rejects connection to unresolvable URL', function() {
  var mockServer = new MockServer(MockServer.unresolvableURL);
  var mockSocket = new MockSocket(MockServer.unresolvableURL);

  expect(2);

  mockSocket.onerror = function(event) {
    ok(true, 'mocksocket onerror fires as expected');
    equal(this.readyState, MockSocket.CLOSED, 'the readystate is correctly set to CLOSED');
    start();
  };
});
