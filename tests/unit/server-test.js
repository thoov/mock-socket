import QUnit from 'qunit';
import Server from '../src/server';
import WebSocket from '../src/websocket';
import EventTarget from '../src/event-target';
import networkBridge from '../src/network-bridge';

QUnit.module('Unit - Server');

QUnit.test('that server inherents EventTarget methods', assert => {
  assert.expect(1);

  var myServer = new Server('ws://not-real');
  assert.ok(myServer instanceof EventTarget);
  myServer.close();
});

QUnit.test('that after creating a server it is added to the network bridge', assert => {
  assert.expect(2);

  var myServer = new Server('ws://not-real/');
  var urlMap = networkBridge.urlMap['ws://not-real/'];

  assert.deepEqual(urlMap.server, myServer, 'server was correctly added to the urlMap');
  myServer.close();
  assert.deepEqual(networkBridge.urlMap, {}, 'the urlMap was cleared after the close call');
});

QUnit.test('that callback functions can be added to the listeners object', assert => {
  assert.expect(2);

  var myServer = new Server('ws://not-real/');

  myServer.on('message', () => {});
  myServer.on('close', () => {});

  assert.equal(myServer.listeners.message.length, 1);
  assert.equal(myServer.listeners.close.length, 1);

  myServer.close();
});

QUnit.test('that calling clients() returns the correct clients', assert => {
  assert.expect(2);

  var myServer = new Server('ws://not-real/');
  var socketFoo = new WebSocket('ws://not-real/');
  var socketBar = new WebSocket('ws://not-real/');

  assert.equal(myServer.clients().length, 2, 'calling clients returns the 2 websockets');
  assert.deepEqual(myServer.clients(), [socketFoo, socketBar], 'The clients matches [socketFoo, socketBar]');

  myServer.close();
});

QUnit.test('that calling send will trigger the onmessage of websockets', assert => {
  assert.expect(2);

  var myServer  = new Server('ws://not-real/');
  var done      = assert.async();

  myServer.on('connection', (server, socket) => {
    myServer.send('Testing', {websocket: socket});
  });

  var socketFoo = new WebSocket('ws://not-real/');
  var socketBar = new WebSocket('ws://not-real/');
  socketFoo.onmessage = () => {
    assert.ok(true, 'socketFoo onmessage was correctly called');
  };

  socketBar.onmessage = () => {
    assert.ok(true, 'socketBar onmessage was correctly called');
    myServer.close();
    done();
  };
});

QUnit.test('that calling close will trigger the onclose of websockets', assert => {
  assert.expect(6);

  var myServer  = new Server('ws://not-real/');
  var done      = assert.async();
  var counter   = 0;

  myServer.on('connection', () => {
    counter++;
    if (counter === 2) {
      myServer.close({
        code: 1005,
        reason: 'Some reason'
      });
    }
  });

  var socketFoo = new WebSocket('ws://not-real/');
  var socketBar = new WebSocket('ws://not-real/');
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

QUnit.test('a namespaced server is added to the network bridge', assert => {
  assert.expect(2);

  var myServer = Server.of('/my-namespace');
  var urlMap = networkBridge.urlMap['/my-namespace'];

  assert.deepEqual(urlMap.server, myServer, 'server was correctly added to the urlMap');
  myServer.close();
  assert.deepEqual(networkBridge.urlMap, {}, 'the urlMap was cleared after the close call');
});
