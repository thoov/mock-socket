module('Mocksocket onmessage tests');

asyncTest('that the mocksocket onmessage function is called after a message is sent', function() {
  var messageData     = 'simple string';
  var socketUrl       = 'ws://localhost:8080';
  var webSocketServer = new WebSocketServer(socketUrl);
  var mockWebsockets  = new MockSocket(socketUrl);

  expect(4);

  webSocketServer.on('connection', function(server) {
    server.send(messageData);
  });

  mockWebsockets.onmessage = function(event) {
    ok(true, 'mocksocket onmessage fires as expected');
    equal(this.readyState, MockSocket.OPEN, 'the readystate is correct set to open');
    equal(event.currentTarget.url, urlTransform(socketUrl), 'onmessage function receives a valid event obejct');
    equal(event.data, messageData, 'onmessage function receives the correct message');
    start();
  };
});
