import test from 'ava';
import Server from '../../src/server';
import IO from '../../src/socket-io';

test.cb('mock socket invokes each handler with unique reference', t => {
  const socketUrl = 'ws://roomy';
  const server = new Server(socketUrl);
  const socket = new IO(socketUrl);

  let handlerInvoked = 0;
  const handler3 = function handlerFunc() {
    t.true(true);
    handlerInvoked += 1;
  };

  // Same functions but different scopes/contexts
  socket.on('custom-event', handler3.bind(Object.create(null)));
  socket.on('custom-event', handler3.bind(Object.create(null)));

  // Same functions with same scope/context (only one should be added)
  socket.on('custom-event', handler3);
  socket.on('custom-event', handler3); // not expected

  socket.on('connect', () => {
    socket.join('room');
    server.to('room').emit('custom-event');
  });

  setTimeout(() => {
    t.is(handlerInvoked, 3, 'handler invoked too many times');
    server.close();
    t.end();
  }, 500);
});

test.cb('mock socket invokes each handler per socket', t => {
  const socketUrl = 'ws://roomy';
  const server = new Server(socketUrl);
  const socketA = new IO(socketUrl);
  const socketB = new IO(socketUrl);

  let handlerInvoked = 0;
  const handler3 = function handlerFunc() {
    t.true(true);
    handlerInvoked += 1;
  };

  // Same functions but different scopes/contexts
  socketA.on('custom-event', handler3.bind(socketA));
  socketB.on('custom-event', handler3.bind(socketB));

  // Same functions with same scope/context (only one should be added)
  socketA.on('custom-event', handler3);
  socketA.on('custom-event', handler3); // not expected

  socketB.on('custom-event', handler3.bind(socketB)); // expected because bind creates a new method

  socketA.on('connect', () => {
    socketA.join('room');
    socketB.join('room');
    server.to('room').emit('custom-event');
  });

  setTimeout(() => {
    t.is(handlerInvoked, 4, 'handler invoked too many times');
    server.close();
    t.end();
  }, 500);
});
