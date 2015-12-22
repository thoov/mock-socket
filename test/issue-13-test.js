import assert from 'assert';
import Server from '../src/server';
import WebSocket from '../src/websocket';

describe('Issue #13: Sockets send messages multiple times', function issueTest() {
  it('mock sockets sends double messages', done => {
    const socketUrl = 'ws://localhost:8080';
    const mockServer = new Server(socketUrl);
    const mockSocketA = new WebSocket(socketUrl);
    const mockSocketB = new WebSocket(socketUrl);

    let numMessagesSent = 0;
    let numMessagesReceived = 0;

    mockServer.on('connection', socket => {
      socket.on('message', () => {
        numMessagesReceived++;
      });
    });

    mockSocketA.onopen = function open() {
      numMessagesSent++;
      this.send('1');
    };

    mockSocketB.onopen = function open() {
      numMessagesSent++;
      this.send('2');
    };

    setTimeout(function timeout() {
      assert.equal(numMessagesReceived, numMessagesSent);
      mockServer.close();
      done();
    }, 500);
  });
});
