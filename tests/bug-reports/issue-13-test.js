module('Issue #13: Sockets send messages multiple times');

asyncTest('mock sockets sends double messages', function() {
  var socketUrl             = 'ws://localhost:8080';
  var mockServer            = new MockServer(socketUrl);
  var mockSocketA           = new MockSocket(socketUrl);
  var mockSocketB           = new MockSocket(socketUrl);

  var num_messages_sent     = 0;
  var num_messages_received = 0;

  mockServer.on('connection', function (socket) {
      socket.on('message', function (event) {
          num_messages_received++;
      });
  });

  mockSocketA.onopen = function () {
      num_messages_sent++;
      mockSocketA.send('1');
  };

  mockSocketB.onopen = function () {
      num_messages_sent++;
      mockSocketB.send('2');
  };

  setTimeout(function () {
    equal(num_messages_received, num_messages_sent);
    start();
  }, 500);
});
