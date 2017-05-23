import test from 'ava';
import Server from '../../src/server';
import WebSocket from '../../src/websocket';

test.cb('websocket onmessage fired before onopen', t => {
  const socketUrl = 'ws://localhost:8080';
  const mockServer = new Server(socketUrl);
  const mockSocket = new WebSocket(socketUrl);

  let onOpenCalled = false;

  mockServer.on('connection', () => {
    mockServer.send('test message');
  });

  mockSocket.onopen = () => {
    onOpenCalled = true;
  };

  mockSocket.onmessage = () => {
    t.true(onOpenCalled, 'on open was called before onmessage');
    t.end();
  };
});
