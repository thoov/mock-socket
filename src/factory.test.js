import test from 'ava';
import factory from './factory';

test('that the factory adds __getNetworkConnection methods which return the same instance', t => {
  const { WebSocket, Server, SocketIO } = factory();

  const server = new Server('ws://example.com');
  const socketA = new WebSocket('ws://example.com');
  const socketB = new WebSocket('ws://example.com');
  const socketIOA = new SocketIO('ws://example.com');
  const socketIOB = SocketIO('ws://example.com');

  t.deepEqual(socketA.__getNetworkConnection(), server.__getNetworkConnection());
  t.deepEqual(socketB.__getNetworkConnection(), server.__getNetworkConnection());
  t.deepEqual(socketIOA.__getNetworkConnection(), server.__getNetworkConnection());
  t.deepEqual(socketIOB.__getNetworkConnection(), server.__getNetworkConnection());
});
