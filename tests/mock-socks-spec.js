var exampleServer;
var originalSocketsReference;

module('Simple Test', {
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



asyncTest('basic test', function(){
    var exampleSocket = new WebSockets('ws://www.example.com/socketserver');

	exampleSocket.onopen(function() {
		equal(true, true, 'onopen fires as expected');
	});

	exampleSocket.onmessage(function(data) {
		equal(true, true, 'onmessage fires as expected');
		start();
	});

	exampleSocket.send('world');
});
