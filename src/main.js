import MockServer from './server';
import MockWebSocket from './websocket';
import MockSocketIO from './socket-io';
import environment from './helpers/environment-check';

const { globalContext } = environment;

globalContext.MockServer = MockServer;
globalContext.MockWebSocket = MockWebSocket;
globalContext.MockSocketIO = MockSocketIO;

export const Server = MockServer;
export const WebSocket = MockWebSocket;
export const SocketIO = MockSocketIO;
