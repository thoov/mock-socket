import test from 'ava';
import sinon from 'sinon';
import { createMocks } from './index';

test('when the constructor is invoked, the url argument is handled', t => {
  const { WebSocket } = createMocks();

  t.is(new WebSocket('ws://example.com').url, 'ws://example.com/');
  t.is(new WebSocket('ws://example.com/').url, 'ws://example.com/');
  t.is(new WebSocket('ws://example.com:7000').url, 'ws://example.com:7000/');
  t.is(new WebSocket('ws://example.com/foo').url, 'ws://example.com/foo');
  t.is(new WebSocket('ws://example.com/foo/').url, 'ws://example.com/foo/');

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
    "Failed to construct 'WebSocket': The URL contains a fragment identifier ('#bar'). " +
      'Fragment identifiers are not allowed in WebSocket URLs.',
    'if the url fragment is non-null then it throws a SyntaxError'
  );
});

test.cb('when the constructor is invoked, a string protocol argument is handled', t => {
  const { WebSocket, Server } = createMocks();

  // eslint-disable-next-line no-unused-vars
  const server = new Server('ws://example.com');
  const websocket = new WebSocket('ws://example.com', 'protocol-1');

  setTimeout(() => {
    t.is(
      websocket.protocol,
      'protocol-1',
      'if protocols is a string, set protocols to a sequence consisting of just that string'
    );

    t.end();
  }, 0);
});

test.cb('when the constructor is invoked, an array protocol argument is handled', t => {
  const { WebSocket, Server } = createMocks();

  // eslint-disable-next-line no-unused-vars
  const server = new Server('ws://example.com');
  const websocket = new WebSocket('ws://example.com', ['protocol-2', 'protocol-1']);

  setTimeout(() => {
    t.is(
      websocket.protocol,
      'protocol-2',
      'if protocols is an array, set protocols to the first protocol'
    );

    t.end();
  }, 0);
});

test('when the constructor is invoked, an array protocol argument w/ duplicates throws an error', t => {
  const { WebSocket, Server } = createMocks();

  // eslint-disable-next-line no-unused-vars
  const server = new Server('ws://example.com');
  t.throws(() => new WebSocket('ws://example.com', ['protocol-1', 'protocol-2', 'protocol-1']),
    "Failed to construct 'WebSocket': The subprotocol 'protocol-1' is duplicated.",
    'if any of the values in protocols occur more than once it throws a SyntaxError'
  );
});

test('when the constructor is invoked, the protocols argument throws if a protocol is not supported', t => {
  const { WebSocket, Server } = createMocks();

  // eslint-disable-next-line no-unused-vars
  const server = new Server('ws://example.com', { handleProtocols: () => false });

  t.throws(
    () => new WebSocket('ws://example.com', ['protocol-1', 'protocol-2', 'protocol-3']),
    "Failed to construct 'WebSocket': A subprotocol is not supported.",
    'if any protocol is not supported it throws a SyntaxError'
  );
});

test('that after construction, all attributes are correctly set', t => {
  const { WebSocket } = createMocks();

  t.is(new WebSocket('ws://example').readyState, 0, 'the readyState attribute is set to CONNECTING');
  t.is(new WebSocket('ws://example').extensions, '', 'the extensions attribute is initially an empty string');
  t.is(new WebSocket('ws://example').bufferedAmount, 0, 'the bufferedAmount is set to 0');
  t.is(new WebSocket('ws://example').binaryType, 'blob', 'the binaryType is set to blob');

  t.is(WebSocket.CONNECTING, 0, 'CONNECTING is correctly set');
  t.is(WebSocket.OPEN, 1, 'OPEN is correctly set');
  t.is(WebSocket.CLOSING, 2, 'CLOSING is correctly set');
  t.is(WebSocket.CLOSED, 3, 'CLOSED is correctly set');
});

test.cb('that once the connection queue is called, if there is a server it connects', t => {
  const { WebSocket, Server } = createMocks();

  const onopenSpy = sinon.spy();
  const onerrorSpy = sinon.spy();
  const websocket = new WebSocket('ws://example.com/foo');
  const server = new Server('ws://example.com/foo');
  websocket.onopen = onopenSpy;

  setTimeout(() => {
    t.is(websocket.readyState, 1);
    t.true(onopenSpy.calledOnce);
    t.true(onerrorSpy.notCalled);

    t.deepEqual(websocket.__getNetworkConnection().urlMap, {
      'ws://example.com/foo': {
        websockets: [websocket],
        server,
        roomMemberships: {}
      }
    });

    t.end();
  }, 0);
});

test.cb('that once the connection queue is called, if there is no server it fails', t => {
  const { WebSocket } = createMocks();

  const onopenSpy = sinon.spy();
  const onerrorSpy = sinon.spy();
  const websocket = new WebSocket('ws://example.com/foo');
  websocket.onopen = onopenSpy;
  websocket.onerror = onerrorSpy;

  setTimeout(() => {
    t.is(websocket.readyState, 3);
    t.true(onopenSpy.notCalled);
    t.true(onerrorSpy.calledOnce);

    t.deepEqual(websocket.__getNetworkConnection().urlMap, {});

    t.end();
  }, 0);
});

