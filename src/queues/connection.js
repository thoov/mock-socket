import delay from '../helpers/delay';
import networkBridge from '../network-bridge';
import CLOSE_CODES from '../helpers/close-codes';
import logger from '../helpers/logger';
import { createEvent, createCloseEvent } from '../event-factory';

export default (websocket) => {
  /*
  * This delay is needed so that we dont trigger an event before the callbacks have been
  * setup. For example:
  *
  * var socket = new WebSocket('ws://localhost');
  *
  * // If we dont have the delay then the event would be triggered right here and this is
  * // before the onopen had a chance to register itself.
  *
  * socket.onopen = () => { // this would never be called };
  *
  * // and with the delay the event gets triggered here after all of the callbacks have been
  * // registered :-)
  */
  delay(() => {
    const server = networkBridge.attachWebSocket(websocket, websocket.url);

    if (server) {

      this.readyState = WebSocket.OPEN;

      // check extensions from server

      // check protocols from server

      // fire on open event


      if (
        server.options.verifyClient &&
        typeof server.options.verifyClient === 'function' &&
        !server.options.verifyClient()
      ) {
        websocket.readyState = WebSocket.CLOSED;

        logger(
          'error',
          `WebSocket connection to '${websocket.url}' failed: HTTP Authentication failed; no valid credentials available`
        );

        networkBridge.removeWebSocket(websocket, websocket.url);
        websocket.dispatchEvent(createEvent({ type: 'error', target: websocket }));
        websocket.dispatchEvent(createCloseEvent({ type: 'close', target: websocket, code: CLOSE_CODES.CLOSE_NORMAL }));
      } else {
        websocket.readyState = WebSocket.OPEN;
        server.dispatchEvent(createEvent({ type: 'connection' }), server, websocket);
        websocket.dispatchEvent(createEvent({ type: 'open', target: websocket }));
      }
    } else {
      websocket.readyState = WebSocket.CLOSED;
      websocket.dispatchEvent(createEvent({ type: 'error', target: websocket }));
      websocket.dispatchEvent(createCloseEvent({ type: 'close', target: websocket, code: CLOSE_CODES.CLOSE_NORMAL }));

      logger('error', `WebSocket connection to '${websocket.url}' failed`);
    }
  }, websocket);
}
