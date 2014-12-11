module('Websocket message event Tests');

test('Url transform is done correctly', function(){
	var testObject = {foo: 'bar'};
	var eventMessage = socketEventMessage('open', 'testing', 'ws://localhost');

	eventMessage.source = testObject;

	ok(eventMessage.source === eventMessage.srcElement);
	ok(eventMessage.source === eventMessage.currentTarget);
	equal(eventMessage.currentTarget.foo, 'bar');
});
