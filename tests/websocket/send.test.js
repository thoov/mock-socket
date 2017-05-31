import test from 'ava';
import { createMocks } from '../../src/index';

test('calling send while the websocket is connecting throws an error', t => {
  const { WebSocket, Server } = createMocks();
  const server = new Server('ws://example.com');
  server.start();

  t.throws(
    () => {
      const websocket = new WebSocket('ws://example.com');
      websocket.send('foo-bar');
    },
    "Failed to execute 'send' on 'WebSocket': Still in CONNECTING state.",
    'calling send while the websocket is connecting throws an error'
  );

  server.stop();
});

test('', t => {
  const { WebSocket, Server } = createMocks();
  const server = new Server('ws://example.com');
  server.start();

  t.throws(
    () => {
      const websocket = new WebSocket('ws://example.com');
      websocket.send('foo-bar');
    },
    "Failed to execute 'send' on 'WebSocket': Still in CONNECTING state.",
    'calling send while the websocket is connecting throws an error'
  );

  server.stop();
});
