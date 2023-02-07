import test from 'ava';

import networkBridge from '../../src/network-bridge';

const fakeObject = { foo: 'bar' };

test.beforeEach(() => {
  networkBridge.urlMap = {};
});

test('that url query parameters are ignored', t => {
  networkBridge.attachServer(fakeObject, 'wss://not-real/');
  networkBridge.attachWebSocket({}, 'wss://not-real/?foo=42');
  networkBridge.attachWebSocket({}, 'wss://not-real/?foo=0');
  const connection = networkBridge.urlMap['wss://not-real/'];
  t.is(connection.websockets.length, 2, 'two websockets have been attached to the same connection');
});

test('that network bridge has no connections by default', t => {
  t.deepEqual(networkBridge.urlMap, {}, 'Url map is empty by default');
});

test('that network bridge has no connections by default', t => {
  const result = networkBridge.attachWebSocket(fakeObject, 'ws://localhost:8080');

  t.truthy(!result, 'no server was returned as a server must be added first');
  t.deepEqual(networkBridge.urlMap, {}, 'nothing was added to the url map');
});

test('that attachServer adds a server to url map', t => {
  const result = networkBridge.attachServer(fakeObject, 'ws://localhost:8080');
  const connection = networkBridge.urlMap['ws://localhost:8080'];

  t.deepEqual(result, fakeObject, 'the server was returned because it was successfully added to the url map');
  t.deepEqual(connection.server, fakeObject, 'fakeObject was added to the server property');
  t.is(connection.websockets.length, 0, 'websocket property was set to an empty array');
});

test('that attachServer does nothing if a server is already attached to a given url', t => {
  const result = networkBridge.attachServer(fakeObject, 'ws://localhost:8080');
  const result2 = networkBridge.attachServer({ hello: 'world' }, 'ws://localhost:8080');
  const connection = networkBridge.urlMap['ws://localhost:8080'];

  t.truthy(!result2, 'no server was returned as a server was already listening to that url');
  t.deepEqual(result, fakeObject, 'the server was returned because it was successfully added to the url map');
  t.deepEqual(connection.server, fakeObject, 'fakeObject was added to the server property');
  t.is(connection.websockets.length, 0, 'websocket property was set to an empty array');
});

test('that attachWebSocket will add a websocket to the url map', t => {
  const resultServer = networkBridge.attachServer(fakeObject, 'ws://localhost:8080');
  const resultWebSocket = networkBridge.attachWebSocket(fakeObject, 'ws://localhost:8080');
  const connection = networkBridge.urlMap['ws://localhost:8080'];

  t.deepEqual(resultServer, fakeObject, 'server returned because it was successfully added to the url map');
  t.deepEqual(resultWebSocket, fakeObject, 'server returned as the websocket was successfully added to the map');
  t.deepEqual(connection.websockets[0], fakeObject, 'fakeObject was added to the websockets array');
  t.is(connection.websockets.length, 1, 'websocket property contains only the websocket object');
});

test('that attachWebSocket will add a websocket with query params to the url map', t => {
  const resultServer = networkBridge.attachServer(fakeObject, 'ws://localhost:8080');
  const resultWebSocket = networkBridge.attachWebSocket(fakeObject, 'ws://localhost:8080?foo=bar');
  const connection = networkBridge.urlMap['ws://localhost:8080'];

  t.deepEqual(resultServer, fakeObject, 'server returned because it was successfully added to the url map');
  t.deepEqual(resultWebSocket, fakeObject, 'server returned as the websocket was successfully added to the map');
  t.deepEqual(connection.websockets[0], fakeObject, 'fakeObject was added to the websockets array');
  t.is(connection.websockets.length, 1, 'websocket property contains only the websocket object');
});

test('that attachWebSocket will add the same websocket only once', t => {
  const resultServer = networkBridge.attachServer(fakeObject, 'ws://localhost:8080');
  const resultWebSocket = networkBridge.attachWebSocket(fakeObject, 'ws://localhost:8080');
  const resultWebSocket2 = networkBridge.attachWebSocket(fakeObject, 'ws://localhost:8080');
  const connection = networkBridge.urlMap['ws://localhost:8080'];

  t.deepEqual(resultServer, fakeObject, 'server returned because it was successfully added to the url map');
  t.deepEqual(resultWebSocket, fakeObject, 'server returned as the websocket was successfully added to the map');
  t.truthy(!resultWebSocket2, 'nothing added as the websocket already existed inside the url map');
  t.deepEqual(connection.websockets[0], fakeObject, 'fakeObject was added to the websockets array');
  t.is(connection.websockets.length, 1, 'websocket property contains only the websocket object');
});

