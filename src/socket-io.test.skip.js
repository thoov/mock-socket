import test from 'ava';
import { createMocks } from './index';

test('it can be instantiated without a url', t => {
  const socket = io();
  t.truthy(socket);
});

test('it accepts a url', t => {
  const socket = io('http://localhost');
  t.truthy(socket);
});

test('it accepts an opts object paramter', t => {
  const socket = io('http://localhost', { a: 'apple' });
  t.truthy(socket);
});

test('it can equivalently use a connect method', t => {
  const socket = io.connect('http://localhost');
  t.truthy(socket);
});

test.cb.skip('it can broadcast to other connected sockets', t => {
  const url = 'ws://not-real/';
  const myServer = new Server(url);
  const socketFoo = io(url);
  const socketBar = io(url);

  myServer.on('connection', (server, socket) => {
    socketFoo.broadcast.emit('Testing');
  });

  socketFoo.on('Testing', () => {
    t.fail(null, null, 'Socket Foo should be excluded from broadcast');
    myServer.close();
    t.end();
  });

  socketBar.on('Testing', socket => {
    t.true(true);
    myServer.close();
    t.end();
  });
});

test.cb.skip('it can broadcast to other connected sockets in a room', t => {
  const roomKey = 'room-64';
  const url = 'ws://not-real/';

  const myServer = new Server(url);
  myServer.on('connection', (server, socket) => {
    socketFoo.broadcast.to(roomKey).emit('Testing', socket);
  });

  const socketFoo = io(url);
  socketFoo.join(roomKey);
  socketFoo.on('Testing', () => t.fail(null, null, 'Socket Foo should be excluded from broadcast'));

  const socketBar = io(url);
  socketBar.on('Testing', () => t.fail(null, null, 'Socket Bar should be excluded from broadcast'));

  const socketFooBar = io(url);
  socketFooBar.join(roomKey);
  socketFooBar.on('Testing', socket => {
    t.true(true);
    myServer.close();
    t.end();
  });
});

test.cb('client triggers the server connection event', t => {
  const server = new Server('foobar');
  const socket = io('foobar');

  server.on('connection', () => {
    t.true(true);
    socket.disconnect();
    server.close();
    t.end();
  });
});

test.cb('client triggers the server connect event', t => {
  const server = new Server('foobar');
  const socket = io('foobar');

  server.on('connect', () => {
    t.true(true);
    socket.disconnect();
    server.close();
    t.end();
  });
});

test.cb('server triggers the client connect event', t => {
  const server = new Server('foobar');
  const socket = io('foobar');

  socket.on('connect', () => {
    t.true(true);
    socket.disconnect();
    server.close();
    t.end();
  });
});

test.cb('no connection triggers the client error event', t => {
  const socket = io('foobar');

  socket.on('error', () => {
    t.true(true);
    socket.disconnect();
    t.end();
  });
});

test.cb('client and server receive an event', t => {
  const server = new Server('foobar');
  server.on('client-event', data => {
    server.emit('server-response', data);
  });

  const socket = io('foobar');
  socket.on('server-response', data => {
    t.is('payload', data);
    socket.disconnect();
    server.close();
    t.end();
  });

  socket.on('connect', () => {
    socket.emit('client-event', 'payload');
  });
});

test.cb('Server closing triggers the client disconnect event', t => {
  const server = new Server('foobar');
  server.on('connect', () => {
    server.close();
  });

  const socket = io('foobar');
  socket.on('disconnect', () => {
    t.true(true);
    socket.disconnect();
    t.end();
  });
});

test.cb('Server receives disconnect when socket is closed', t => {
  const server = new Server('foobar');
  server.on('disconnect', () => {
    t.true(true);
    server.close();
    t.end();
  });

  const socket = io('foobar');
  socket.on('connect', () => {
    socket.disconnect();
  });
});

test.cb('Client can submit an event without a payload', t => {
  const server = new Server('foobar');
  server.on('client-event', () => {
    t.true(true);
    server.close();
    t.end();
  });

  const socket = io('foobar');
  socket.on('connect', () => {
    socket.emit('client-event');
  });
});

test.cb('Client also has the send method available', t => {
  const server = new Server('foobar');
  server.on('message', data => {
    t.is(data, 'hullo!');
    server.close();
    t.end();
  });

  const socket = io('foobar');
  socket.on('connect', () => {
    socket.send('hullo!');
  });
});

test.cb('a socket can join and leave a room', t => {
  const server = new Server('ws://roomy');
  const socket = io('ws://roomy');

  socket.on('good-response', () => {
    t.true(true);
    server.close();
    t.end();
  });

  socket.on('connect', () => {
    socket.join('room');
    server.to('room').emit('good-response');
  });
});

test.cb('a socket can emit to a room', t => {
  const server = new Server('ws://roomy');
  const socketFoo = io('ws://roomy');
  const socketBar = io('ws://roomy');

  socketFoo.on('connect', () => {
    socketFoo.join('room');
  });
  socketFoo.on('room-talk', () => {
    t.true(true);
    server.close();
    t.end();
  });

  socketBar.on('connect', () => {
    socketBar.join('room');
    socketBar.to('room').emit('room-talk');
  });
});

test.cb('Client can emit with multiple arguments', t => {
  const server = new Server('foobar');
  server.on('client-event', (...data) => {
    t.is(data.length, 3);
    t.is(data[0], 'foo');
    t.is(data[1], 'bar');
    t.is(data[2], 'baz');
    server.close();
    t.end();
  });

  const socket = io('foobar');
  socket.on('connect', () => {
    socket.emit('client-event', 'foo', 'bar', 'baz');
  });
});

test.cb('Server can emit with multiple arguments', t => {
  const server = new Server('foobar');
  server.on('connection', () => {
    server.emit('server-emit', 'foo', 'bar');
  });

  const socket = io('foobar');
  socket.on('server-emit', (...data) => {
    t.is(data.length, 2);
    t.is(data[0], 'foo');
    t.is(data[1], 'bar');
    server.close();
    t.end();
  });
});

test.cb('Server can emit to multiple rooms', t => {
  const server = new Server('ws://chat');
  const socket1 = io('ws://chat');
  const socket2 = io('ws://chat');

  let connectedCount = 0;
  const checkConnected = () => {
    connectedCount += 1;
    if (connectedCount === 2) {
      server.to('room1').to('room2').emit('good-response');
    }
  };

  let goodResponses = 0;
  const checkGoodResponses = socketId => {
    goodResponses += 1;
    if (goodResponses === 2) {
      t.true(true);
      server.close();
      t.end();
    }
  };

  socket1.on('good-response', checkGoodResponses.bind(null, 1));
  socket2.on('good-response', checkGoodResponses.bind(null, 2));

  socket1.on('connect', () => {
    socket1.join('room1');
    checkConnected();
  });

  socket2.on('connect', () => {
    socket2.join('room2');
    checkConnected();
  });
});
