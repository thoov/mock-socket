import assert from 'assert';
import Server from '../../src/server';
import IO from '../../src/socket-io';

describe('Issue #64: `on` allows multiple handlers for the same event', () => {
  it('mock sockets invokes each handler', (done) => {
    const socketUrl = 'ws://roomy';
    const server = new Server(socketUrl);
    const socket = new IO(socketUrl);

    let handler1Called = false;
    let handler2Called = false;

    socket.on('custom-event', () => {
      assert.ok(true);
      handler1Called = true;
    });

    socket.on('custom-event', () => {
      assert.ok(true);
      handler2Called = true;
    });

    socket.on('connect', () => {
      socket.join('room');
      server.to('room').emit('custom-event');
    });

    setTimeout(() => {
      assert.equal(handler1Called, true);
      assert.equal(handler2Called, true);
      server.close();
      done();
    }, 500);
  });
});
