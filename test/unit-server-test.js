import assert from 'assert';
import Server from '../src/server';
import WebSocket from '../src/websocket';
import EventTarget from '../src/event-target';
import networkBridge from '../src/network-bridge';
import globalObject from '../src/helpers/global-object';

describe('Unit - Server', function unitTest() {
  it('that server inherents EventTarget methods', () => {
    const myServer = new Server('ws://not-real');
    assert.ok(myServer instanceof EventTarget);
    myServer.close();
  });

  it('that after creating a server it is added to the network bridge', () => {
    const myServer = new Server('ws://not-real/');
    const urlMap = networkBridge.urlMap['ws://not-real/'];

    assert.deepEqual(urlMap.server, myServer, 'server was correctly added to the urlMap');
    myServer.close();
    assert.deepEqual(networkBridge.urlMap, {}, 'the urlMap was cleared after the close call');
  });

  it('that callback functions can be added to the listeners object', () => {
    const myServer = new Server('ws://not-real/');

    myServer.on('message', () => {});
    myServer.on('close', () => {});

    assert.equal(myServer.listeners.message.length, 1);
    assert.equal(myServer.listeners.close.length, 1);

    myServer.close();
  });

  it('that calling clients() returns the correct clients', () => {
    const myServer = new Server('ws://not-real/');
    const socketFoo = new WebSocket('ws://not-real/');
    const socketBar = new WebSocket('ws://not-real/');

    assert.equal(myServer.clients().length, 2, 'calling clients returns the 2 websockets');
    assert.deepEqual(myServer.clients(), [socketFoo, socketBar], 'The clients matches [socketFoo, socketBar]');

    myServer.close();
  });

  it('that calling send will trigger the onmessage of websockets', done => {
    const myServer = new Server('ws://not-real/');

    myServer.on('connection', (server, socket) => {
      myServer.send('Testing', { websocket: socket });
    });

    const socketFoo = new WebSocket('ws://not-real/');
    const socketBar = new WebSocket('ws://not-real/');
    socketFoo.onmessage = () => {
      assert.ok(true, 'socketFoo onmessage was correctly called');
    };

    socketBar.onmessage = () => {
      assert.ok(true, 'socketBar onmessage was correctly called');
      myServer.close();
      done();
    };
  });

  it('that calling close will trigger the onclose of websockets', done => {
    const myServer = new Server('ws://not-real/');
    let counter = 0;

    myServer.on('connection', () => {
      counter++;
      if (counter === 2) {
        myServer.close({
          code: 1005,
          reason: 'Some reason',
        });
      }
    });

    const socketFoo = new WebSocket('ws://not-real/');
    const socketBar = new WebSocket('ws://not-real/');
    socketFoo.onclose = event => {
      assert.ok(true, 'socketFoo onmessage was correctly called');
      assert.equal(event.code, 1005, 'the correct code was recieved');
      assert.equal(event.reason, 'Some reason', 'the correct reason was recieved');
    };

    socketBar.onclose = event => {
      assert.ok(true, 'socketBar onmessage was correctly called');
      assert.equal(event.code, 1005, 'the correct code was recieved');
      assert.equal(event.reason, 'Some reason', 'the correct reason was recieved');
      done();
    };
  });

  it('a namespaced server is added to the network bridge', () => {
    const myServer = Server.of('/my-namespace');
    const urlMap = networkBridge.urlMap['/my-namespace'];

    assert.deepEqual(urlMap.server, myServer, 'server was correctly added to the urlMap');
    myServer.close();
    assert.deepEqual(networkBridge.urlMap, {}, 'the urlMap was cleared after the close call');
  });

  it('start and stop correctly sets and remove global WebSocket state', () => {
    const myServer = new Server('ws://example.com');
    const globalObj = globalObject();
    const originalWebSocket = globalObj.WebSocket;

    myServer.start();

    assert.deepEqual(globalObj.WebSocket, WebSocket, 'WebSocket class is defined on the globalObject');
    assert.deepEqual(myServer.originalWebSocket, originalWebSocket, 'the original websocket is stored');

    myServer.stop();

    assert.equal(myServer.originalWebSocket, null, 'server forgets about the original websocket');
    assert.deepEqual(globalObj.WebSocket, originalWebSocket, ' the original websocket is returned to the global object');
  });
});
