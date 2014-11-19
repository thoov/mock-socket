
module('Mock Socks Server Tests');

test('Initialization is done correctly', function(){
	var mockServer = new MockSocksServer();

	ok(mockServer.protocol, 'after initialization the procotol is set');
});

asyncTest('Onconnection is observed correctly', function(){
	var mockServer = new MockSocksServer();
	var callback = function() {
		ok(true, 'the onconnection callback was called correctly');
		start();
	};

	mockServer.on('connection', callback);
	mockServer.protocol.subject.notify('server_onconnection');
});

asyncTest('Onmessage is observed correctly', function(){
	var mockServer = new MockSocksServer();
	var mockData = {foo: 'bar'};
	var callback = function(fakeData) {
		ok(true, 'the onmessage callback was called correctly');
		deepEqual(fakeData, mockData, 'the message was correctly passed into the message callback');
		start();
	};

	mockServer.on('message', callback);
	mockServer.protocol.clientSend(null, mockData);
});
