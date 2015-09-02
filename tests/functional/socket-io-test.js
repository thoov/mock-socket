import QUnit from 'qunit';
import io from '../src/socket-io';
import Server from '../src/server';

QUnit.module('Functional - SocketIO');

QUnit.test('client triggers the server connection event', assert => {
  assert.expect(1);
  var done = assert.async();
  var server = new Server('foobar');
  var socket = io('foobar');

  server.on('connection', function() {
    assert.ok(true);
    socket.disconnect();
    server.close();
    done();
  });
});

QUnit.test('client triggers the server connect event', assert => {
  assert.expect(1);
  var done = assert.async();
  var server = new Server('foobar');
  var socket = io('foobar');

  server.on('connect', function() {
    assert.ok(true);
    socket.disconnect();
    server.close();
    done();
  });
});

QUnit.test('server triggers the client connect event', assert => {
  assert.expect(1);
  var done = assert.async();
  var server = new Server('foobar');
  var socket = io('foobar');

  socket.on('connect', function() {
    assert.ok(true);
    socket.disconnect();
    server.close();
    done();
  });
});

QUnit.test('no connection triggers the client error event', assert => {
  assert.expect(1);
  var done = assert.async();
  var socket = io('foobar');

  socket.on('error', function() {
    assert.ok(true);
    socket.disconnect();
    done();
  });
});

QUnit.test('client and server receive an event', assert => {
  assert.expect(1);
  var done = assert.async();

  var server = new Server('foobar');
  server.on('client-event', data => {
    server.emit('server-response', data);
  });

  var socket = io('foobar');
  socket.on('server-response', data => {
    assert.equal('payload', data);
    socket.disconnect();
    server.close();
    done();
  });

  socket.on('connect', () => {
    socket.emit('client-event', 'payload');
  });
});

QUnit.test('Server closing triggers the client disconnect event', assert => {
  assert.expect(1);
  var done = assert.async();

  var server = new Server('foobar');
  server.on('connect', () => {
    server.close();
  });

  var socket = io('foobar');
  socket.on('disconnect', () => {
    assert.ok(true);
    socket.disconnect();
    done();
  });
});

QUnit.test('Server receives disconnect when socket is closed', assert => {
  assert.expect(1);
  var done = assert.async();

  var server = new Server('foobar');
  server.on('disconnect', () => {
    assert.ok(true);
    server.close();
    done();
  });

  var socket = io('foobar');
  socket.on('connect', () => {
    socket.disconnect();
  });
});

QUnit.test('Client can submit an event without a payload', assert => {
  assert.expect(1);
  var done = assert.async();

  var server = new Server('foobar');
  server.on('client-event', () => {
    assert.ok(true);
    server.close();
    done();
  });

  var socket = io('foobar');
  socket.on('connect', () => {
    socket.emit('client-event');
  });
});

QUnit.test('Client also has the send method available', assert => {
  assert.expect(1);
  var done = assert.async();

  var server = new Server('foobar');
  server.on('message', (data) => {
    assert.equal(data, 'hullo!');
    server.close();
    done();
  });

  var socket = io('foobar');
  socket.on('connect', () => {
    socket.send('hullo!');
  });
});
