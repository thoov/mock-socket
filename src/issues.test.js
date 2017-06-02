import test from 'ava';
import { createMocks } from './index';

test.cb('#13: sends double messages', t => {
  const { WebSocket, Server } = createMocks();
  const mockServer = new Server('ws://localhost:8080');
  const mockSocketA = new WebSocket('ws://localhost:8080');
  const mockSocketB = new WebSocket('ws://localhost:8080');

  let numMessagesSent = 0;
  let numMessagesReceived = 0;

  const serverMessageHandler = function handlerFunc() {
    numMessagesReceived += 1;
  };

  mockServer.on('connection', server => {
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
    t.is(numMessagesReceived, numMessagesSent);
    mockServer.close();
    t.end();
  }, 10);
});

test.cb('#19: that server on(message) argument should be a string and not an object', t => {
  const { WebSocket, Server } = createMocks();
  const socketUrl = 'ws://localhost:8080';
  const mockServer = new Server(socketUrl);
  const mockSocket = new WebSocket(socketUrl);

  mockServer.on('connection', socket => {
    socket.on('message', message => {
      t.is(typeof message, 'string', 'message should be a string and not an object');
      mockServer.close();
      t.end();
    });
  });

  mockSocket.onopen = function open() {
    this.send('1');
  };
});

test.cb('#64: mock sockets invokes each handler', t => {
  const { SocketIO, Server } = createMocks();
  const server = new Server('ws://roomy');
  const socket = new SocketIO('ws://roomy');

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

test.cb('#65: mock socket invokes each handler with unique reference', t => {
  const { SocketIO, Server } = createMocks();
  const server = new Server('ws://roomy');
  const socket = new SocketIO('ws://roomy');

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
  }, 10);
});

test.cb('#65: mock socket invokes each handler per socket', t => {
  const { SocketIO, Server } = createMocks();
  const server = new Server('ws://roomy');
  const socketA = new SocketIO('ws://roomy');
  const socketB = new SocketIO('ws://roomy');

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
  }, 10);
});

test.cb('#157: websocket onmessage fired before onopen', t => {
  const { WebSocket, Server } = createMocks();
  const mockServer = new Server('ws://localhost:8080');
  const mockSocket = new WebSocket('ws://localhost:8080');

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
