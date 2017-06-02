import test from 'ava';
import { createMocks } from './index';
import EventTarget from './event/target';
import globalObject from './utils/global-object';

test('that server inherents EventTarget methods', t => {
  const { Server } = createMocks();
  const myServer = new Server('ws://not-real');
  t.true(myServer instanceof EventTarget);
  myServer.close();
});

test('that after creating a server it is added to the network bridge', t => {
  const { Server } = createMocks();
  const myServer = new Server('ws://not-real/');
  const urlMap = myServer.__getNetworkConnection().urlMap['ws://not-real/'];

  t.deepEqual(urlMap.server, myServer, 'server was correctly added to the urlMap');
  myServer.close();
  t.deepEqual(myServer.__getNetworkConnection().urlMap, {}, 'the urlMap was cleared after the close call');
});

test('that callback functions can be added to the listeners object', t => {
  const { Server } = createMocks();
  const myServer = new Server('ws://not-real/');

  myServer.on('message', () => {});
  myServer.on('close', () => {});

  t.is(myServer.listeners.message.length, 1);
  t.is(myServer.listeners.close.length, 1);

  myServer.close();
});

test.cb('that calling clients() returns the correct clients', t => {
  const { WebSocket, Server } = createMocks();
  const myServer = new Server('ws://not-real/');
  const socketFoo = new WebSocket('ws://not-real/');
  const socketBar = new WebSocket('ws://not-real/');

  setTimeout(() => {
    t.is(myServer.clients().length, 2, 'calling clients returns the 2 websockets');
    t.deepEqual(myServer.clients(), [socketFoo, socketBar], 'The clients matches [socketFoo, socketBar]');
    myServer.close();
    t.end();
  }, 0);
});

// TODO: this has the same test name as above ?
test.cb('that calling clients() returns the correct clients', t => {
  const { WebSocket, Server } = createMocks();
  const myServer = new Server('ws://not-real/');

  myServer.on('connection', (server, socket) => {
    myServer.send('Testing', { websocket: socket });
  });

  const socketFoo = new WebSocket('ws://not-real/');
  const socketBar = new WebSocket('ws://not-real/');
  socketFoo.onmessage = () => {
    t.true(true, 'socketFoo onmessage was correctly called');
  };

  socketBar.onmessage = () => {
    t.true(true, 'socketBar onmessage was correctly called');
    myServer.close();
    t.end();
  };
});

test.cb('that calling close will trigger the onclose of websockets', t => {
  const { WebSocket, Server } = createMocks();
  const myServer = new Server('ws://not-real/');
  let counter = 0;

  myServer.on('connection', () => {
    counter += 1;
    if (counter === 2) {
      myServer.close({
        code: 1005,
        reason: 'Some reason'
      });
    }
  });

  const socketFoo = new WebSocket('ws://not-real/');
  const socketBar = new WebSocket('ws://not-real/');
  socketFoo.onclose = event => {
    t.true(true, 'socketFoo onmessage was correctly called');
    t.is(event.code, 1005, 'the correct code was recieved');
    t.is(event.reason, 'Some reason', 'the correct reason was recieved');
  };

  socketBar.onclose = event => {
    t.pass(true, 'socketBar onmessage was correctly called');
    t.is(event.code, 1005, 'the correct code was recieved');
    t.is(event.reason, 'Some reason', 'the correct reason was recieved');
    t.end();
  };
});

test('a namespaced server is added to the network bridge', t => {
  const { Server } = createMocks();
  const myServer = Server.of('/my-namespace');
  const urlMap = myServer.__getNetworkConnection().urlMap['/my-namespace'];

  t.deepEqual(urlMap.server, myServer, 'server was correctly added to the urlMap');
  myServer.close();
  t.deepEqual(myServer.__getNetworkConnection().urlMap, {}, 'the urlMap was cleared after the close call');
});

test('that calling close will trigger the onclose of websockets', t => {
  const { Server } = createMocks();
  const myServer = new Server('ws://example.com');
  const globalObj = globalObject();
  const originalWebSocket = globalObj.WebSocket;

  myServer.start();

  t.deepEqual(globalObj.WebSocket, WebSocket, 'WebSocket class is defined on the globalObject');
  t.deepEqual(myServer.originalWebSocket, originalWebSocket, 'the original websocket is stored');

  myServer.stop();

  t.is(myServer.originalWebSocket, null, 'server forgets about the original websocket');
  t.deepEqual(globalObj.WebSocket, originalWebSocket, 'the original websocket is returned to the global object');
});
