'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _helpersDelay = require('./helpers/delay');

var _helpersDelay2 = _interopRequireDefault(_helpersDelay);

var _eventTarget = require('./event-target');

var _eventTarget2 = _interopRequireDefault(_eventTarget);

var _networkBridge = require('./network-bridge');

var _networkBridge2 = _interopRequireDefault(_networkBridge);

var _helpersCloseCodes = require('./helpers/close-codes');

var _helpersCloseCodes2 = _interopRequireDefault(_helpersCloseCodes);

var _helpersNormalizeUrl = require('./helpers/normalize-url');

var _helpersNormalizeUrl2 = _interopRequireDefault(_helpersNormalizeUrl);

var _eventFactory = require('./event-factory');

/*
* The main websocket class which is designed to mimick the native WebSocket class as close
* as possible.
*
* https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
*/

var WebSocket = (function (_EventTarget) {
  _inherits(WebSocket, _EventTarget);

  /*
  * @param {string} url
  */

  function WebSocket(url) {
    var protocol = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

    _classCallCheck(this, WebSocket);

    _get(Object.getPrototypeOf(WebSocket.prototype), 'constructor', this).call(this);

    if (!url) {
      throw new TypeError('Failed to construct \'WebSocket\': 1 argument required, but only 0 present.');
    }

    this.binaryType = 'blob';
    this.url = (0, _helpersNormalizeUrl2['default'])(url);
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
        get: function get() {
          return this.listeners.open;
        },
        set: function set(listener) {
          this.addEventListener('open', listener);
        }
      },
      onmessage: {
        configurable: true,
        enumerable: true,
        get: function get() {
          return this.listeners.message;
        },
        set: function set(listener) {
          this.addEventListener('message', listener);
        }
      },
      onclose: {
        configurable: true,
        enumerable: true,
        get: function get() {
          return this.listeners.close;
        },
        set: function set(listener) {
          this.addEventListener('close', listener);
        }
      },
      onerror: {
        configurable: true,
        enumerable: true,
        get: function get() {
          return this.listeners.error;
        },
        set: function set(listener) {
          this.addEventListener('error', listener);
        }
      }
    });

    var server = _networkBridge2['default'].attachWebSocket(this, this.url);

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
    (0, _helpersDelay2['default'])(function delayCallback() {
      if (server) {
        if (server.options.verifyClient && typeof server.options.verifyClient === 'function' && !server.options.verifyClient()) {
          this.readyState = WebSocket.CLOSED;

          /* eslint-disable no-console */
          console.error('WebSocket connection to \'' + this.url + '\' failed: HTTP Authentication failed; no valid credentials available');
          /* eslint-enable no-console */

          this.dispatchEvent((0, _eventFactory.createEvent)({ type: 'error', target: this }));
          this.dispatchEvent((0, _eventFactory.createCloseEvent)({ type: 'close', target: this, code: _helpersCloseCodes2['default'].CLOSE_NORMAL }));
        } else {
          this.readyState = WebSocket.OPEN;
          server.dispatchEvent((0, _eventFactory.createEvent)({ type: 'connection' }), server, this);
          this.dispatchEvent((0, _eventFactory.createEvent)({ type: 'open', target: this }));
        }
      } else {
        this.readyState = WebSocket.CLOSED;
        this.dispatchEvent((0, _eventFactory.createEvent)({ type: 'error', target: this }));
        this.dispatchEvent((0, _eventFactory.createCloseEvent)({ type: 'close', target: this, code: _helpersCloseCodes2['default'].CLOSE_NORMAL }));

        /* eslint-disable no-console */
        console.error('WebSocket connection to \'' + this.url + '\' failed');
        /* eslint-enable no-console */
      }
    }, this);
  }

  /*
  * Transmits data to the server over the WebSocket connection.
  *
  * https://developer.mozilla.org/en-US/docs/Web/API/WebSocket#send()
  */

  _createClass(WebSocket, [{
    key: 'send',
    value: function send(data) {
      if (this.readyState === WebSocket.CLOSING || this.readyState === WebSocket.CLOSED) {
        throw new Error('WebSocket is already in CLOSING or CLOSED state');
      }

      var messageEvent = (0, _eventFactory.createMessageEvent)({
        type: 'message',
        origin: this.url,
        data: data
      });

      var server = _networkBridge2['default'].serverLookup(this.url);

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
  }, {
    key: 'close',
    value: function close() {
      if (this.readyState !== WebSocket.OPEN) {
        return undefined;
      }

      var server = _networkBridge2['default'].serverLookup(this.url);
      var closeEvent = (0, _eventFactory.createCloseEvent)({
        type: 'close',
        target: this,
        code: _helpersCloseCodes2['default'].CLOSE_NORMAL
      });

      _networkBridge2['default'].removeWebSocket(this, this.url);

      this.readyState = WebSocket.CLOSED;
      this.dispatchEvent(closeEvent);

      if (server) {
        server.dispatchEvent(closeEvent, server);
      }
    }
  }]);

  return WebSocket;
})(_eventTarget2['default']);

WebSocket.CONNECTING = 0;
WebSocket.OPEN = 1;
WebSocket.CLOSING = 2;
WebSocket.CLOSED = 3;

exports['default'] = WebSocket;
module.exports = exports['default'];