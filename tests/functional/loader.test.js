import test from 'ava';
import systemjs from 'systemjs';

test('amd modules are loaded', async t => {
  const mockSocket = await systemjs.import('./dist/mock-socket.amd.js');

  t.truthy(mockSocket.Server);
  t.truthy(mockSocket.WebSocket);
  t.truthy(mockSocket.SocketIO);
});

test('umd modules are loaded', async t => {
  const mockSocket = await systemjs.import('./dist/mock-socket.js');

  t.truthy(mockSocket.Server);
  t.truthy(mockSocket.WebSocket);
  t.truthy(mockSocket.SocketIO);
});

test('cjs modules are loaded', async t => {
  const mockSocket = await systemjs.import('./dist/mock-socket.cjs.js');

  t.truthy(mockSocket.Server);
  t.truthy(mockSocket.WebSocket);
  t.truthy(mockSocket.SocketIO);
});

// TODO: install traceur (https://github.com/systemjs/plugin-traceur)
test.skip('es modules are loaded', async t => {
  const mockSocket = await systemjs.import('./dist/mock-socket.es.js');

  t.truthy(mockSocket.Server);
  t.truthy(mockSocket.WebSocket);
  t.truthy(mockSocket.SocketIO);
});
