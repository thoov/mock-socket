import QUnit from 'qunit';
import io from '../src/socket-io';
import Server from '../src/server';
import networkBridge from '../src/network-bridge';

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

QUnit.test('client receives an event', assert => {
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
