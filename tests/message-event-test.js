module('Websocket message event Tests');

test('Mock message event has correct properties', function(){
	var testObject = {foo: 'bar'};
	var eventMessage = socketEventMessage('open', 'testing', 'ws://localhost');

	eventMessage.target = testObject;

	equal(eventMessage.source, null);
	equal(eventMessage.target, eventMessage.srcElement);
	equal(eventMessage.target, eventMessage.currentTarget);
	equal(eventMessage.currentTarget.foo, 'bar');

	equal(eventMessage.lastEventId, '');
	equal(eventMessage.clipboardData, undefined);
	equal(eventMessage.defaultPrevented, false);
	equal(eventMessage.returnValue, true);
	equal(eventMessage.type, 'open');
});
