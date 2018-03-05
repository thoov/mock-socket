import test from 'ava';
import Server from '../../src/server';
import WebSocket from '../../src/websocket';
import networkBridge from '../../src/network-bridge';
import delay from '../../src/helpers/delay';

test.afterEach(() => {
  networkBridge.urlMap = {};
});

test('calling close with a code that is not a number, 1000, < 3000, or > 4999 throws an error', t => {
  const server = new Server('ws://localhost:8080');
  const mockSocket = new WebSocket('ws://localhost:8080');

  const wrongType = t.throws(() => {
    mockSocket.close(false);
  });

  t.is(
    wrongType.message, // eslint-disable-next-line max-len
    "Failed to execute 'close' on 'WebSocket': The code must be either 1000, or between 3000 and 4999. false is neither."
  );

  const numberToSmall = t.throws(() => {
    mockSocket.close(2999);
  });

  t.is(
    numberToSmall.message,
    "Failed to execute 'close' on 'WebSocket': The code must be either 1000, or between 3000 and 4999. 2999 is neither."
  );

  const numberToLarge = t.throws(() => {
    mockSocket.close(5000);
  });

  t.is(
    numberToLarge.message,
    "Failed to execute 'close' on 'WebSocket': The code must be either 1000, or between 3000 and 4999. 5000 is neither."
  );
});

test('that if reason is passed to close it must be under 123 bytes else an error is thrown', t => {
  const server = new Server('ws://localhost:8080');
  const mockSocket = new WebSocket('ws://localhost:8080');

  const longMessageError = t.throws(() => {
    mockSocket.close(
      1000,
      `
      This is a very long message that should be over the 123 byte length so this will trigger an error
      This is a very long message that should be over the 123 byte length so this will trigger an error
      This is a very long message that should be over the 123 byte length so this will trigger an error
    `
    );
  });

  t.is(
    longMessageError.message,
    "Failed to execute 'close' on 'WebSocket': The message must not be greater than 123 bytes."
  );
});

test.cb('that if the readyState is CLOSED or CLOSING calling closed does nothing', t => {
  const server = new Server('ws://localhost:8080');
  const mockSocket = new WebSocket('ws://localhost:8080');

  mockSocket.readyState = WebSocket.CLOSED;

  mockSocket.onerror = () => {
    t.fail('this method should not be called');
  };

  mockSocket.onclose = () => {
    t.fail('this method should not be called');
  };

  mockSocket.close();

  delay(() => {
    t.end();
  });
});

test.cb('that if the readyState is CONNECTING we fail the connection and close', t => {
  const server = new Server('ws://localhost:8080');
  const mockSocket = new WebSocket('ws://localhost:8080');

  mockSocket.readyState = WebSocket.CONNECTING;

  mockSocket.onerror = () => {
    t.is(mockSocket.readyState, WebSocket.CLOSED);
  };

  mockSocket.onclose = () => {
    t.is(mockSocket.readyState, WebSocket.CLOSED);
    t.end();
  };

  mockSocket.close();
});