test('calling send while the websocket is connecting throws an error', t => {
  const { WebSocket, Server } = createMocks();
  const server = new Server('ws://example.com'); // eslint-disable-line no-unused-vars

  t.throws(
    () => {
      const websocket = new WebSocket('ws://example.com');
      websocket.send('foo-bar');
    },
    "Failed to execute 'send' on 'WebSocket': Still in CONNECTING state.",
    'calling send while the websocket is connecting throws an error'
  );
});

test('that if code is present, but is not 1000 nor in the range 3000 to 4999, inclusive, throw an error', t => {
  const { WebSocket } = createMocks();
  const websocket = new WebSocket('ws://example.com');

  t.throws(
    () => websocket.close('NaN'),
    "Failed to execute 'close' on 'WebSocket': The code must be either 1000, or between 3000 and 4999. NaN is neither.",
    'close code must be a number'
  );
  t.throws(
    () => websocket.close(2999),
    "Failed to execute 'close' on 'WebSocket': " +
    'The code must be either 1000, or between 3000 and 4999. 2999 is neither.',
    'close code must be 1000 or between 3000-4999'
  );
  t.throws(
    () => websocket.close(5000),
    "Failed to execute 'close' on 'WebSocket': " +
    'The code must be either 1000, or between 3000 and 4999. 5000 is neither.',
    'close code must be 1000 or between 3000-4999'
  );
});

test('reason is present and is longer than 123 bytes it throws "SyntaxError" DOMException', t => {
  const { WebSocket } = createMocks();
  const websocket = new WebSocket('ws://example.com');

  t.throws(
    () =>
      websocket.close(
        1000,
        'some very long string some very long string some very long string ' +
        'some very long string some very long string some very long string'
      ),
    "Failed to execute 'close' on 'WebSocket': The message must not be greater than 123 bytes."
  );
});

test.skip('if readyState is CLOSING, do nothing', t => {
  const { WebSocket } = createMocks();
  const websocket = new WebSocket('ws://example.com');

  websocket.readyState = WebSocket.CLOSING;
  websocket.close();

  // TODO: mock that nothing is happening
  t.true(true);
});

test.skip('if readyState is CLOSED, do nothing', t => {
  const { WebSocket } = createMocks();
  const websocket = new WebSocket('ws://example.com');

  websocket.readyState = WebSocket.CLOSED;
  websocket.close();

  // TODO: mock that nothing is happening
  t.true(true);
});

test('if readyState is CONNECTING, fail the connection and set the readyState to CLOSING', t => {
  const { WebSocket } = createMocks();
  const websocket = new WebSocket('ws://example.com');

  websocket.readyState = WebSocket.CONNECTING;
  websocket.close();

  // TODO: we have to look into the closing algorithm
  t.is(websocket.readyState, WebSocket.CLOSING);
});

test.cb('that creating a websocket with no server invokes the onerror method', t => {
  const { WebSocket } = createMocks();

  const mockSocket = new WebSocket('ws://localhost:8080');
  mockSocket.onerror = function error(event) {
    t.is(event.target.readyState, WebSocket.CLOSED, 'onerror fires as expected');
    t.end();
  };
});

test.cb('that onopen is called after successfully connection to the server', t => {
  const { WebSocket, Server } = createMocks();

  // eslint-disable-next-line no-unused-vars
  const server = new Server('ws://localhost:8080');
  const mockSocket = new WebSocket('ws://localhost:8080');

  mockSocket.onopen = function open(event) {
    t.is(event.target.readyState, WebSocket.OPEN, 'onopen fires as expected');
    t.end();
  };
});

test.cb.skip('that failing the verifyClient check invokes the onerror method', t => {
  const { Server, WebSocket } = createMocks();

  // eslint-disable-next-line no-unused-vars
  const server = new Server('ws://localhost:8080', {
    verifyClient: () => false
  });
  const mockSocket = new WebSocket('ws://localhost:8080');

  mockSocket.onerror = function open(event) {
    t.is(event.target.readyState, WebSocket.CLOSED, 'onerror fires as expected');
    t.end();
  };
});

test.cb.skip('that failing the verifyClient check removes the websocket from the networkBridge', t => {
  const { WebSocket, Server } = createMocks();

  const server = new Server('ws://localhost:8080', {
    verifyClient: () => false
  });
  const mockSocket = new WebSocket('ws://localhost:8080');

  mockSocket.onclose = function close() {
    const urlMap = mockSocket.__getNetworkConnection().urlMap['ws://localhost:8080/'];
    t.is(urlMap.websockets.length, 0, 'the websocket was removed from the network bridge');
    server.close();
    t.end();
  };
});

