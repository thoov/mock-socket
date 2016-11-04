import test from 'ava';
import io from '../../src/socket-io';
import Server from '../../src/server';

test.cb('client triggers the server connection event', (t) => {
  const server = new Server('foobar');
  const socket = io('foobar');

  server.on('connection', () => {
    t.true(true);
    socket.disconnect();
    server.close();
    t.end();
  });
});

test.cb('client triggers the server connect event', (t) => {
  const server = new Server('foobar');
  const socket = io('foobar');

  server.on('connect', () => {
    t.true(true);
    socket.disconnect();
    server.close();
    t.end();
  });
});

test.cb('server triggers the client connect event', (t) => {
  const server = new Server('foobar');
  const socket = io('foobar');

  socket.on('connect', () => {
    t.true(true);
    socket.disconnect();
    server.close();
    t.end();
  });
});

test.cb('no connection triggers the client error event', (t) => {
  const socket = io('foobar');

  socket.on('error', () => {
    t.true(true);
    socket.disconnect();
    t.end();
  });
});

test.cb('client and server receive an event', (t) => {
  const server = new Server('foobar');
  server.on('client-event', (data) => {
    server.emit('server-response', data);
  });

  const socket = io('foobar');
  socket.on('server-response', (data) => {
    t.is('payload', data);
    socket.disconnect();
    server.close();
    t.end();
  });

  socket.on('connect', () => {
    socket.emit('client-event', 'payload');
  });
});

test.cb('Server closing triggers the client disconnect event', (t) => {
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

test.cb('Server receives disconnect when socket is closed', (t) => {
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

test.cb('Client can submit an event without a payload', (t) => {
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

test.cb('Client also has the send method available', (t) => {
  const server = new Server('foobar');
  server.on('message', (data) => {
    t.is(data, 'hullo!');
    server.close();
    t.end();
  });

  const socket = io('foobar');
  socket.on('connect', () => {
    socket.send('hullo!');
  });
});

test.cb('a socket can join and leave a room', (t) => {
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

test.cb('Client can emit with multiple arguments', (t) => {
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

test.cb('Server can emit with multiple arguments', (t) => {
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
