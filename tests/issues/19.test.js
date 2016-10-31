import assert from 'assert';
import Server from '../../src/server';
import WebSocket from '../../src/websocket';

describe('Issue #19: Mock Server on(message) argument should be a string and not an object.', () => {
  it('that server on(message) argument should be a string and not an object', (done) => {
    const socketUrl = 'ws://localhost:8080';
    const mockServer = new Server(socketUrl);
    const mockSocket = new WebSocket(socketUrl);

    mockServer.on('connection', (socket) => {
      socket.on('message', (message) => {
        assert.equal(typeof message, 'string', 'message should be a string and not an object');
        mockServer.close();
        done();
      });
    });

    mockSocket.onopen = function open() {
      this.send('1');
    };
  });
});
