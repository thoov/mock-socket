(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './helpers/delay', './event-target', './network-bridge', './helpers/close-codes', './helpers/normalize-url', './event-factory'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./helpers/delay'), require('./event-target'), require('./network-bridge'), require('./helpers/close-codes'), require('./helpers/normalize-url'), require('./event-factory'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.delay, global.eventTarget, global.networkBridge, global.closeCodes, global.normalizeUrl, global.eventFactory);
    global.websocket = mod.exports;
  }
})(this, function (exports, _delay, _eventTarget, _networkBridge, _closeCodes, _normalizeUrl, _eventFactory) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _delay2 = _interopRequireDefault(_delay);

  var _eventTarget2 = _interopRequireDefault(_eventTarget);

  var _networkBridge2 = _interopRequireDefault(_networkBridge);

  var _closeCodes2 = _interopRequireDefault(_closeCodes);

  var _normalizeUrl2 = _interopRequireDefault(_normalizeUrl);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  /*
  * The main websocket class which is designed to mimick the native WebSocket class as close
  * as possible.
  *
  * https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
  */
  class WebSocket extends _eventTarget2.default {
    /*
    * @param {string} url
    */
    constructor(url, protocol = '') {
      super();

      if (!url) {
        throw new TypeError('Failed to construct \'WebSocket\': 1 argument required, but only 0 present.');
      }

      this.binaryType = 'blob';
      this.url = (0, _normalizeUrl2.default)(url);
      this.readyState = WebSocket.CONNECTING;
      this.protocol = '';

      if (typeof protocol === 'string') {
        this.protocol = protocol;
      } else if (Array.isArray(protocol) && protocol.length > 0) {
        this.protocol = protocol[0];
      }

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

      const server = _networkBridge2.default.attachWebSocket(this, this.url);

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
      (0, _delay2.default)(function delayCallback() {
        if (server) {
          if (server.options.verifyClient && typeof server.options.verifyClient === 'function' && !server.options.verifyClient()) {
            this.readyState = WebSocket.CLOSED;

            /* eslint-disable no-console */
            console.error(`WebSocket connection to '${ this.url }' failed: HTTP Authentication failed; no valid credentials available`);
            /* eslint-enable no-console */

            _networkBridge2.default.removeWebSocket(this, this.url);
            this.dispatchEvent((0, _eventFactory.createEvent)({ type: 'error', target: this }));
            this.dispatchEvent((0, _eventFactory.createCloseEvent)({ type: 'close', target: this, code: _closeCodes2.default.CLOSE_NORMAL }));
          } else {
            this.readyState = WebSocket.OPEN;
            server.dispatchEvent((0, _eventFactory.createEvent)({ type: 'connection' }), server, this);
            this.dispatchEvent((0, _eventFactory.createEvent)({ type: 'open', target: this }));
          }
        } else {
          this.readyState = WebSocket.CLOSED;
          this.dispatchEvent((0, _eventFactory.createEvent)({ type: 'error', target: this }));
          this.dispatchEvent((0, _eventFactory.createCloseEvent)({ type: 'close', target: this, code: _closeCodes2.default.CLOSE_NORMAL }));

          /* eslint-disable no-console */
          console.error(`WebSocket connection to '${ this.url }' failed`);
          /* eslint-enable no-console */
        }
      }, this);
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

      const messageEvent = (0, _eventFactory.createMessageEvent)({
        type: 'message',
        origin: this.url,
        data
      });

      const server = _networkBridge2.default.serverLookup(this.url);

      if (server) {
        server.dispatchEvent(messageEvent, data);
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

      const server = _networkBridge2.default.serverLookup(this.url);
      const closeEvent = (0, _eventFactory.createCloseEvent)({
        type: 'close',
        target: this,
        code: _closeCodes2.default.CLOSE_NORMAL
      });

      _networkBridge2.default.removeWebSocket(this, this.url);

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

  exports.default = WebSocket;
});