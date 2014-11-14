var protocol = new Protocol();
var exampleServer = new MockSocksServer(protocol);
exampleServer.on('connection', function(server) {

	// server.on('message', function(data) {
	//
	// 	server.send('testing');
	//
	// });
});

test('basic test', function(){
    var exampleSocket = new MockSocks('ws://www.example.com/socketserver', protocol);

	exampleSocket.onopen(function() {
		equal(true, true, 'onopen fires as expected');
	});
});
