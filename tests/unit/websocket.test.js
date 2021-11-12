import URL from 'url-parse';
import test from 'ava';
import WebSocket from '../../src/websocket';
import EventTarget from '../../src/event/target';

test.skip('that not passing a url throws an error', t => {
  t.throws(() => {
    new WebSocket();
  }, "Failed to construct 'WebSocket': 1 argument required, but only 0 present");
});

test('that websockets inherents EventTarget methods with string type url', t => {
  const mySocket = new WebSocket('ws://not-real');
  t.true(mySocket instanceof EventTarget);
});

test('that websockets inherents EventTarget methods with URL type url', t => {
  const mySocket = new WebSocket(new URL('ws://not-real'));

  t.true(mySocket instanceof EventTarget);
  t.is(mySocket.url, 'ws://not-real/');
});

test('that on(open, message, error, and close) can be set', t => {
  const mySocket = new WebSocket('ws://not-real');

  mySocket.onopen = () => {};
  mySocket.onmessage = () => {};
  mySocket.onclose = () => {};
  mySocket.onerror = () => {};

  const listeners = mySocket.listeners;

  t.is(listeners.open.length, 1);
  t.is(listeners.message.length, 1);
  t.is(listeners.close.length, 1);
  t.is(listeners.error.length, 1);
});

test('that passing protocols into the constructor works', t => {
  const mySocket = new WebSocket('ws://not-real', 'foo');
  const myOtherSocket = new WebSocket('ws://not-real', ['bar']);

  t.is(mySocket.protocol, 'foo', 'the correct protocol is set when it was passed in as a string');
  t.is(myOtherSocket.protocol, 'bar', 'the correct protocol is set when it was passed in as an array');
});

test('that sending when the socket is closed throws an expection', t => {
  const mySocket = new WebSocket('ws://not-real', 'foo');
  mySocket.readyState = WebSocket.CLOSED;
  t.throws(
    () => {
      mySocket.send('testing');
    },
    'WebSocket is already in CLOSING or CLOSED state',
    'an expection is thrown when sending while closed'
  );
});
