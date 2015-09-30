import QUnit from 'qunit';
import WebSocket from '../src/websocket';
import EventTarget from '../src/event-target';

QUnit.module('Unit - WebSocket');

QUnit.test('that not passing a url throws an error', assert => {
  assert.expect(1);

  assert.throws(() => {
    new WebSocket();
  }, 'Failed to construct \'WebSocket\': 1 argument required, but only 0 present');
});

QUnit.test('that websockets inherents EventTarget methods', assert => {
  assert.expect(1);

  var mySocket = new WebSocket('ws://not-real');
  assert.ok(mySocket instanceof EventTarget);
});

QUnit.test('that websockets inherents EventTarget methods', assert => {
  assert.expect(1);

  var mySocket = new WebSocket('ws://not-real');
  assert.ok(mySocket instanceof EventTarget);
});


QUnit.test('that on(open, message, error, and close) can be set', assert => {
  assert.expect(4);

  var mySocket = new WebSocket('ws://not-real');

  mySocket.onopen    = () => {};
  mySocket.onmessage = () => {};
  mySocket.onclose   = () => {};
  mySocket.onerror   = () => {};

  var listeners = mySocket.listeners;

  assert.equal(listeners.open.length, 1);
  assert.equal(listeners.message.length, 1);
  assert.equal(listeners.close.length, 1);
  assert.equal(listeners.error.length, 1);
});

QUnit.test('that passing protocols into the constructor works', assert => {
  assert.expect(2);

  var mySocket = new WebSocket('ws://not-real', 'foo');
  var myOtherSocket = new WebSocket('ws://not-real', ['bar']);

  assert.equal(mySocket.protocol, 'foo', 'the correct protocol is set when it was passed in as a string');
  assert.equal(myOtherSocket.protocol, 'bar', 'the correct protocol is set when it was passed in as an array');
});

QUnit.test('that sending when the socket is closed throws an expection', assert => {
  assert.expect(1);

  var mySocket = new WebSocket('ws://not-real', 'foo');
  mySocket.readyState = WebSocket.CLOSED;
  assert.throws(function() {
    mySocket.send('testing');
  }, 'WebSocket is already in CLOSING or CLOSED state', 'an expection is thrown when sending while closed');
});
