import QUnit from 'qunit';
import Server from '../src/server';
import io from '../src/socket-io';

QUnit.module('Issue #65: `on` allows multiple handlers for the same event with different contexts');

QUnit.test('mock socket invokes each handler with unique reference', function(assert) {
  var socketUrl         = 'ws://roomy';
  var server            = new Server(socketUrl);
  var socket            = new io(socketUrl);
  var done              = assert.async();

  var handlerInvoked = 0;
  var handler3 = function(){
    assert.ok(true);
    handlerInvoked++;
  };

  // Same functions but different scopes/contexts
  socket.on('custom-event',handler3.bind(Object.create(null)));
  socket.on('custom-event',handler3.bind(Object.create(null)));

  // Same functions with same scope/context (only one should be added)
  socket.on('custom-event',handler3);
  socket.on('custom-event',handler3); // not expected

  socket.on('connect', () => {
    socket.join('room');
    server.to('room').emit('custom-event');
  });

  setTimeout(function() {
    assert.equal(handlerInvoked,3,"handler invoked too many times");
    server.close();
    done();
  }, 500);
});

QUnit.test('mock socket invokes each handler per socket', function(assert) {
  var socketUrl         = 'ws://roomy';
  var server            = new Server(socketUrl);
  var socketA           = new io(socketUrl);
  var socketB           = new io(socketUrl);
  var done              = assert.async();

  var handlerInvoked = 0;
  var handler3 = function(){
    assert.ok(true);
    handlerInvoked++;
  };

  // Same functions but different scopes/contexts
  socketA.on('custom-event',handler3.bind(socketA));
  socketB.on('custom-event',handler3.bind(socketB));

  // Same functions with same scope/context (only one should be added)
  socketA.on('custom-event',handler3);
  socketA.on('custom-event',handler3); // not expected

  socketB.on('custom-event',handler3.bind(socketB)); // expected because bind creates a new method

  socketA.on('connect', () => {
    socketA.join('room');
    socketB.join('room');
    server.to('room').emit('custom-event');
  });

  setTimeout(function() {
    assert.equal(handlerInvoked,4,"handler invoked too many times");
    server.close();
    done();
  }, 500);
});
