import test from 'ava';
import sinon from 'sinon';
import WebSocket from '../../src/websocket';

test('when the constructor is invoked, the url argument is handled', t => {
  t.is(new WebSocket('ws://example.com').url, 'ws://example.com/', 'the url gets parsed');

  t.throws(
    () => new WebSocket(),
    `Failed to construct 'WebSocket': 1 argument required, but only 0 present.`,
    'if there is no url'
  );

  t.throws(
    () => new WebSocket('not-a-valid-url'),
    `Failed to construct 'WebSocket': The URL 'not-a-valid-url' is invalid.`,
    'if the url parse fails it throws a SyntaxError'
  );

  t.throws(
    () => new WebSocket('http://scheme.is.not.ws'),
    `Failed to construct 'WebSocket': The URL's scheme must be either 'ws' or 'wss'. 'http:' is not allowed.`,
    'if the url scheme is not ws or wss then it throws a SyntaxError'
  );

  t.throws(
    () => new WebSocket('ws://example.com/foo#bar'),
    `Failed to construct 'WebSocket': The URL contains a fragment identifier ('#bar'). Fragment identifiers are not allowed in WebSocket URLs.`,
    'if the url fragment is non-null then it throws a SyntaxError'
  );
});

test('when the constructor is invoked, the protocols argument is handled', t => {
  t.is(
    new WebSocket('ws://example.com', 'example-protocol').protocol,
    'example-protocol',
    'if protocols is a string, set protocols to a sequence consisting of just that string'
  );

  t.is(
    new WebSocket('ws://example.com', ['example-protocol', 'another-protocol']).protocol,
    'example-protocol',
    'if protocols is an array, set protocols to a sequence consisting of just that string' // TODO fix this message
  );

  t.throws(
    () => new WebSocket('ws://example.com', ['protocol-1', 'protocol-2', 'protocol-1']),
    `Failed to construct 'WebSocket': The subprotocol 'protocol-1' is duplicated.`,
    'if any of the values in protocols occur more than once it throws a SyntaxError'
   );
});

test('that after construction, the url getter returns the websocket url', t => {
  t.is(
    new WebSocket('ws://example.com').url,
    'ws://example.com/',
    'the url attribute\'s getter must return this WebSocket object\'s url, serialized'
  );
});

test('that after construction, all attributes are correctly set', t => {
  t.is(new WebSocket('ws://example').readyState, 0, 'the readyState attribute is set to CONNECTING');
  t.is(new WebSocket('ws://example').extensions, '', 'the extensions attribute is initially an empty string');
  t.is(new WebSocket('ws://example').bufferedAmount, 0, 'the bufferedAmount is set to 0');
  t.is(new WebSocket('ws://example').binaryType, 'blob', 'the binaryType is set to blob');
});

test('that the static attributes are correctly set', t => {
  t.is(WebSocket.CONNECTING, 0, 'CONNECTING is correctly set');
  t.is(WebSocket.OPEN, 1, 'OPEN is correctly set');
  t.is(WebSocket.CLOSING, 2, 'CLOSING is correctly set');
  t.is(WebSocket.CLOSED, 3, 'CLOSED is correctly set');
});

test.cb('that once the connection queue is called, if there is a server it connects', t => {
  /*
    import { WebSocketFactory, WebSocketServer } from 'mock-socket';

    let originalWebSocket;

    beforeEach {
      originalWebSocket = window.WebSocket;
      window.WebSocket = WebSocketFactory(new WebSocketServer());
    }

    afterEach {
      window.WebSocket = originalWebSocket;
    }

  */
  const onopenSpy = sinon.spy();
  const onerrorSpy = sinon.spy();
  const instance = new WebSocket('ws://example.com/foo');
  instance.onopen = onopenSpy;

  setTimeout(() => {
    t.is(instance.readyState, 1, 'the readyState changed to OPEN');
    t.is(onopenSpy.calledOnce);
    t.is(onerrorSpy.notCalled);
    t.end();
  }, 0);
});

test.cb('that once the connection queue is called, if there is no server it fails', t => {
  const onopenSpy = sinon.spy();
  const onerrorSpy = sinon.spy();
  const instance = new WebSocket('ws://example.com/foo');
  instance.onopen = onopenSpy;
  instance.onerror = onerrorSpy;

  setTimeout(() => {
    t.is(instance.readyState, 3, 'the readyState changed to CLOSED');
    t.is(onopenSpy.notCalled);
    t.is(onerrorSpy.calledOnce);
    t.end();
  }, 0);
});
