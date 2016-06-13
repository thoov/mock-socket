import assert from 'assert';
import io from '../src/socket-io';
import Server from '../src/server';

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

  it('it can broadcast to other connected sockets', (done) => {
    const url = 'ws://not-real/';
    const myServer = new Server(url);
    myServer.on('connection', function (server, socket) {
      socketFoo.broadcast.emit('Testing');
    });

    const socketFoo = io(url);
    socketFoo.on('Testing', () => {
      assert.fail(null, null, 'Socket Foo should be excluded from broadcast');
    });
    
    const socketBar = io(url);
    socketBar.on('Testing', (socket) => {
      assert.ok(true);
      myServer.close();
      done();
    });
  });

  it('it can broadcast to other connected sockets in a room', (done) => {
    const roomKey = 'room-64';
    const url = 'ws://not-real/';

    const myServer = new Server(url);
    myServer.on('connection', function (server, socket) {
      socketFoo.broadcast.to(roomKey).emit('Testing', socket);
    });

    const socketFoo = io(url);
    socketFoo.join(roomKey);
    socketFoo.on('Testing', () => assert.fail(null, null, 'Socket Foo should be excluded from broadcast'));
    
    const socketBar = io(url);
    socketBar.on('Testing', () => assert.fail(null, null, 'Socket Bar should be excluded from broadcast'));

    const socketFooBar = io(url);
    socketFooBar.join(roomKey);
    socketFooBar.on('Testing', (socket) => {
      assert.ok(true);
      myServer.close();
      done();
    });
  })
});
