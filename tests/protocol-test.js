var exampleServer;
var originalSocketsReference;

module('Protocol Tests', {
	setup: function() {
		MockSocks.PROTOCOL = null;
	}
});

test('protocol initialization tests', function(){
	equal(MockSocks.PROTOCOL, null, 'mock socks protocol is null by default');

	var protocol = new Protocol();

	deepEqual(MockSocks.PROTOCOL, protocol, 'after protocol initialization the mock socks procotol is set');

	ok(protocol.subject, 'the subject has been initialized');
});
