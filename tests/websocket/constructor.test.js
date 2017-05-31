import test from 'ava';
import sinon from 'sinon';
import { WebSocket as WebSocketNonFactory, createMocks } from '../../src/index';

test('when the constructor is invoked, the url argument is handled', t => {
  const { WebSocket } = createMocks();

  t.is(new WebSocket('ws://example.com').url, 'ws://example.com/', 'the url gets parsed');

  t.throws(
    () => new WebSocket(),
    "Failed to construct 'WebSocket': 1 argument required, but only 0 present.",
    'if there is no url'
  );

  t.throws(
    () => new WebSocket('not-a-valid-url'),
    "Failed to construct 'WebSocket': The URL 'not-a-valid-url' is invalid.",
    'if the url parse fails it throws a SyntaxError'
  );

  t.throws(
    () => new WebSocket('http://scheme.is.not.ws'),
    "Failed to construct 'WebSocket': The URL's scheme must be either 'ws' or 'wss'. 'http:' is not allowed.",
    'if the url scheme is not ws or wss then it throws a SyntaxError'
  );

  t.throws(
    () => new WebSocket('ws://example.com/foo#bar'),
    "Failed to construct 'WebSocket': The URL contains a fragment identifier ('#bar'). Fragment identifiers are not allowed in WebSocket URLs.",
    'if the url fragment is non-null then it throws a SyntaxError'
  );

  t.throws(
    () => new WebSocketNonFactory('ws://example.com'),
    `WebSocket must be created via createMocks. Please references this for more details.`
  );
});

test('when the constructor is invoked, the protocols argument is handled', t => {
  const { WebSocket } = createMocks();

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
  const { WebSocket } = createMocks();

  t.is(
    new WebSocket('ws://example.com').url,
    'ws://example.com/',
    "the url attribute's getter must return this WebSocket object's url, serialized"
  );
});

test('that after construction, all attributes are correctly set', t => {
  const { WebSocket } = createMocks();

  t.is(new WebSocket('ws://example').readyState, 0, 'the readyState attribute is set to CONNECTING');
  t.is(new WebSocket('ws://example').extensions, '', 'the extensions attribute is initially an empty string');
  t.is(new WebSocket('ws://example').bufferedAmount, 0, 'the bufferedAmount is set to 0');
  t.is(new WebSocket('ws://example').binaryType, 'blob', 'the binaryType is set to blob');
});

test('that the static attributes are correctly set', t => {
  const { WebSocket } = createMocks();

  t.is(WebSocket.CONNECTING, 0, 'CONNECTING is correctly set');
  t.is(WebSocket.OPEN, 1, 'OPEN is correctly set');
  t.is(WebSocket.CLOSING, 2, 'CLOSING is correctly set');
  t.is(WebSocket.CLOSED, 3, 'CLOSED is correctly set');
});

test.cb('that once the connection queue is called, if there is a server it connects', t => {
  const { WebSocket, Server } = createMocks();

  const onopenSpy = sinon.spy();
  const onerrorSpy = sinon.spy();
  const instance = new WebSocket('ws://example.com/foo');
  const serverInstance = new Server('ws://example.com/foo');
  serverInstance.start();
  instance.onopen = onopenSpy;

  setTimeout(() => {
    t.is(instance.readyState, 1);
    t.true(onopenSpy.calledOnce);
    t.true(onerrorSpy.notCalled);
    serverInstance.stop(t.end());
  }, 0);
});

test.cb('that once the connection queue is called, if there is no server it fails', t => {
  const { WebSocket } = createMocks();

  const onopenSpy = sinon.spy();
  const onerrorSpy = sinon.spy();
  const instance = new WebSocket('ws://example.com/foo');
  instance.onopen = onopenSpy;
  instance.onerror = onerrorSpy;

  setTimeout(() => {
    t.is(instance.readyState, 3);
    t.true(onopenSpy.notCalled);
    t.true(onerrorSpy.calledOnce);
    t.end();
  }, 0);
});

test.cb.skip('that once the connection queue is called, the server can set the protocol', t => {
  const { WebSocket, Server } = createMocks();

  const instance = new WebSocket('ws://example.com/foo');
  const serverInstance = new Server('ws://example.com/foo');
  serverInstance.start();

  instance.onopen = () => {
    t.is(instance.prototype, 'foo-bar');
    serverInstance.stop(t.end());
  };
});

test.cb.skip('that once the connection queue is called, the server can set the extensions', t => {
  const { WebSocket, Server } = createMocks();

  const instance = new WebSocket('ws://example.com/foo');
  const serverInstance = new Server('ws://example.com/foo');
  serverInstance.start();

  instance.onopen = () => {
    t.is(instance.extensions, 'foo-bar');
    serverInstance.stop(t.end());
  };
});
