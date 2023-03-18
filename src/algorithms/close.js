import WebSocket from '../websocket';
import delay from '../helpers/delay';
import networkBridge from '../network-bridge';
import { createCloseEvent, createEvent } from '../event/factory';

export function closeWebSocketConnection(context, code, reason) {
  context.readyState = WebSocket.CLOSING;

  const server = networkBridge.serverLookup(context.url);
  const closeEvent = createCloseEvent({
    type: 'close',
    target: context.target,
    code,
    reason
  });

  const connectionDelay = server && server.options && server.options.connectionDelay;

  delay(() => {
    networkBridge.removeWebSocket(context, context.url);

    context.readyState = WebSocket.CLOSED;
    context.dispatchEvent(closeEvent);

    if (server) {
      server.dispatchEvent(closeEvent, server);
    }
  }, context, connectionDelay);
}

export function failWebSocketConnection(context, code, reason) {
  context.readyState = WebSocket.CLOSING;

  const server = networkBridge.serverLookup(context.url);
  const closeEvent = createCloseEvent({
    type: 'close',
    target: context.target,
    code,
    reason,
    wasClean: false
  });

  const errorEvent = createEvent({
    type: 'error',
    target: context.target
  });

  const connectionDelay = server && server.options && server.options.connectionDelay;

  delay(() => {
    networkBridge.removeWebSocket(context, context.url);

    context.readyState = WebSocket.CLOSED;
    context.dispatchEvent(errorEvent);
    context.dispatchEvent(closeEvent);

    if (server) {
      server.dispatchEvent(closeEvent, server);
    }
  }, context, connectionDelay);
}
