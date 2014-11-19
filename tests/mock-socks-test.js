var exampleServer;
var originalSocketsReference;

module('Mock Socks Tests', {
	setup: function() {
		originalSocketsReference = window.WebSockets;
		window.WebSockets = MockSocks;

		exampleServer = new MockSocksServer();
		exampleServer.on('connection', function(server) {
			server.on('message', function(data) {
				server.send('hello');
			});
		});
	},

	teardown: function() {
		window.WebSockets = originalSocketsReference;
	}
});

asyncTest('onopen method fires as expected', function(){
	var exampleSocket = new WebSockets('ws://www.example.com/socketserver');

	exampleSocket.onopen = function() {
		ok(true, 'onopen fires as expected');
		start();
	};
});

asyncTest('onmessage method fires as expected', function(){
	var exampleSocket = new WebSockets('ws://www.example.com/socketserver');

	exampleSocket.onmessage = function() {
		ok(true, 'onmessage fires as expected');
		start();
	};

	exampleSocket.send('testing');
});
