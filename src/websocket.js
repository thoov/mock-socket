import URL from 'url-parse';
import EventTarget from './event/target';
import { ERROR_PREFIX } from './constants';
import utf8ByteLength from './utils/utf8-byte-length';
import { findDuplicates } from './utils/array-helpers';
import { connectionQueue, closeQueue, sendQueue } from './tasks/index';

const { CONSTRUCTOR_ERROR, CLOSE_ERROR } = ERROR_PREFIX;

/*
 * The main websocket class which is designed to mimick the native WebSocket class as close
 * as possible.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
 * https://html.spec.whatwg.org/multipage/comms.html#network
 */
class WebSocket extends EventTarget {
  constructor(url, protocol = '') {
    super();

    if (!url) {
      throw new TypeError(`${CONSTRUCTOR_ERROR} 1 argument required, but only 0 present.`);
    }

    const urlRecord = new URL(url);

    if (!urlRecord.pathname) {
      urlRecord.pathname = '/';
    }

    if (!urlRecord.protocol) {
      throw new SyntaxError(`${CONSTRUCTOR_ERROR} The URL '${urlRecord.toString()}' is invalid.`);
    }

    // TODO might need to strip off the :
    if (urlRecord.protocol !== 'ws:' && urlRecord.protocol !== 'wss:') {
      throw new SyntaxError(
        `${CONSTRUCTOR_ERROR} The URL's scheme must be either 'ws' or 'wss'. '${urlRecord.protocol}' is not allowed.`
      );
    }

    if (urlRecord.hash) {
      throw new SyntaxError(
        `${CONSTRUCTOR_ERROR} The URL contains a fragment identifier ('${urlRecord.hash}').` +
          ' Fragment identifiers are not allowed in WebSocket URLs.'
      );
    }

    this.url = urlRecord.toString();

    this.protocol = '';
    if (typeof protocol === 'string') {
      this.protocol = protocol;
    } else if (Array.isArray(protocol) && protocol.length > 0) {
      const duplicates = findDuplicates(protocol);

      if (duplicates.length) {
        throw new SyntaxError(`${CONSTRUCTOR_ERROR} The subprotocol '${duplicates[0]}' is duplicated.`);
      }

      this.protocol = protocol[0];
    }

    this.binaryType = 'blob';
    this.readyState = WebSocket.CONNECTING;
    this.extensions = '';
    this.bufferedAmount = 0;

    /*
    * In order to capture the callback function we need to define custom setters.
    * To illustrate:
    *   mySocket.onopen = function() { alert(true) };
    *
    * The only way to capture that function and hold onto it for later is with the
    * below code:
    */
    Object.defineProperties(this, {
      onopen: {
        configurable: true,
        enumerable: true,
        get() {
          return this.listeners.open;
        },
        set(listener) {
          this.addEventListener('open', listener);
        }
      },
      onmessage: {
        configurable: true,
        enumerable: true,
        get() {
          return this.listeners.message;
        },
        set(listener) {
          this.addEventListener('message', listener);
        }
      },
      onclose: {
        configurable: true,
        enumerable: true,
        get() {
          return this.listeners.close;
        },
        set(listener) {
          this.addEventListener('close', listener);
        }
      },
      onerror: {
        configurable: true,
        enumerable: true,
        get() {
          return this.listeners.error;
        },
        set(listener) {
          this.addEventListener('error', listener);
        }
      }
    });

    if (!this.__getNetworkConnection) {
      throw new Error('WebSocket must be created via createMocks. Please references this for more details.');
    }

    connectionQueue(this);
  }

  /*
  * Transmits data to the server over the WebSocket connection.
  *
  * https://developer.mozilla.org/en-US/docs/Web/API/WebSocket#send()
  */
  send(data) {
    if (this.readyState === WebSocket.CONNECTING) {
      // TODO: should be InvalidStateError
      throw new Error("Failed to execute 'send' on 'WebSocket': Still in CONNECTING state.");
    }

    if (this.readyState === WebSocket.CLOSING || this.readyState === WebSocket.CLOSED) {
      // Chrome console logs an error and safari does nothing
      return;
    }

    sendQueue(this, data);
  }

  /*
  * Closes the WebSocket connection or connection attempt, if any.
  * If the connection is already CLOSED, this method does nothing.
  *
  * https://developer.mozilla.org/en-US/docs/Web/API/WebSocket#close()
  */
  close(code, reason) {
    if (this.readyState === WebSocket.CLOSING || this.readyState === WebSocket.CLOSED) {
      return undefined;
    }

    if (code) {
      // TODO: code might need to be converted to a number
      if (typeof code !== 'number' || code > 4999 || (code < 3000 && code !== 1000)) {
        // TODO: should be InvalidAccessError;
        throw new TypeError(
          `${CLOSE_ERROR} The code must be either 1000, or between 3000 and 4999. ${code} is neither.`
        );
      }
    }

    if (reason) {
      const reasonBytes = utf8ByteLength(reason);

      if (reasonBytes > 123) {
        throw new SyntaxError(`${CLOSE_ERROR} The message must not be greater than 123 bytes.`);
      }
    }

    if (this.readyState === WebSocket.CONNECTING) {
      this.readyState = WebSocket.CLOSING;
    }

    closeQueue(this, code, reason);
  }
}

WebSocket.CONNECTING = 0;
WebSocket.OPEN = 1;
WebSocket.CLOSING = 2;
WebSocket.CLOSED = 3;

export default WebSocket;