test('that server and websocket lookups return the correct objects', t => {
  networkBridge.attachServer(fakeObject, 'ws://localhost:8080');
  networkBridge.attachWebSocket(fakeObject, 'ws://localhost:8080');

  const serverLookup = networkBridge.serverLookup('ws://localhost:8080');
  const websocketLookup = networkBridge.websocketsLookup('ws://localhost:8080');

  t.deepEqual(serverLookup, fakeObject, 'server correctly returned');
  t.deepEqual(websocketLookup, [fakeObject], 'websockets correctly returned');
  t.deepEqual(websocketLookup.length, 1, 'the correct number of websockets are returned');
});

test('that server and websocket lookups ignore query params', t => {
  networkBridge.attachServer(fakeObject, 'ws://localhost:8080');
  networkBridge.attachWebSocket(fakeObject, 'ws://localhost:8080?foo=bar');

  const serverLookup = networkBridge.serverLookup('ws://localhost:8080?foo1=1');
  const websocketLookup = networkBridge.websocketsLookup('ws://localhost:8080?foo2=2');

  t.deepEqual(serverLookup, fakeObject, 'server correctly returned');
  t.deepEqual(websocketLookup, [fakeObject], 'websockets correctly returned');
  t.deepEqual(websocketLookup.length, 1, 'the correct number of websockets are returned');
});

test('that removing server and websockets works correctly', t => {
  networkBridge.attachServer(fakeObject, 'ws://localhost:8080');
  networkBridge.attachWebSocket(fakeObject, 'ws://localhost:8080');

  let websocketLookup = networkBridge.websocketsLookup('ws://localhost:8080');
  t.deepEqual(websocketLookup.length, 1, 'the correct number of websockets are returned');

  networkBridge.removeWebSocket(fakeObject, 'ws://localhost:8080');

  websocketLookup = networkBridge.websocketsLookup('ws://localhost:8080');
  t.deepEqual(websocketLookup.length, 0, 'the correct number of websockets are returned');

  networkBridge.removeServer('ws://localhost:8080');
  t.deepEqual(networkBridge.urlMap, {}, 'Url map is back in its default state');
});

test('that removing server and websockets works correctly with query params', t => {
  networkBridge.attachServer(fakeObject, 'ws://localhost:8080');
  networkBridge.attachWebSocket(fakeObject, 'ws://localhost:8080?foo=bar');

  let websocketLookup = networkBridge.websocketsLookup('ws://localhost:8080?anything=else');
  t.deepEqual(websocketLookup.length, 1, 'the correct number of websockets are returned');

  networkBridge.removeWebSocket(fakeObject, 'ws://localhost:8080?arbitraryParameter');

  websocketLookup = networkBridge.websocketsLookup('ws://localhost:8080?one=more');
  t.deepEqual(websocketLookup.length, 0, 'the correct number of websockets are returned');

  networkBridge.removeServer('ws://localhost:8080?please');
  t.deepEqual(networkBridge.urlMap, {}, 'Url map is back in its default state');
});

test('a socket can join and leave a room', t => {
  const fakeSocket = { url: 'ws://roomy' };

  networkBridge.attachServer(fakeObject, 'ws://roomy');
  networkBridge.attachWebSocket(fakeSocket, 'ws://roomy');

  let inRoom;
  inRoom = networkBridge.websocketsLookup('ws://roomy', 'room');
  t.is(inRoom.length, 0, 'there are no sockets in the room to start with');

  networkBridge.addMembershipToRoom(fakeSocket, 'room');

  inRoom = networkBridge.websocketsLookup('ws://roomy', 'room');
  t.is(inRoom.length, 1, 'there is 1 socket in the room after joining');
  t.deepEqual(inRoom[0], fakeSocket);

  networkBridge.removeMembershipFromRoom(fakeSocket, 'room');

  inRoom = networkBridge.websocketsLookup('ws://roomy', 'room');
  t.is(inRoom.length, 0, 'there are no sockets in the room after leaving');
});

test('a socket with query params can join and leave a room', t => {
  const fakeSocket = { url: 'ws://roomy?foo=bar' };

  networkBridge.attachServer(fakeObject, 'ws://roomy');
  networkBridge.attachWebSocket(fakeSocket, 'ws://roomy');

  let inRoom;
  inRoom = networkBridge.websocketsLookup('ws://roomy', 'room');
  t.is(inRoom.length, 0, 'there are no sockets in the room to start with');

  networkBridge.addMembershipToRoom(fakeSocket, 'room');

  inRoom = networkBridge.websocketsLookup('ws://roomy', 'room');
  t.is(inRoom.length, 1, 'there is 1 socket in the room after joining');
  t.deepEqual(inRoom[0], fakeSocket);

  networkBridge.removeMembershipFromRoom(fakeSocket, 'room');

  inRoom = networkBridge.websocketsLookup('ws://roomy', 'room');
  t.is(inRoom.length, 0, 'there are no sockets in the room after leaving');
});
