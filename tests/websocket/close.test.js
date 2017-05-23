import test from 'ava';
import WebSocket from '../../src/websocket';

test('that if code is present, but is neither an integer equal to 1000 nor an integer in the range 3000 to 4999, inclusive, throw an "InvalidAccessError" DOMException', t => {
  const websocket = new WebSocket('ws://example.com');

  t.throws(
    () => websocket.close('NaN'),
    `Failed to execute 'close' on 'WebSocket': The code must be either 1000, or between 3000 and 4999. NaN is neither.`,
    'close code must be a number'
  );
  t.throws(
    () => websocket.close(2999),
    `Failed to execute 'close' on 'WebSocket': The code must be either 1000, or between 3000 and 4999. 2999 is neither.`,
    'close code must be 1000 or between 3000-4999'
  );
  t.throws(
    () => websocket.close(5000),
    `Failed to execute 'close' on 'WebSocket': The code must be either 1000, or between 3000 and 4999. 5000 is neither.`,
    'close code must be 1000 or between 3000-4999'
  );
});

test('reason is present and is longer than 123 bytes it throws "SyntaxError" DOMException', t => {
  const websocket = new WebSocket('ws://example.com');

  t.throws(
    () => websocket.close(1000, 'some very long string some very long string some very long string some very long string some very long string some very long string'),
    `Failed to execute 'close' on 'WebSocket': The message must not be greater than 123 bytes.`
  );
});

test('if readyState is CLOSING, do nothing', t => {
  const websocket = new WebSocket('ws://example.com');

  websocket.readyState = WebSocket.CLOSING;
  websocket.close();



  // TODO: mock that nothing is happening
});

test('if readyState is CLOSED, do nothing', t => {
  const websocket = new WebSocket('ws://example.com');

  websocket.readyState = WebSocket.CLOSED;
  websocket.close();

  // TODO: mock that nothing is happening
});

test('if readyState is CONNECTING, fail the connection and set the readyState to CLOSING', t => {
  const websocket = new WebSocket('ws://example.com');

  websocket.readyState = WebSocket.CONNECTING;
  websocket.close();

    // TODO: we have to look into the closing algorithm
  t.is(websocket.readyState, WebSocket.CLOSING);
});
