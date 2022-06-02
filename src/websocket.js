import delay from './helpers/delay';
import logger from './helpers/logger';
import EventTarget from './event/target';
import networkBridge from './network-bridge';
import proxyFactory from './helpers/proxy-factory';
import lengthInUtf8Bytes from './helpers/byte-length';
import { CLOSE_CODES, ERROR_PREFIX } from './constants';
import urlVerification from './helpers/url-verification';
import normalizeSendData from './helpers/normalize-send';
import protocolVerification from './helpers/protocol-verification';
import { createEvent, createMessageEvent, createCloseEvent } from './event/factory';
import { closeWebSocketConnection, failWebSocketConnection } from './algorithms/close';

/*
 * The main websocket class which is designed to mimick the native WebSocket class as close
 * as possible.
 *
 * https://html.spec.whatwg.org/multipage/web-sockets.html
 */
class WebSocket extends EventTarget {
  constructor(url, protocols) {
    super();

    this.onopenCb = null;
    this.onmessageCb = null;
    this.onerrorCb = null;
    this.oncloseCb = null;

    this.url = urlVerification(url);
    protocols = protocolVerification(protocols);
    this.protocol = protocols[0] || '';

    this.binaryType = 'blob';
    this.readyState = WebSocket.CONNECTING;

    const client = proxyFactory(this);
    const server = networkBridge.attachWebSocket(client, this.url);

    /*
     * This delay is needed so that we dont trigger an event before the callbacks have been
     * setup. For example:
     *
     * var socket = new WebSocket('ws://localhost');
     *
     * If we dont have the delay then the event would be triggered right here and this is
     * before the onopen had a chance to register itself.
     *
     * socket.onopen = () => { // this would never be called };
     *
     * and with the delay the event gets triggered here after all of the callbacks have been
     * registered :-)
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

          networkBridge.removeWebSocket(client, this.url);
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

              networkBridge.removeWebSocket(client, this.url);
              this.dispatchEvent(createEvent({ type: 'error', target: this }));
              this.dispatchEvent(createCloseEvent({ type: 'close', target: this, code: CLOSE_CODES.CLOSE_NORMAL }));
              return;
            }
            this.protocol = selectedProtocol;
          }
          this.readyState = WebSocket.OPEN;
          this.dispatchEvent(createEvent({ type: 'open', target: this }));
          server.dispatchEvent(createEvent({ type: 'connection' }), client);
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
    return this.onopenCb;
  }

  get onmessage() {
    return this.onmessageCb;
  }

  get onclose() {
    return this.oncloseCb;
  }

  get onerror() {
    return this.onerrorCb;
  }

  set onopen(listener) {
    if (listener === null) {
      if (this.onopenCb !== null) {
        this.removeEventListener('open', this.onopenCb);
      }
    } else {
      this.onopen = null;
      this.addEventListener('open', listener);
    }
    this.onopenCb = listener;
  }

  set onmessage(listener) {
    if (listener === null) {
      if (this.onmessageCb !== null) {
        this.removeEventListener('message', this.onmessageCb);
      }
    } else {
      this.onmessage = null;
      this.addEventListener('message', listener);
    }
    this.onmessageCb = listener;
  }

  set onclose(listener) {
    if (listener === null) {
      if (this.oncloseCb !== null) {
        this.removeEventListener('close', this.oncloseCb);
      }
    } else {
      this.onclose = null;
      this.addEventListener('close', listener);
    }
    this.oncloseCb = listener;
  }

  set onerror(listener) {
    if (listener === null) {
      if (this.onerrorCb !== null) {
        this.removeEventListener('error', this.onerrorCb);
      }
    } else {
      this.onerror = null;
      this.addEventListener('error', listener);
    }
    this.onerrorCb = listener;
  }

  send(data) {
    if (this.readyState === WebSocket.CLOSING || this.readyState === WebSocket.CLOSED) {
      throw new Error('WebSocket is already in CLOSING or CLOSED state');
    }

    // TODO: handle bufferedAmount

    const messageEvent = createMessageEvent({
      type: 'server::message',
      origin: this.url,
      data: normalizeSendData(data)
    });

    const server = networkBridge.serverLookup(this.url);

    if (server) {
      delay(() => {
        this.dispatchEvent(messageEvent, data);
      }, server);
    }
  }

  close(code, reason) {
    if (code !== undefined) {
      if (typeof code !== 'number' || (code !== 1000 && (code < 3000 || code > 4999))) {
        throw new TypeError(
          `${ERROR_PREFIX.CLOSE_ERROR} The code must be either 1000, or between 3000 and 4999. ${code} is neither.`
        );
      }
    }

    if (reason !== undefined) {
      const length = lengthInUtf8Bytes(reason);

      if (length > 123) {
        throw new SyntaxError(`${ERROR_PREFIX.CLOSE_ERROR} The message must not be greater than 123 bytes.`);
      }
    }

    if (this.readyState === WebSocket.CLOSING || this.readyState === WebSocket.CLOSED) {
      return;
    }

    const client = proxyFactory(this);
    if (this.readyState === WebSocket.CONNECTING) {
      failWebSocketConnection(client, code || CLOSE_CODES.CLOSE_ABNORMAL, reason);
    } else {
      closeWebSocketConnection(client, code || CLOSE_CODES.CLOSE_NO_STATUS, reason);
    }
  }
}

WebSocket.CONNECTING = 0;
WebSocket.prototype.CONNECTING = WebSocket.CONNECTING;
WebSocket.OPEN = 1;
WebSocket.prototype.OPEN = WebSocket.OPEN;
WebSocket.CLOSING = 2;
WebSocket.prototype.CLOSING = WebSocket.CLOSING;
WebSocket.CLOSED = 3;
WebSocket.prototype.CLOSED = WebSocket.CLOSED;

export default WebSocket;
