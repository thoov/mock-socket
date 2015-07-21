import QUnit from 'qunit';
import networkBridge from './src/network-bridge';

const fakeObject = { foo: 'bar' };

QUnit.module('Unit - Network Bridge', {
  teardown() {
    networkBridge.urlMap = {};
  }
});

QUnit.test('that network bridge has no connections be defualt', assert => {
  assert.expect(1);
  assert.deepEqual(networkBridge.urlMap, {}, 'Url map is empty by default');
});

QUnit.test('that network bridge has no connections be defualt', assert => {
  assert.expect(2);

  var result = networkBridge.attachWebSocket(fakeObject, 'ws://localhost:8080');

  assert.notOk(result, 'no server was returned as a server must be added first');
  assert.deepEqual(networkBridge.urlMap, {}, 'nothing was added to the url map');
});

QUnit.test('that attachServer adds a server to url map', assert => {
  assert.expect(3);

  var result     = networkBridge.attachServer(fakeObject, 'ws://localhost:8080');
  var connection = networkBridge.urlMap['ws://localhost:8080'];

  assert.deepEqual(result, fakeObject, 'the server was returned because it was successfully added to the url map');
  assert.deepEqual(connection.server, fakeObject, 'fakeObject was added to the server property');
  assert.equal(connection.websockets.length, 0, 'websocket property was set to an empty array');
});

QUnit.test('that attachServer does nothing if a server is already attached to a given url', assert => {
  assert.expect(4);

  var result     = networkBridge.attachServer(fakeObject, 'ws://localhost:8080');
  var result2    = networkBridge.attachServer({hello: 'world'}, 'ws://localhost:8080');
  var connection = networkBridge.urlMap['ws://localhost:8080'];

  assert.notOk(result2, 'no server was returned as a server was already listening to that url');
  assert.deepEqual(result, fakeObject, 'the server was returned because it was successfully added to the url map');
  assert.deepEqual(connection.server, fakeObject, 'fakeObject was added to the server property');
  assert.equal(connection.websockets.length, 0, 'websocket property was set to an empty array');
});

QUnit.test('that attachWebSocket will add a websocket to the url map', assert => {
  assert.expect(4);

  var resultServer     = networkBridge.attachServer(fakeObject, 'ws://localhost:8080');
  var resultWebSocket  = networkBridge.attachWebSocket(fakeObject, 'ws://localhost:8080');
  var connection       = networkBridge.urlMap['ws://localhost:8080'];

  assert.deepEqual(resultServer, fakeObject, 'server returned because it was successfully added to the url map');
  assert.deepEqual(resultWebSocket, fakeObject, 'server returned as the websocket was successfully added to the map');
  assert.deepEqual(connection.websockets[0], fakeObject, 'fakeObject was added to the websockets array');
  assert.equal(connection.websockets.length, 1, 'websocket property contains only the websocket object');
});

QUnit.test('that attachWebSocket will add the same websocket only once', assert => {
  assert.expect(5);

  var resultServer     = networkBridge.attachServer(fakeObject, 'ws://localhost:8080');
  var resultWebSocket  = networkBridge.attachWebSocket(fakeObject, 'ws://localhost:8080');
  var resultWebSocket2 = networkBridge.attachWebSocket(fakeObject, 'ws://localhost:8080');
  var connection       = networkBridge.urlMap['ws://localhost:8080'];

  assert.deepEqual(resultServer, fakeObject, 'server returned because it was successfully added to the url map');
  assert.deepEqual(resultWebSocket, fakeObject, 'server returned as the websocket was successfully added to the map');
  assert.notOk(resultWebSocket2, 'nothing added as the websocket already existed inside the url map');
  assert.deepEqual(connection.websockets[0], fakeObject, 'fakeObject was added to the websockets array');
  assert.equal(connection.websockets.length, 1, 'websocket property contains only the websocket object');
});

QUnit.test('that server and websocket lookups return the correct objects', assert => {
  assert.expect(3);

  networkBridge.attachServer(fakeObject, 'ws://localhost:8080');
  networkBridge.attachWebSocket(fakeObject, 'ws://localhost:8080');

  var serverLookup    = networkBridge.serverLookup('ws://localhost:8080');
  var websocketLookup = networkBridge.websocketsLookup('ws://localhost:8080');

  assert.deepEqual(serverLookup, fakeObject, 'server correctly returned');
  assert.deepEqual(websocketLookup, [fakeObject], 'websockets correctly returned');
  assert.deepEqual(websocketLookup.length, 1, 'the correct number of websockets are returned');
});

QUnit.test('that removing server and websockets works correctly', assert => {
  assert.expect(3);

  networkBridge.attachServer(fakeObject, 'ws://localhost:8080');
  networkBridge.attachWebSocket(fakeObject, 'ws://localhost:8080');

  var websocketLookup = networkBridge.websocketsLookup('ws://localhost:8080');
  assert.deepEqual(websocketLookup.length, 1, 'the correct number of websockets are returned');

  networkBridge.removeWebSocket(fakeObject, 'ws://localhost:8080');

  websocketLookup = networkBridge.websocketsLookup('ws://localhost:8080');
  assert.deepEqual(websocketLookup.length, 0, 'the correct number of websockets are returned');

  networkBridge.removeServer('ws://localhost:8080');
  assert.deepEqual(networkBridge.urlMap, {}, 'Url map is back in its default state');
});
