import assert from 'assert';
import WebSocket from '../src/websocket';
import EventTarget from '../src/event-target';

describe('Unit - WebSocket', function unitTest() {
  it('that not passing a url throws an error', () => {
    assert.throws(() => {
      const ws = new WebSocket();
    }, 'Failed to construct \'WebSocket\': 1 argument required, but only 0 present');
  });

  it('that websockets inherents EventTarget methods', () => {
    const mySocket = new WebSocket('ws://not-real');
    assert.ok(mySocket instanceof EventTarget);
  });

  it('that websockets inherents EventTarget methods', () => {
    const mySocket = new WebSocket('ws://not-real');
    assert.ok(mySocket instanceof EventTarget);
  });


  it('that on(open, message, error, and close) can be set', () => {
    const mySocket = new WebSocket('ws://not-real');

    mySocket.onopen = () => {};
    mySocket.onmessage = () => {};
    mySocket.onclose = () => {};
    mySocket.onerror = () => {};

    const listeners = mySocket.listeners;

    assert.equal(listeners.open.length, 1);
    assert.equal(listeners.message.length, 1);
    assert.equal(listeners.close.length, 1);
    assert.equal(listeners.error.length, 1);
  });

  it('that passing protocols into the constructor works', () => {
    const mySocket = new WebSocket('ws://not-real', 'foo');
    const myOtherSocket = new WebSocket('ws://not-real', ['bar']);

    assert.equal(mySocket.protocol, 'foo', 'the correct protocol is set when it was passed in as a string');
    assert.equal(myOtherSocket.protocol, 'bar', 'the correct protocol is set when it was passed in as an array');
  });

  it('that sending when the socket is closed throws an expection', () => {
    const mySocket = new WebSocket('ws://not-real', 'foo');
    mySocket.readyState = WebSocket.CLOSED;
    assert.throws(function throws() {
      mySocket.send('testing');
    }, 'WebSocket is already in CLOSING or CLOSED state', 'an expection is thrown when sending while closed');
  });
});