test.cb('that verifyClient is only invoked if it is a function', t => {
  const { WebSocket, Server } = createMocks();

  // eslint-disable-next-line no-unused-vars
  const server = new Server('ws://localhost:8080', {
    verifyClient: false
  });
  const mockSocket = new WebSocket('ws://localhost:8080');

  mockSocket.onopen = function open(event) {
    t.is(event.target.readyState, WebSocket.OPEN, 'onopen fires as expected');
    t.end();
  };
});

test.cb('that onmessage is called after the server sends a message', t => {
  const { WebSocket, Server } = createMocks();

  const testServer = new Server('ws://localhost:8080');

  testServer.on('connection', server => server.send('Testing'));

  const mockSocket = new WebSocket('ws://localhost:8080');

  mockSocket.onmessage = function message(event) {
    t.is(event.data, 'Testing', 'onmessage fires as expected');
    t.end();
  };
});

test.cb('that onclose is called after the client closes the connection', t => {
  const { WebSocket, Server } = createMocks();

  const testServer = new Server('ws://localhost:8080');

  testServer.on('connection', server => server.send('Testing'));

  const mockSocket = new WebSocket('ws://localhost:8080');

  mockSocket.onmessage = function message() {
    mockSocket.close();
  };

  mockSocket.onclose = function close(event) {
    t.is(event.target.readyState, WebSocket.CLOSED, 'onclose fires as expected');
    t.end();
  };
});

test.cb('that the server gets called when the client sends a message', t => {
  const { WebSocket, Server } = createMocks();
  const testServer = new Server('ws://localhost:8080');

  testServer.on('message', data => {
    t.is(data, 'Testing', 'on message fires as expected');
    t.end();
  });

  const mockSocket = new WebSocket('ws://localhost:8080');

  mockSocket.onopen = function open() {
    this.send('Testing');
  };
});

test.cb('that the onopen function will only be called once for each client', t => {
  const { WebSocket, Server } = createMocks();
  const socketUrl = 'ws://localhost:8080';
  const mockServer = new Server(socketUrl);
  const websocketFoo = new WebSocket(socketUrl);
  const websocketBar = new WebSocket(socketUrl);

  websocketFoo.onopen = function open() {
    t.true(true, 'mocksocket onopen fires as expected');
  };

  websocketBar.onopen = function open() {
    t.true(true, 'mocksocket onopen fires as expected');
    mockServer.close();
    t.end();
  };
});

test.cb('closing a client will only close itself and not other clients', t => {
  const { WebSocket, Server } = createMocks();
  // eslint-disable-next-line no-unused-vars
  const server = new Server('ws://localhost:8080');
  const websocketFoo = new WebSocket('ws://localhost:8080');
  const websocketBar = new WebSocket('ws://localhost:8080');

  websocketFoo.onclose = function close() {
    t.true(false, 'mocksocket should not close');
  };

  websocketBar.onopen = function open() {
    this.close();
  };

  websocketBar.onclose = function close() {
    t.true(true, 'mocksocket onclose fires as expected');
    t.end();
  };
});

test.cb('mock clients can send messages to the right mock server', t => {
  const { WebSocket, Server } = createMocks();

  const serverFoo = new Server('ws://localhost:8080');
  const serverBar = new Server('ws://localhost:8081');
  const dataFoo = 'foo';
  const dataBar = 'bar';
  const socketFoo = new WebSocket('ws://localhost:8080');
  const socketBar = new WebSocket('ws://localhost:8081');

  serverFoo.on('connection', server => {
    t.true(true, 'mock server on connection fires as expected');

    server.on('message', data => t.is(data, dataFoo));
  });

  serverBar.on('connection', server => {
    t.true(true, 'mock server on connection fires as expected');

    server.on('message', data => {
      t.is(data, dataBar);
      t.end();
    });
  });

  socketFoo.onopen = function open() {
    t.true(true, 'mocksocket onopen fires as expected');
    this.send(dataFoo);
  };

  socketBar.onopen = function open() {
    t.true(true, 'mocksocket onopen fires as expected');
    this.send(dataBar);
  };
});

test.cb('that closing a websocket removes it from the network', t => {
  const { WebSocket, Server } = createMocks();
  const server = new Server('ws://localhost:8080');
  const socket = new WebSocket('ws://localhost:8080');

  socket.onopen = function open() {
    const urlMap = socket.__getNetworkConnection().urlMap['ws://localhost:8080/'];
    t.is(urlMap.websockets.length, 1, 'the websocket is in the network');
    t.deepEqual(urlMap.websockets[0], this, 'the websocket is in the network');
    this.close();
  };

  socket.onclose = function close() {
    const urlMap = socket.__getNetworkConnection().urlMap['ws://localhost:8080/'];
    t.is(urlMap.websockets.length, 0, 'the websocket was removed from the network');
    server.close();
    t.end();
  };
});
