import WebSocket from '../websocket';
import CLOSE_CODES from '../constants';
import { createCloseEvent } from '../event/factory';

export default (websocket /* code  reason */) => {
  setTimeout(() => {
    websocket.readyState = WebSocket.CLOSED;
    const networkBridge = websocket.__getNetworkConnection();

    // If the user agent was required to fail the WebSocket connection, or if the the WebSocket
    // connection was closed after being flagged as full trigger error this.dispatchEvent('error');

    const server = networkBridge.serverLookup(websocket.url);
    const closeEvent = createCloseEvent({
      type: 'close',
      target: websocket,
      code: CLOSE_CODES.CLOSE_NORMAL
    });

    networkBridge.removeWebSocket(websocket, websocket.url);

    websocket.readyState = WebSocket.CLOSED;
    websocket.dispatchEvent(closeEvent);

    if (server) {
      server.dispatchEvent(closeEvent, server);
    }
  }, 0);
};
