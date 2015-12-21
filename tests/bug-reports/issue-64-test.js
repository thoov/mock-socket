import QUnit from 'qunit';
import Server from '../src/server';
import io from '../src/socket-io';

QUnit.module('Issue #64: `on` allows multiple handlers for the same event');

QUnit.test('mock sockets invokes each handler', function(assert) {
  var socketUrl         = 'ws://roomy';
  var server            = new Server(socketUrl);
  var socket            = new io(socketUrl);
  var done              = assert.async();

  var handler1Called = false;
  var handler2Called = false;

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

  setTimeout(function() {
    assert.equal(handler1Called,true);
    assert.equal(handler2Called,true);
    server.close();
    done();
  }, 500);
});
