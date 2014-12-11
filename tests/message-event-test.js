module('Websocket message event Tests');

test('Mock message event has correct properties', function(){
	var testObject = {foo: 'bar'};
	var eventMessage = socketEventMessage('open', 'testing', 'ws://localhost');

	eventMessage.target = testObject;

	ok(eventMessage.source === null);
	ok(eventMessage.target === eventMessage.srcElement);
	ok(eventMessage.target === eventMessage.currentTarget);
	equal(eventMessage.currentTarget.foo, 'bar');

	equal(eventMessage.lastEventId, '');
	equal(eventMessage.clipboardData, undefined);
	equal(eventMessage.defaultPrevented, false);
	equal(eventMessage.returnValue, true);
});
