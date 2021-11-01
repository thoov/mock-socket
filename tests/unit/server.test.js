import test from 'ava';
import Server from '../../src/server';
import WebSocket from '../../src/websocket';
import EventTarget from '../../src/event/target';
import networkBridge from '../../src/network-bridge';
import globalObject from '../../src/helpers/global-object';

test('that server inherents EventTarget methods', t => {
  const myServer = new Server('ws://not-real');
  t.true(myServer instanceof EventTarget);
  myServer.close();
});

test('that after creating a server it is added to the network bridge', t => {
  const myServer = new Server('ws://not-real/');
  const urlMap = networkBridge.urlMap['ws://not-real/'];

  t.deepEqual(urlMap.server, myServer, 'server was correctly added to the urlMap');
  myServer.close();
  t.deepEqual(networkBridge.urlMap, {}, 'the urlMap was cleared after the close call');
});

test('that callback functions can be added to the listeners object', t => {
  const myServer = new Server('ws://not-real/');

  myServer.on('message', () => {});
  myServer.on('close', () => {});

  t.is(myServer.listeners.message.length, 1);
  t.is(myServer.listeners.close.length, 1);

  myServer.close();
});

test('that calling clients() returns the correct clients', t => {
  const myServer = new Server('ws://not-real/');
  const socketFoo = new WebSocket('ws://not-real/');
  const socketBar = new WebSocket('ws://not-real/');

  t.is(myServer.clients().length, 2, 'calling clients returns the 2 websockets');
  t.deepEqual(myServer.clients(), [socketFoo, socketBar], 'The clients matches [socketFoo, socketBar]');

  myServer.close();
});

test.cb('that calling close will trigger the onclose of websockets', t => {
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

test.cb('that calling close for each client will trigger the onclose of websockets', t => {
  const myServer = new Server('ws://not-real/');
  let counter = 0;

  myServer.on('connection', () => {
    counter += 1;
    if (counter === 2) {
      myServer.clients()[0].close({
        code: 1000
      });
      myServer.clients()[1].close({
        code: 1005,
        reason: 'Some reason'
      });
    }
  });

  const socketFoo = new WebSocket('ws://not-real/');
  const socketBar = new WebSocket('ws://not-real/');
  socketFoo.onclose = event => {
    t.true(true, 'socketFoo onclose was correctly called');
    t.is(event.code, 1000, 'the correct code was recieved');
    t.is(event.reason, '', 'there is no reason');
  };

  socketBar.onclose = event => {
    t.pass(true, 'socketBar onclose was correctly called');
    t.is(event.code, 1005, 'the correct code was recieved');
    t.is(event.reason, 'Some reason', 'the correct reason was recieved');
    myServer.close();
    t.end();
  };
});

test('a namespaced server is added to the network bridge', t => {
  const myServer = Server.of('/my-namespace');
  const urlMap = networkBridge.urlMap['/my-namespace'];

  t.deepEqual(urlMap.server, myServer, 'server was correctly added to the urlMap');
  myServer.close();
  t.deepEqual(networkBridge.urlMap, {}, 'the urlMap was cleared after the close call');
});

test('that calling close will trigger the onclose of websockets', t => {
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

test.cb('that send will normalize data', t => {
  const myServer = new Server('ws://not-real/');

  myServer.on('connection', socket => {
    socket.send([1, 2]);
  });

  const socketFoo = new WebSocket('ws://not-real/');
  socketFoo.onmessage = message => {
    t.is(message.data, '1,2', 'data non string, non blob/arraybuffers get toStringed');
    myServer.close();
    t.end();
  };
});

test.cb('that the server socket callback argument is correctly scoped: send method', t => {
  const myServer = new Server('ws://not-real/');
  let counter = 0;

  myServer.on('connection', socket => {
    counter += 1;
    socket.send('a message');
  });

  const socket1 = new WebSocket('ws://not-real/');
  const socket2 = new WebSocket('ws://not-real/');
  socket1.onmessage = message => {
    t.is(message.data, 'a message');
    t.is(counter, 1);
  };
  socket2.onmessage = message => {
    t.is(message.data, 'a message');
    t.is(counter, 2);
    myServer.close();
    t.end();
  };
});

test.cb('that the server socket callback argument is correctly scoped: on method', t => {
  const myServer = new Server('ws://not-real/');
  let counter = 0;

  myServer.on('connection', socket => {
    socket.on('message', data => {
      counter += 1;

      t.is(data, `hello${counter}`);
      if (counter === 2) {
        myServer.close();
        t.end();
      }
    });
  });

  const socket1 = new WebSocket('ws://not-real/');
  const socket2 = new WebSocket('ws://not-real/');
  socket1.send('hello1');
  socket2.send('hello2');
});

test.cb('that the server socket callback argument is correctly scoped: close method', t => {
  const myServer = new Server('ws://not-real/');

  myServer.on('connection', socket => {
    socket.on('message', data => {
      socket.close({ code: parseInt(data, 10) });
    });
  });

  const socket1 = new WebSocket('ws://not-real/');
  const socket2 = new WebSocket('ws://not-real/');
  socket1.send('1001');
  socket2.send('1002');

  socket1.onclose = event => {
    t.is(event.code, 1001);
  };

  socket2.onclose = event => {
    t.is(event.code, 1002);
    myServer.close();
    t.end();
  };
});
