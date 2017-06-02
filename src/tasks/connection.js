import WebSocket from '../websocket';
import CLOSE_CODES from '../constants';
import { createEvent, createCloseEvent } from '../event/factory';

export default websocket => {
  setTimeout(() => {
    const server = websocket.__getNetworkConnection().attachWebSocket(websocket, websocket.url);

    if (server) {
      websocket.readyState = WebSocket.OPEN;

      // TODO: check extensions from server
      // TODO: check protocols from server
      // TODO: check verifyClient but do it on the server side

      websocket.dispatchEvent(createEvent({ type: 'open', target: websocket }));
      server.dispatchEvent(createEvent({ type: 'connection' }), server, websocket);
    } else {
      websocket.readyState = WebSocket.CLOSED;
      websocket.dispatchEvent(createEvent({ type: 'error', target: websocket }));
      websocket.dispatchEvent(createCloseEvent({ type: 'close', target: websocket, code: CLOSE_CODES.CLOSE_NORMAL }));

      console.error(`WebSocket connection to '${websocket.url}' failed`); // TODO: test this
    }
  }, 0);
};
