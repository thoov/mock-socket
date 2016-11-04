import test from 'ava';
import Server from '../../src/server';
import WebSocket from '../../src/websocket';
import networkBridge from '../../src/network-bridge';

test.afterEach(() => {
  networkBridge.urlMap = {};
});

test.cb('that creating a websocket with no server invokes the onerror method', (t) => {
  const mockSocket = new WebSocket('ws://localhost:8080');
  mockSocket.onerror = function error(event) {
    t.is(event.target.readyState, WebSocket.CLOSED, 'onerror fires as expected');
    t.end();
  };
});

test.cb('that onopen is called after successfully connection to the server', (t) => {
  const server = new Server('ws://localhost:8080');
  const mockSocket = new WebSocket('ws://localhost:8080');

  mockSocket.onopen = function open(event) {
    t.is(event.target.readyState, WebSocket.OPEN, 'onopen fires as expected');
    t.end();
  };
});

test.cb('that failing the verifyClient check invokes the onerror method', (t) => {
  const server = new Server('ws://localhost:8080', {
    verifyClient: () => false
  });
  const mockSocket = new WebSocket('ws://localhost:8080');

  mockSocket.onerror = function open(event) {
    t.is(event.target.readyState, WebSocket.CLOSED, 'onerror fires as expected');
    t.end();
  };
});

test.cb('that failing the verifyClient check removes the websocket from the networkBridge', (t) => {
  const server = new Server('ws://localhost:8080', {
    verifyClient: () => false
  });
  const mockSocket = new WebSocket('ws://localhost:8080');

  mockSocket.onclose = function close() {
    const urlMap = networkBridge.urlMap['ws://localhost:8080/'];
    t.is(urlMap.websockets.length, 0, 'the websocket was removed from the network bridge');
    server.close();
    t.end();
  };
});

test.cb('that verifyClient is only invoked if it is a function', (t) => {
  const server = new Server('ws://localhost:8080', {
    verifyClient: false
  });
  const mockSocket = new WebSocket('ws://localhost:8080');

  mockSocket.onopen = function open(event) {
    t.is(event.target.readyState, WebSocket.OPEN, 'onopen fires as expected');
    t.end();
  };
});

test.cb('that onmessage is called after the server sends a message', (t) => {
  const testServer = new Server('ws://localhost:8080');

  testServer.on('connection', (server) => {
    server.send('Testing');
  });

  const mockSocket = new WebSocket('ws://localhost:8080');

  mockSocket.onmessage = function message(event) {
    t.is(event.data, 'Testing', 'onmessage fires as expected');
    t.end();
  };
});

test.cb('that onclose is called after the client closes the connection', (t) => {
  const testServer = new Server('ws://localhost:8080');

  testServer.on('connection', (server) => {
    server.send('Testing');
  });

  const mockSocket = new WebSocket('ws://localhost:8080');

  mockSocket.onmessage = function message() {
    mockSocket.close();
  };

  mockSocket.onclose = function close(event) {
    t.is(event.target.readyState, WebSocket.CLOSED, 'onclose fires as expected');
    t.end();
  };
});

test.cb('that the server gets called when the client sends a message', (t) => {
  const testServer = new Server('ws://localhost:8080');

  testServer.on('message', (data) => {
    t.is(data, 'Testing', 'on message fires as expected');
    t.end();
  });

  const mockSocket = new WebSocket('ws://localhost:8080');

  mockSocket.onopen = function open() {
    this.send('Testing');
  };
});

test.cb('that the onopen function will only be called once for each client', (t) => {
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

test.cb('closing a client will only close itself and not other clients', (t) => {
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

test.cb('mock clients can send messages to the right mock server', (t) => {
  const serverFoo = new Server('ws://localhost:8080');
  const serverBar = new Server('ws://localhost:8081');
  const dataFoo = 'foo';
  const dataBar = 'bar';
  const socketFoo = new WebSocket('ws://localhost:8080');
  const socketBar = new WebSocket('ws://localhost:8081');

  serverFoo.on('connection', (server) => {
    t.true(true, 'mock server on connection fires as expected');

    server.on('message', (data) => {
      t.is(data, dataFoo);
    });
  });

  serverBar.on('connection', (server) => {
    t.true(true, 'mock server on connection fires as expected');

    server.on('message', (data) => {
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

test.cb('that closing a websocket removes it from the network bridge', (t) => {
  const server = new Server('ws://localhost:8080');
  const socket = new WebSocket('ws://localhost:8080');

  socket.onopen = function open() {
    const urlMap = networkBridge.urlMap['ws://localhost:8080/'];
    t.is(urlMap.websockets.length, 1, 'the websocket is in the network bridge');
    t.deepEqual(urlMap.websockets[0], this, 'the websocket is in the network bridge');
    this.close();
  };

  socket.onclose = function close() {
    const urlMap = networkBridge.urlMap['ws://localhost:8080/'];
    t.is(urlMap.websockets.length, 0, 'the websocket was removed from the network bridge');
    server.close();
    t.end();
  };
});
