import assert from 'assert';
import io from '../src/socket-io';

describe('Unit - SocketIO', function unitTest() {
  it('it can be instantiated without a url', () => {
    const socket = io();
    assert.ok(socket);
  });

  it('it accepts a url', () => {
    const socket = io('http://localhost');
    assert.ok(socket);
  });

  it('it accepts an opts object paramter', () => {
    const socket = io('http://localhost', { a: 'apple' });
    assert.ok(socket);
  });

  it('it can equivalently use a connect method', () => {
    const socket = io.connect('http://localhost');
    assert.ok(socket);
  });
});
