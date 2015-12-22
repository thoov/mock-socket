import assert from 'assert';
import networkBridge from '../src/network-bridge';

const fakeObject = { foo: 'bar' };

describe('Unit - Network Bridge', function unitTest() {
  afterEach(function after() {
    networkBridge.urlMap = {};
  });

  it('that network bridge has no connections be defualt', () => {
    assert.deepEqual(networkBridge.urlMap, {}, 'Url map is empty by default');
  });

  it('that network bridge has no connections be defualt', () => {
    const result = networkBridge.attachWebSocket(fakeObject, 'ws://localhost:8080');

    assert.ok(!result, 'no server was returned as a server must be added first');
    assert.deepEqual(networkBridge.urlMap, {}, 'nothing was added to the url map');
  });

  it('that attachServer adds a server to url map', () => {
    const result = networkBridge.attachServer(fakeObject, 'ws://localhost:8080');
    const connection = networkBridge.urlMap['ws://localhost:8080'];

    assert.deepEqual(result, fakeObject, 'the server was returned because it was successfully added to the url map');
    assert.deepEqual(connection.server, fakeObject, 'fakeObject was added to the server property');
    assert.equal(connection.websockets.length, 0, 'websocket property was set to an empty array');
  });

  it('that attachServer does nothing if a server is already attached to a given url', () => {
    const result = networkBridge.attachServer(fakeObject, 'ws://localhost:8080');
    const result2 = networkBridge.attachServer({ hello: 'world' }, 'ws://localhost:8080');
    const connection = networkBridge.urlMap['ws://localhost:8080'];

    assert.ok(!result2, 'no server was returned as a server was already listening to that url');
    assert.deepEqual(result, fakeObject, 'the server was returned because it was successfully added to the url map');
    assert.deepEqual(connection.server, fakeObject, 'fakeObject was added to the server property');
    assert.equal(connection.websockets.length, 0, 'websocket property was set to an empty array');
  });

  it('that attachWebSocket will add a websocket to the url map', () => {
    const resultServer = networkBridge.attachServer(fakeObject, 'ws://localhost:8080');
    const resultWebSocket = networkBridge.attachWebSocket(fakeObject, 'ws://localhost:8080');
    const connection = networkBridge.urlMap['ws://localhost:8080'];

    assert.deepEqual(resultServer, fakeObject, 'server returned because it was successfully added to the url map');
    assert.deepEqual(resultWebSocket, fakeObject, 'server returned as the websocket was successfully added to the map');
    assert.deepEqual(connection.websockets[0], fakeObject, 'fakeObject was added to the websockets array');
    assert.equal(connection.websockets.length, 1, 'websocket property contains only the websocket object');
  });

  it('that attachWebSocket will add the same websocket only once', () => {
    const resultServer = networkBridge.attachServer(fakeObject, 'ws://localhost:8080');
    const resultWebSocket = networkBridge.attachWebSocket(fakeObject, 'ws://localhost:8080');
    const resultWebSocket2 = networkBridge.attachWebSocket(fakeObject, 'ws://localhost:8080');
    const connection = networkBridge.urlMap['ws://localhost:8080'];

    assert.deepEqual(resultServer, fakeObject, 'server returned because it was successfully added to the url map');
    assert.deepEqual(resultWebSocket, fakeObject, 'server returned as the websocket was successfully added to the map');
    assert.ok(!resultWebSocket2, 'nothing added as the websocket already existed inside the url map');
    assert.deepEqual(connection.websockets[0], fakeObject, 'fakeObject was added to the websockets array');
    assert.equal(connection.websockets.length, 1, 'websocket property contains only the websocket object');
  });

  it('that server and websocket lookups return the correct objects', () => {
    networkBridge.attachServer(fakeObject, 'ws://localhost:8080');
    networkBridge.attachWebSocket(fakeObject, 'ws://localhost:8080');

    const serverLookup = networkBridge.serverLookup('ws://localhost:8080');
    const websocketLookup = networkBridge.websocketsLookup('ws://localhost:8080');

    assert.deepEqual(serverLookup, fakeObject, 'server correctly returned');
    assert.deepEqual(websocketLookup, [fakeObject], 'websockets correctly returned');
    assert.deepEqual(websocketLookup.length, 1, 'the correct number of websockets are returned');
  });

  it('that removing server and websockets works correctly', () => {
    networkBridge.attachServer(fakeObject, 'ws://localhost:8080');
    networkBridge.attachWebSocket(fakeObject, 'ws://localhost:8080');

    let websocketLookup = networkBridge.websocketsLookup('ws://localhost:8080');
    assert.deepEqual(websocketLookup.length, 1, 'the correct number of websockets are returned');

    networkBridge.removeWebSocket(fakeObject, 'ws://localhost:8080');

    websocketLookup = networkBridge.websocketsLookup('ws://localhost:8080');
    assert.deepEqual(websocketLookup.length, 0, 'the correct number of websockets are returned');

    networkBridge.removeServer('ws://localhost:8080');
    assert.deepEqual(networkBridge.urlMap, {}, 'Url map is back in its default state');
  });

  it('a socket can join and leave a room', () => {
    const fakeSocket = { url: 'ws://roomy' };

    networkBridge.attachServer(fakeObject, 'ws://roomy');
    networkBridge.attachWebSocket(fakeSocket, 'ws://roomy');

    let inRoom;
    inRoom = networkBridge.websocketsLookup('ws://roomy', 'room');
    assert.equal(inRoom.length, 0, 'there are no sockets in the room to start with');

    networkBridge.addMembershipToRoom(fakeSocket, 'room');

    inRoom = networkBridge.websocketsLookup('ws://roomy', 'room');
    assert.equal(inRoom.length, 1, 'there is 1 socket in the room after joining');
    assert.deepEqual(inRoom[0], fakeSocket);

    networkBridge.removeMembershipFromRoom(fakeSocket, 'room');

    inRoom = networkBridge.websocketsLookup('ws://roomy', 'room');
    assert.equal(inRoom.length, 0, 'there are no sockets in the room after leaving');
  });
});
