import assert from 'assert';
import Server from '../src/server';
import WebSocket from '../src/websocket';

describe('Issue #74: Calling closed from server sets clients readyState to undefined', () => {
  it('calling close on server sets client readyState to WebSocket.CLOSED', done => {
    const server = new Server('ws://localhost:8080');
    const socket = new WebSocket('ws://localhost:8080');

    socket.onopen = function open() {
      server.close();
    };

    socket.onclose = function close() {
      assert.equal(socket.readyState, WebSocket.CLOSED, 'socket readyState is not closed');
      done();
    };
  });
});
