import test from 'ava';
import Server from '../../src/server';
import WebSocket from '../../src/websocket';

test('websocket on* methods family returns a single listener', t => {
  const socketUrl = 'ws://localhost:8080';
  const mockServer = new Server(socketUrl);
  const mockSocket = new WebSocket(socketUrl);

  const listener = () => {
    /* do nothing */
  };

  mockSocket.onopen = listener;
  mockSocket.onmessage = listener;
  mockSocket.onerror = listener;
  mockSocket.onclose = listener;

  t.is(mockSocket.onopen, listener);
  t.is(mockSocket.onmessage, listener);
  t.is(mockSocket.onerror, listener);
  t.is(mockSocket.onclose, listener);

  mockServer.close();
});

test("websocket on* methods family doesn't delete other listeners", async t => {
  const socketUrl = 'ws://localhost:8080';
  const mockServer = new Server(socketUrl);
  const mockSocket = new WebSocket(socketUrl);

  mockServer.on('connection', socket => {
    socket.send('test message');
  });

  let onOpenCalled = 0;
  let onMessageCalled = 0;
  let onErrorCalled = 0;

  let onCloseEventResolve;
  let onCloseResolve;
  const allClosed = Promise.all([
    new Promise(r => {
      onCloseEventResolve = r;
    }),
    new Promise(r => {
      onCloseResolve = r;
    })
  ]);

  mockSocket.addEventListener('open', () => {
    onOpenCalled += 1;
  });
  mockSocket.addEventListener('message', () => {
    onMessageCalled += 1;
    mockSocket.dispatchEvent(new Event('error'));
  });
  mockSocket.addEventListener('error', () => {
    onErrorCalled += 1;
    mockSocket.close();
  });
  mockSocket.addEventListener('close', () => onCloseEventResolve());

  const throwCb = () => {
    throw new Error('this call should have been replaced');
  };
  mockSocket.onopen = throwCb;
  mockSocket.onopen = () => {
    onOpenCalled += 1;
  };
  mockSocket.onmessage = throwCb;
  mockSocket.onmessage = () => {
    onMessageCalled += 1;
  };
  mockSocket.onerror = throwCb;
  mockSocket.onerror = () => {
    onErrorCalled += 1;
  };
  mockSocket.onclose = throwCb;
  mockSocket.onclose = () => onCloseResolve();

  await allClosed;

  t.is(onOpenCalled, 2);
  t.is(onMessageCalled, 2);
  t.is(onErrorCalled, 2);

  mockServer.close();
});
