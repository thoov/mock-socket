describe('Mock Socks', function(){

	it('should have the correct initial properties', function(){
		var exampleSocket = new MockSocks("ws://www.example.com/socketserver");
		expect(exampleSocket.url).toBe("ws://www.example.com/socketserver");
		expect(exampleSocket.readyState).toBe(MockSocks.CONNECTING);
	});


	it('should correctly call on connection', function(){

		var exampleSocket = new MockSocks("ws://www.example.com/socketserver");
		var exampleServer = new MockSocksServer(exampleSocket);

		exampleServer.on('connection', function(server) {
			expect(exampleServer).toEqual(server);
			expect(exampleSocket.readyState).toBe(MockSocks.OPEN);
		});

		exampleSocket.onopen(function() {
			expect(exampleSocket.readyState).toBe(MockSocks.OPEN);
		});

	});
});
