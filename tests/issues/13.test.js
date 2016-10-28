import assert from 'assert';
import Server from '../../src/server';
import WebSocket from '../../src/websocket';

describe('Issue #13: Sockets send messages multiple times', () => {
  it('mock sockets sends double messages', (done) => {
    const socketUrl = 'ws://localhost:8080';
    const mockServer = new Server(socketUrl);
    const mockSocketA = new WebSocket(socketUrl);
    const mockSocketB = new WebSocket(socketUrl);

    let numMessagesSent = 0;
    let numMessagesReceived = 0;
    let connectionsCreated = 0;

    const serverMessageHandler = function handlerFunc() {
      numMessagesReceived += 1;
    };

    mockServer.on('connection', (server) => {
      connectionsCreated += 1;
      server.on('message', serverMessageHandler);
    });

    mockSocketA.onopen = function open() {
      numMessagesSent += 1;
      this.send('1');
    };

    mockSocketB.onopen = function open() {
      numMessagesSent += 1;
      this.send('2');
    };

    setTimeout(() => {
      assert.equal(numMessagesReceived, numMessagesSent);
      mockServer.close();
      done();
    }, 500);
  });
});
