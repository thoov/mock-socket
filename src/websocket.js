import urlVerification from './helpers/url-verification';
import protocolVerification from './helpers/protocol-verification';
import delay from './helpers/delay';
import EventTarget from './event/target';
import networkBridge from './network-bridge';
import { CLOSE_CODES } from './constants';
import logger from './helpers/logger';
import { createEvent, createMessageEvent, createCloseEvent } from './event/factory';

/*
* The main websocket class which is designed to mimick the native WebSocket class as close
* as possible.
*
* https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
*/
class WebSocket extends EventTarget {
  constructor(url, protocols) {
    super();

    this.url = urlVerification(url);
    protocols = protocolVerification(protocols);
    this.protocol = protocols[0] || '';

    this.binaryType = 'blob';
    this.readyState = WebSocket.CONNECTING;

    const server = networkBridge.attachWebSocket(this, this.url);

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
    delay(function delayCallback() {
      if (server) {
        if (
          server.options.verifyClient &&
          typeof server.options.verifyClient === 'function' &&
          !server.options.verifyClient()
        ) {
          this.readyState = WebSocket.CLOSED;

          logger(
            'error',
            `WebSocket connection to '${this.url}' failed: HTTP Authentication failed; no valid credentials available`
          );

          networkBridge.removeWebSocket(this, this.url);
          this.dispatchEvent(createEvent({ type: 'error', target: this }));
          this.dispatchEvent(createCloseEvent({ type: 'close', target: this, code: CLOSE_CODES.CLOSE_NORMAL }));
        } else {
          if (server.options.selectProtocol && typeof server.options.selectProtocol === 'function') {
            const selectedProtocol = server.options.selectProtocol(protocols);
            const isFilled = selectedProtocol !== '';
            const isRequested = protocols.indexOf(selectedProtocol) !== -1;
            if (isFilled && !isRequested) {
              this.readyState = WebSocket.CLOSED;

              logger('error', `WebSocket connection to '${this.url}' failed: Invalid Sub-Protocol`);

              networkBridge.removeWebSocket(this, this.url);
              this.dispatchEvent(createEvent({ type: 'error', target: this }));
              this.dispatchEvent(createCloseEvent({ type: 'close', target: this, code: CLOSE_CODES.CLOSE_NORMAL }));
              return;
            }
            this.protocol = selectedProtocol;
          }
          this.readyState = WebSocket.OPEN;
          this.dispatchEvent(createEvent({ type: 'open', target: this }));
          server.dispatchEvent(createEvent({ type: 'connection' }), server, this);
        }
      } else {
        this.readyState = WebSocket.CLOSED;
        this.dispatchEvent(createEvent({ type: 'error', target: this }));
        this.dispatchEvent(createCloseEvent({ type: 'close', target: this, code: CLOSE_CODES.CLOSE_NORMAL }));

        logger('error', `WebSocket connection to '${this.url}' failed`);
      }
    }, this);
  }

  get onopen() {
    return this.listeners.open;
  }

  get onmessage() {
    return this.listeners.message;
  }

  get onclose() {
    return this.listeners.close;
  }

  get onerror() {
    return this.listeners.error;
  }

  set onopen(listener) {
    this.addEventListener('open', listener);
  }

  set onmessage(listener) {
    this.addEventListener('message', listener);
  }

  set onclose(listener) {
    this.addEventListener('close', listener);
  }

  set onerror(listener) {
    this.addEventListener('error', listener);
  }

  /*
  * Transmits data to the server over the WebSocket connection.
  *
  * https://developer.mozilla.org/en-US/docs/Web/API/WebSocket#send()
  */
  send(data) {
    if (this.readyState === WebSocket.CLOSING || this.readyState === WebSocket.CLOSED) {
      throw new Error('WebSocket is already in CLOSING or CLOSED state');
    }

    const messageEvent = createMessageEvent({
      type: 'message',
      origin: this.url,
      data
    });

    const server = networkBridge.serverLookup(this.url);

    if (server) {
      delay(() => {
        server.dispatchEvent(messageEvent, data);
      }, server);
    }
  }

  /*
  * Closes the WebSocket connection or connection attempt, if any.
  * If the connection is already CLOSED, this method does nothing.
  *
  * https://developer.mozilla.org/en-US/docs/Web/API/WebSocket#close()
  */
  close() {
    if (this.readyState !== WebSocket.OPEN) {
      return undefined;
    }

    const server = networkBridge.serverLookup(this.url);
    const closeEvent = createCloseEvent({
      type: 'close',
      target: this,
      code: CLOSE_CODES.CLOSE_NORMAL
    });

    networkBridge.removeWebSocket(this, this.url);

    this.readyState = WebSocket.CLOSED;
    this.dispatchEvent(closeEvent);

    if (server) {
      server.dispatchEvent(closeEvent, server);
    }
  }
}

WebSocket.CONNECTING = 0;
WebSocket.OPEN = 1;
WebSocket.CLOSING = 2;
WebSocket.CLOSED = 3;

export default WebSocket;
