import MockServer from './server';
import MockSocketIO from './socket-io';
import MockWebSocket from './websocket';

if (typeof window !== 'undefined') {
  window.MockServer = MockServer;
  window.MockWebSocket = MockWebSocket;
  window.MockSocketIO = MockSocketIO;
}

export const Server = MockServer;
export const WebSocket = MockWebSocket;
export const SocketIO = MockSocketIO;
