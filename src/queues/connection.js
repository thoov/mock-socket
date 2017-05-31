import WebSocket from '../websocket';
import logger from '../helpers/logger';
import CLOSE_CODES from '../helpers/close-codes';
import { createEvent, createCloseEvent } from '../event-factory';

export default websocket => {
  setTimeout(() => {
    // eslint-disable-next-line no-underscore-dangle
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

      logger('error', `WebSocket connection to '${websocket.url}' failed`); // TODO: test this
    }
  }, 0);
};
