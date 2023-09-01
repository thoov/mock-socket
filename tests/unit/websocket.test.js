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

test('that sending when the socket is in the `CONNECTING` state throws an exception', t => {
  const mySocket = new WebSocket('ws://not-real', 'foo');
  mySocket.readyState = WebSocket.CONNECTING;
  t.throws(
    () => {
      mySocket.send('testing');
    },
    "Failed to execute 'send' on 'WebSocket': Still in CONNECTING state",
    'an exception is thrown when sending while in the `CONNECTING` state'
  );
});

test('that sending when the socket is in the `CLOSING` state does not throw an exception', t => {
  const mySocket = new WebSocket('ws://not-real', 'foo');
  mySocket.close();
  t.notThrows(
    () => {
      mySocket.send('testing');
    },
  );
});

test.cb('that sending when the socket is in the `CLOSED` state does not throw an exception', t => {
  const mySocket = new WebSocket('ws://not-real', 'foo');
  mySocket.close();
  mySocket.addEventListener('close', () => {
    t.notThrows(
      () => {
        mySocket.send('testing');
        t.end();
      },
    );
  }, { once: true });
});
