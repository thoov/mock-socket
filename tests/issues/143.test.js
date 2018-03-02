import test from 'ava';
import Server from '../../src/server';
import WebSocket from '../../src/websocket';

test.cb('reassigning websocket onopen listener should replace previous listeners', t => {
  const socketUrl = 'ws://localhost:8080';
  const mockServer = new Server(socketUrl);
  const mockSocket = new WebSocket(socketUrl);

  let firstListenerCalled = false;
  let secondListenerCalled = false;

  mockSocket.onopen = () => {
    firstListenerCalled = true;
  };
  mockSocket.onopen = () => {
    secondListenerCalled = true;
  };

  setTimeout(() => {
    t.false(firstListenerCalled, 'The first listener should not be called');
    t.true(secondListenerCalled, 'Only the second listener should be called');
    mockServer.close();
    t.end();
  }, 500);
});

test.cb('reassigning websocket onmessage listener should replace previous listeners', t => {
  const socketUrl = 'ws://localhost:8080';
  const mockServer = new Server(socketUrl);
  const mockSocket = new WebSocket(socketUrl);

  let firstListenerCalled = false;
  let secondListenerCalled = false;

  mockSocket.onmessage = () => {
    firstListenerCalled = true;
  };
  mockSocket.onmessage = () => {
    secondListenerCalled = true;
  };

  mockServer.on('connection', () => {
    mockServer.send('test message');
    t.false(firstListenerCalled, 'The first listener should not be called');
    t.true(secondListenerCalled, 'Only the second listener should be called');
    mockServer.close();
    t.end();
  });
});

test.cb('reassigning websocket onclose listener should replace previous listeners', t => {
  const socketUrl = 'ws://localhost:8080';
  const mockServer = new Server(socketUrl);
  const mockSocket = new WebSocket(socketUrl);

  let firstListenerCalled = false;
  let secondListenerCalled = false;

  mockSocket.onclose = () => {
    firstListenerCalled = true;
  };
  mockSocket.onclose = () => {
    secondListenerCalled = true;
  };

  mockServer.close();

  t.false(firstListenerCalled, 'The first listener should not be called');
  t.true(secondListenerCalled, 'Only the second listener should be called');
  t.end();
});

test.cb('reassigning websocket onerror listener should replace previous listeners', t => {
  const socketUrl = 'ws://localhost:8080';
  const mockServer = new Server(socketUrl);
  const mockSocket = new WebSocket(socketUrl);

  let firstListenerCalled = false;
  let secondListenerCalled = false;

  mockSocket.onerror = () => {
    firstListenerCalled = true;
  };
  mockSocket.onerror = () => {
    secondListenerCalled = true;
  };

  mockServer.simulate('error');

  t.false(firstListenerCalled, 'The first listener should not be called');
  t.true(secondListenerCalled, 'Only the second listener should be called');
  mockServer.close();
  t.end();
});

test.cb('reassigning websocket null listener should clear previous listeners', t => {
  const socketUrl = 'ws://localhost:8080';
  const mockServer = new Server(socketUrl);
  const mockSocket = new WebSocket(socketUrl);

  let listenerCalled = false;

  mockSocket.onerror = () => {
    listenerCalled = true;
  };
  mockSocket.onerror = null;

  mockServer.simulate('error');

  t.false(listenerCalled, 'The first listener should not be called');
  t.end();
});
