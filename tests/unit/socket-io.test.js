import test from 'ava';
import io from '../../src/socket-io';
import Server from '../../src/server';

test('it can be instantiated without a url', t => {
  const socket = io();
  t.truthy(socket);
});

test('it accepts a url', t => {
  const socket = io('http://localhost');
  t.truthy(socket);
});

test('it accepts an opts object parameter', t => {
  const protocol = { a: 'apple' };
  const socket = io('http://localhost', protocol);
  t.truthy(socket);
  t.is(socket.protocol, protocol);
});

test.cb('it includes opts object parameter in server connection callback', t => {
  const url = 'ws://not-real/';
  const myServer = new Server(url);
  const protocol = { a: 'apple' };
  const socket = io(url, protocol);
  myServer.on('connection', (server, instance) => {
    t.is(instance.protocol, protocol);
    t.end();
  });
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

test('it confirms if event listeners of a specific type have been registered', t => {
  const socket = io();
  function fooMessageHandler() {}
  function barMessageListener() {}

  t.is(socket.hasListeners('foo-message'), false);
  t.is(socket.hasListeners('bar-message'), false);

  socket.on('foo-message', fooMessageHandler);
  t.is(socket.hasListeners('foo-message'), true);
  t.is(socket.hasListeners('bar-message'), false);

  socket.on('bar-message', barMessageListener);
  t.is(socket.hasListeners('bar-message'), true);

  socket.off('foo-message', fooMessageHandler);
  t.is(socket.hasListeners('foo-message'), false);
  t.is(socket.hasListeners('bar-message'), true);

  socket.off('bar-message', barMessageListener);
  t.is(socket.hasListeners('bar-message'), false);
});
