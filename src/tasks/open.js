import WebSocket from '../websocket';
import { findDuplicates } from '../utils/array-helpers';
import { CLOSE_CODES, ERROR_PREFIX } from '../constants';
import { createEvent, createCloseEvent } from '../event/factory';

function handleProtocols(server, protocol) {
  if (Array.isArray(protocol)) {
    const duplicates = findDuplicates(protocol);

    if (duplicates.length) {
      throw new SyntaxError(`${ERROR_PREFIX.CONSTRUCTOR_ERROR} The subprotocol '${duplicates[0]}' is duplicated.`);
    }
  } else {
    protocol = [protocol];
  }

  const supportedProtocols = server.options.handleProtocols(protocol);

  if (!supportedProtocols) {
    throw new SyntaxError(
      `${ERROR_PREFIX.CONSTRUCTOR_ERROR} A subprotocol is not supported.` // TODO: is this correct?
    );
  }

  return supportedProtocols[0];
}

function verifyClient(server) {
  if (typeof server.verifyClient === 'function') {
    return server.verifyClient();
  }

  return true;
}

export default (websocket, protocol) => {
  const server = websocket.__getNetworkConnection().serverLookup(websocket.url);
  let serverVerifiedProtocol = '';

  if (server) {
    serverVerifiedProtocol = handleProtocols(server, protocol);
    verifyClient(server); // TODO: error if false
  }

  setTimeout(() => {
    if (server) {
      websocket.__getNetworkConnection().attachWebSocket(websocket, websocket.url);
      websocket.readyState = WebSocket.OPEN;
      websocket.protocol = serverVerifiedProtocol;

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
