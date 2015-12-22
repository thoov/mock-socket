import assert from 'assert';
import io from '../src/socket-io';
import Server from '../src/server';

describe('Functional - SocketIO', function functionalTest() {
  it('client triggers the server connection event', done => {
    const server = new Server('foobar');
    const socket = io('foobar');

    server.on('connection', () => {
      assert.ok(true);
      socket.disconnect();
      server.close();
      done();
    });
  });

  it('client triggers the server connect event', done => {
    const server = new Server('foobar');
    const socket = io('foobar');

    server.on('connect', () => {
      assert.ok(true);
      socket.disconnect();
      server.close();
      done();
    });
  });

  it('server triggers the client connect event', done => {
    const server = new Server('foobar');
    const socket = io('foobar');

    socket.on('connect', () => {
      assert.ok(true);
      socket.disconnect();
      server.close();
      done();
    });
  });

  it('no connection triggers the client error event', done => {
    const socket = io('foobar');

    socket.on('error', () => {
      assert.ok(true);
      socket.disconnect();
      done();
    });
  });

  it('client and server receive an event', done => {
    const server = new Server('foobar');
    server.on('client-event', data => {
      server.emit('server-response', data);
    });

    const socket = io('foobar');
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

  it('Server closing triggers the client disconnect event', done => {
    const server = new Server('foobar');
    server.on('connect', () => {
      server.close();
    });

    const socket = io('foobar');
    socket.on('disconnect', () => {
      assert.ok(true);
      socket.disconnect();
      done();
    });
  });

  it('Server receives disconnect when socket is closed', done => {
    const server = new Server('foobar');
    server.on('disconnect', () => {
      assert.ok(true);
      server.close();
      done();
    });

    const socket = io('foobar');
    socket.on('connect', () => {
      socket.disconnect();
    });
  });

  it('Client can submit an event without a payload', done => {
    const server = new Server('foobar');
    server.on('client-event', () => {
      assert.ok(true);
      server.close();
      done();
    });

    const socket = io('foobar');
    socket.on('connect', () => {
      socket.emit('client-event');
    });
  });

  it('Client also has the send method available', done => {
    const server = new Server('foobar');
    server.on('message', (data) => {
      assert.equal(data, 'hullo!');
      server.close();
      done();
    });

    const socket = io('foobar');
    socket.on('connect', () => {
      socket.send('hullo!');
    });
  });

  it('a socket can join and leave a room', done => {
    const server = new Server('ws://roomy');
    const socket = io('ws://roomy');

    socket.on('good-response', () => {
      assert.ok(true);
      server.close();
      done();
    });

    socket.on('connect', () => {
      socket.join('room');
      server.to('room').emit('good-response');
    });
  });
});
