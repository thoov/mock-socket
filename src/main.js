import Server from './server';
import WebSocket from './websocket';
import environment from './helpers/environment-check';

var { globalContext } = environment;

globalContext.MockServer    = Server;
globalContext.MockSocket    = WebSocket; // TODO: remove this as we want people to use MockWebSocket
globalContext.MockWebSocket = WebSocket;
