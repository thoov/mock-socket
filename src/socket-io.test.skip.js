import test from 'ava';
import { createMocks } from './index';

test('it can be instantiated without a url', t => {
  const { SocketIO } = createMocks();
  const socket = SocketIO();
  t.truthy(socket);
});

test('it accepts a url', t => {
  const { SocketIO } = createMocks();
  const socket = SocketIO('http://localhost');
  t.truthy(socket);
});

test('it accepts an opts object paramter', t => {
  const { SocketIO } = createMocks();
  const socket = SocketIO('http://localhost', { a: 'apple' });
  t.truthy(socket);
});

test('it can equivalently use a connect method', t => {
  const { SocketIO } = createMocks();
  const socket = SocketIO.connect('http://localhost');
  t.truthy(socket);
});

test.cb('it can broadcast to other connected sockets', t => {
  const { SocketIO, Server } = createMocks();
  const url = 'ws://not-real/';
  const myServer = new Server(url);
  const socketFoo = SocketIO(url);
  const socketBar = SocketIO(url);

  myServer.on('connection', () => {
    socketFoo.broadcast.emit('Testing');
  });

  socketFoo.on('Testing', () => {
    t.fail(null, null, 'Socket Foo should be excluded from broadcast');
    myServer.close();
    t.end();
  });

  socketBar.on('Testing', () => {
    t.true(true);
    myServer.close();
    t.end();
  });
});

test.cb('it can broadcast to other connected sockets in a room', t => {
  const { SocketIO, Server } = createMocks();
  const roomKey = 'room-64';
  const url = 'ws://not-real/';

  const myServer = new Server(url);
  const socketFoo = SocketIO(url);

  myServer.on('connection', (server, socket) => {
    socketFoo.broadcast.to(roomKey).emit('Testing', socket);
  });

  socketFoo.join(roomKey);
  socketFoo.on('Testing', () => t.fail(null, null, 'Socket Foo should be excluded from broadcast'));

  const socketBar = SocketIO(url);
  socketBar.on('Testing', () => t.fail(null, null, 'Socket Bar should be excluded from broadcast'));

  const socketFooBar = SocketIO(url);
  socketFooBar.join(roomKey);
  socketFooBar.on('Testing', () => {
    t.true(true);
    myServer.close();
    t.end();
  });
});

test.cb('client triggers the server connection event', t => {
  const { SocketIO, Server } = createMocks();
  const server = new Server('foobar');
  const socket = SocketIO('foobar');

  server.on('connection', () => {
    t.true(true);
    socket.disconnect();
    server.close();
    t.end();
  });
});

test.cb('client triggers the server connect event', t => {
  const { SocketIO, Server } = createMocks();
  const server = new Server('foobar');
  const socket = SocketIO('foobar');

  server.on('connect', () => {
    t.true(true);
    socket.disconnect();
    server.close();
    t.end();
  });
});

test.cb('server triggers the client connect event', t => {
  const { SocketIO, Server } = createMocks();
  const server = new Server('foobar');
  const socket = SocketIO('foobar');

  socket.on('connect', () => {
    t.true(true);
    socket.disconnect();
    server.close();
    t.end();
  });
});

test.cb('no connection triggers the client error event', t => {
  const { SocketIO } = createMocks();
  const socket = SocketIO('foobar');

  socket.on('error', () => {
    t.true(true);
    socket.disconnect();
    t.end();
  });
});

test.cb('client and server receive an event', t => {
  const { SocketIO, Server } = createMocks();

  const server = new Server('foobar');
  server.on('client-event', data => server.emit('server-response', data));

  const socket = SocketIO('foobar');
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
  const { SocketIO, Server } = createMocks();

  const server = new Server('foobar');
  server.on('connect', () => {
    server.close();
  });

  const socket = SocketIO('foobar');
  socket.on('disconnect', () => {
    t.true(true);
    socket.disconnect();
    t.end();
  });
});

test.cb('Server receives disconnect when socket is closed', t => {
  const { SocketIO, Server } = createMocks();

  const server = new Server('foobar');
  server.on('disconnect', () => {
    t.true(true);
    server.close();
    t.end();
  });

  const socket = SocketIO('foobar');
  socket.on('connect', () => {
    socket.disconnect();
  });
});

test.cb('Client can submit an event without a payload', t => {
  const { SocketIO, Server } = createMocks();

  const server = new Server('foobar');
  server.on('client-event', () => {
    t.true(true);
    server.close();
    t.end();
  });

  const socket = SocketIO('foobar');
  socket.on('connect', () => {
    socket.emit('client-event');
  });
});

test.cb('Client also has the send method available', t => {
  const { SocketIO, Server } = createMocks();

  const server = new Server('foobar');
  server.on('message', data => {
    t.is(data, 'hullo!');
    server.close();
    t.end();
  });

  const socket = SocketIO('foobar');
  socket.on('connect', () => {
    socket.send('hullo!');
  });
});

test.cb('a socket can join and leave a room', t => {
  const { SocketIO, Server } = createMocks();

  const server = new Server('ws://roomy');
  const socket = SocketIO('ws://roomy');

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
  const { SocketIO, Server } = createMocks();

  const server = new Server('ws://roomy');
  const socketFoo = SocketIO('ws://roomy');
  const socketBar = SocketIO('ws://roomy');

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
  const { SocketIO, Server } = createMocks();

  const server = new Server('foobar');
  server.on('client-event', (...data) => {
    t.is(data.length, 3);
    t.is(data[0], 'foo');
    t.is(data[1], 'bar');
    t.is(data[2], 'baz');
    server.close();
    t.end();
  });

  const socket = SocketIO('foobar');
  socket.on('connect', () => {
    socket.emit('client-event', 'foo', 'bar', 'baz');
  });
});

test.cb('Server can emit with multiple arguments', t => {
  const { SocketIO, Server } = createMocks();

  const server = new Server('foobar');
  server.on('connection', () => {
    server.emit('server-emit', 'foo', 'bar');
  });

  const socket = SocketIO('foobar');
  socket.on('server-emit', (...data) => {
    t.is(data.length, 2);
    t.is(data[0], 'foo');
    t.is(data[1], 'bar');
    server.close();
    t.end();
  });
});

test.cb('Server can emit to multiple rooms', t => {
  const { SocketIO, Server } = createMocks();

  const server = new Server('ws://chat');
  const socket1 = SocketIO('ws://chat');
  const socket2 = SocketIO('ws://chat');

  let connectedCount = 0;
  const checkConnected = () => {
    connectedCount += 1;
    if (connectedCount === 2) {
      server.to('room1').to('room2').emit('good-response');
    }
  };

  let goodResponses = 0;
  const checkGoodResponses = () => {
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
