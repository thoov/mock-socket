import QUnit from 'qunit';
import MockServer from './src/mock-server';
import MockSocket from './src/mock-socket';
import socketEventMessage from './src/helpers/message-event';

QUnit.module('Websocket message event Tests');

QUnit.test('Mock message event has correct properties', function(assert) {
	var testObject = {foo: 'bar'};
	var eventMessage = socketEventMessage('open', 'testing', 'ws://localhost');

	eventMessage.target = testObject;

	assert.equal(eventMessage.source, null);
	assert.equal(eventMessage.target, eventMessage.srcElement);
	assert.equal(eventMessage.target, eventMessage.currentTarget);
	assert.equal(eventMessage.currentTarget.foo, 'bar');

	assert.equal(eventMessage.lastEventId, '');
	assert.equal(eventMessage.clipboardData, undefined);
	assert.equal(eventMessage.defaultPrevented, false);
	assert.equal(eventMessage.returnValue, true);
	assert.equal(eventMessage.type, 'open');
});
