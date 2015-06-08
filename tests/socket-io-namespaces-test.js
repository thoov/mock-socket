module('Socket.io namespace tests');

asyncTest('On message with the namespaced server happens correctly', function() {
  var catsNamespace = MockServer.of('/cats');
  catsNamespace.on('connection', function(server) {
    server.emit('cat message', 'hello cats');
  });

  var mockSocket = MockSocketIO('/cats');

  expect(2);

  mockSocket.on('cat message', function(eventData) {
    ok(true, 'on fires as expected');
    equal(eventData, 'hello cats', 'on function receives the correct message');
    start();
  });
});

test('Namespaces register different servers', function() {
  var catsNamespace = MockServer.of('/cats');
  var dogsNamespace = MockServer.of('/dog');
  notEqual(catsNamespace.service, dogsNamespace.service);
});
