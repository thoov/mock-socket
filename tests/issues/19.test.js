import test from 'ava';
import Server from '../../src/server';
import WebSocket from '../../src/websocket';

test.cb('that server on(message) argument should be a string and not an object', (t) => {
  const socketUrl = 'ws://localhost:8080';
  const mockServer = new Server(socketUrl);
  const mockSocket = new WebSocket(socketUrl);

  mockServer.on('connection', (socket) => {
    socket.on('message', (message) => {
      t.is(typeof message, 'string', 'message should be a string and not an object');
      mockServer.close();
      t.end();
    });
  });

  mockSocket.onopen = function open() {
    this.send('1');
  };
});
