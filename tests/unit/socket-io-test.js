import QUnit from 'qunit';
import io from '../src/socket-io';

QUnit.module('Unit - SocketIO');

QUnit.test('it can be instantiated without a url', assert => {
  assert.expect(1);

  var socket = io();
  assert.ok(socket);
});

QUnit.test('it accepts a url', assert => {
  assert.expect(1);

  var socket = io('http://localhost');
  assert.ok(socket);
});

QUnit.test('it accepts an opts object paramter', assert => {
  assert.expect(1);

  var socket = io('http://localhost', { a: 'apple' });
  assert.ok(socket);
});

QUnit.test('it can equivalently use a connect method', assert => {
  assert.expect(1);

  var socket = io.connect('http://localhost');
  assert.ok(socket);
});
