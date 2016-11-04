import test from 'ava';
import Server from '../../src/server';
import IO from '../../src/socket-io';

test.cb('mock sockets invokes each handler', (t) => {
  const socketUrl = 'ws://roomy';
  const server = new Server(socketUrl);
  const socket = new IO(socketUrl);

  let handler1Called = false;
  let handler2Called = false;

  socket.on('custom-event', () => {
    t.true(true);
    handler1Called = true;
  });

  socket.on('custom-event', () => {
    t.true(true);
    handler2Called = true;
  });

  socket.on('connect', () => {
    socket.join('room');
    server.to('room').emit('custom-event');
  });

  setTimeout(() => {
    t.is(handler1Called, true);
    t.is(handler2Called, true);
    server.close();
    t.end();
  }, 500);
});
