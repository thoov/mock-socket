import Server from './server';
import WebSocket from './websocket';

window.MockServer = Server;
window.MockSocket = WebSocket; // TODO: remove this as we want people to use MockWebSocket
window.MockWebSocket = WebSocket;
