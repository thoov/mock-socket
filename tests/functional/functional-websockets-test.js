import assert from 'assert';
import Server from '../../src/server';
import WebSocket from '../../src/websocket';
import networkBridge from '../../src/network-bridge';

describe('Functional - WebSockets', () => {
  afterEach(() => {
    networkBridge.urlMap = {};
  });

  it('that creating a websocket with no server invokes the onerror method', (done) => {
    const mockSocket = new WebSocket('ws://localhost:8080');
    mockSocket.onerror = function error(event) {
      assert.equal(event.target.readyState, WebSocket.CLOSED, 'onerror fires as expected');
      done();
    };
  });

  it('that onopen is called after successfully connection to the server', (done) => {
    const server = new Server('ws://localhost:8080');
    const mockSocket = new WebSocket('ws://localhost:8080');

    mockSocket.onopen = function open(event) {
      assert.equal(event.target.readyState, WebSocket.OPEN, 'onopen fires as expected');
      done();
    };
  });

  it('that failing the verifyClient check invokes the onerror method', (done) => {
    const server = new Server('ws://localhost:8080', {
      verifyClient: () => false
    });
    const mockSocket = new WebSocket('ws://localhost:8080');

    mockSocket.onerror = function open(event) {
      assert.equal(event.target.readyState, WebSocket.CLOSED, 'onerror fires as expected');
      done();
    };
  });

  it('that failing the verifyClient check removes the websocket from the networkBridge', (done) => {
    const server = new Server('ws://localhost:8080', {
      verifyClient: () => false
    });
    const mockSocket = new WebSocket('ws://localhost:8080');

    mockSocket.onclose = function close() {
      const urlMap = networkBridge.urlMap['ws://localhost:8080/'];
      assert.equal(urlMap.websockets.length, 0, 'the websocket was removed from the network bridge');
      server.close();
      done();
    };
  });

  it('that verifyClient is only invoked if it is a function', (done) => {
    const server = new Server('ws://localhost:8080', {
      verifyClient: false
    });
    const mockSocket = new WebSocket('ws://localhost:8080');

    mockSocket.onopen = function open(event) {
      assert.equal(event.target.readyState, WebSocket.OPEN, 'onopen fires as expected');
      done();
    };
  });

  it('that onmessage is called after the server sends a message', (done) => {
    const test = new Server('ws://localhost:8080');

    test.on('connection', (server) => {
      server.send('Testing');
    });

    const mockSocket = new WebSocket('ws://localhost:8080');

    mockSocket.onmessage = function message(event) {
      assert.equal(event.data, 'Testing', 'onmessage fires as expected');
      done();
    };
  });

  it('that onclose is called after the client closes the connection', (done) => {
    const test = new Server('ws://localhost:8080');

    test.on('connection', (server) => {
      server.send('Testing');
    });

    const mockSocket = new WebSocket('ws://localhost:8080');

    mockSocket.onmessage = function message() {
      mockSocket.close();
    };

    mockSocket.onclose = function close(event) {
      assert.equal(event.target.readyState, WebSocket.CLOSED, 'onclose fires as expected');
      done();
    };
  });

  it('that the server gets called when the client sends a message', (done) => {
    const test = new Server('ws://localhost:8080');

    test.on('message', (data) => {
      assert.equal(data, 'Testing', 'on message fires as expected');
      done();
    });

    const mockSocket = new WebSocket('ws://localhost:8080');

    mockSocket.onopen = function open() {
      this.send('Testing');
    };
  });

  it('that the onopen function will only be called once for each client', (done) => {
    const socketUrl = 'ws://localhost:8080';
    const mockServer = new Server(socketUrl);
    const websocketFoo = new WebSocket(socketUrl);
    const websocketBar = new WebSocket(socketUrl);

    websocketFoo.onopen = function open() {
      assert.ok(true, 'mocksocket onopen fires as expected');
    };

    websocketBar.onopen = function open() {
      assert.ok(true, 'mocksocket onopen fires as expected');
      mockServer.close();
      done();
    };
  });

  it('closing a client will only close itself and not other clients', (done) => {
    const server = new Server('ws://localhost:8080');
    const websocketFoo = new WebSocket('ws://localhost:8080');
    const websocketBar = new WebSocket('ws://localhost:8080');

    websocketFoo.onclose = function close() {
      assert.ok(false, 'mocksocket should not close');
    };

    websocketBar.onopen = function open() {
      this.close();
    };

    websocketBar.onclose = function close() {
      assert.ok(true, 'mocksocket onclose fires as expected');
      done();
    };
  });

  it('mock clients can send messages to the right mock server', (done) => {
    const serverFoo = new Server('ws://localhost:8080');
    const serverBar = new Server('ws://localhost:8081');
    const dataFoo = 'foo';
    const dataBar = 'bar';
    const socketFoo = new WebSocket('ws://localhost:8080');
    const socketBar = new WebSocket('ws://localhost:8081');

    serverFoo.on('connection', (server) => {
      assert.ok(true, 'mock server on connection fires as expected');

      server.on('message', (data) => {
        assert.equal(data, dataFoo);
      });
    });

    serverBar.on('connection', (server) => {
      assert.ok(true, 'mock server on connection fires as expected');

      server.on('message', (data) => {
        assert.equal(data, dataBar);
        done();
      });
    });

    socketFoo.onopen = function open() {
      assert.ok(true, 'mocksocket onopen fires as expected');
      this.send(dataFoo);
    };

    socketBar.onopen = function open() {
      assert.ok(true, 'mocksocket onopen fires as expected');
      this.send(dataBar);
    };
  });

  it('that closing a websocket removes it from the network bridge', (done) => {
    const server = new Server('ws://localhost:8080');
    const socket = new WebSocket('ws://localhost:8080');

    socket.onopen = function open() {
      const urlMap = networkBridge.urlMap['ws://localhost:8080/'];
      assert.equal(urlMap.websockets.length, 1, 'the websocket is in the network bridge');
      assert.deepEqual(urlMap.websockets[0], this, 'the websocket is in the network bridge');
      this.close();
    };

    socket.onclose = function close() {
      const urlMap = networkBridge.urlMap['ws://localhost:8080/'];
      assert.equal(urlMap.websockets.length, 0, 'the websocket was removed from the network bridge');
      server.close();
      done();
    };
  });
});
