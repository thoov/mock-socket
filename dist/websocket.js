(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './helpers/delay', './event-target', './network-bridge', './helpers/close-codes', './helpers/normalize-url', './helpers/logger', './event-factory'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./helpers/delay'), require('./event-target'), require('./network-bridge'), require('./helpers/close-codes'), require('./helpers/normalize-url'), require('./helpers/logger'), require('./event-factory'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.delay, global.eventTarget, global.networkBridge, global.closeCodes, global.normalizeUrl, global.logger, global.eventFactory);
    global.websocket = mod.exports;
  }
})(this, function (exports, _delay, _eventTarget, _networkBridge, _closeCodes, _normalizeUrl, _logger, _eventFactory) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _delay2 = _interopRequireDefault(_delay);

  var _eventTarget2 = _interopRequireDefault(_eventTarget);

  var _networkBridge2 = _interopRequireDefault(_networkBridge);

  var _closeCodes2 = _interopRequireDefault(_closeCodes);

  var _normalizeUrl2 = _interopRequireDefault(_normalizeUrl);

  var _logger2 = _interopRequireDefault(_logger);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var WebSocket = function (_EventTarget) {
    _inherits(WebSocket, _EventTarget);

    /*
    * @param {string} url
    */
    function WebSocket(url) {
      var protocol = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      _classCallCheck(this, WebSocket);

      var _this = _possibleConstructorReturn(this, (WebSocket.__proto__ || Object.getPrototypeOf(WebSocket)).call(this));

      if (!url) {
        throw new TypeError('Failed to construct \'WebSocket\': 1 argument required, but only 0 present.');
      }

      _this.binaryType = 'blob';
      _this.url = (0, _normalizeUrl2.default)(url);
      _this.readyState = WebSocket.CONNECTING;
      _this.protocol = '';

      if (typeof protocol === 'string') {
        _this.protocol = protocol;
      } else if (Array.isArray(protocol) && protocol.length > 0) {
        _this.protocol = protocol[0];
      }

      /*
      * In order to capture the callback function we need to define custom setters.
      * To illustrate:
      *   mySocket.onopen = function() { alert(true) };
      *
      * The only way to capture that function and hold onto it for later is with the
      * below code:
      */
      Object.defineProperties(_this, {
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

      var server = _networkBridge2.default.attachWebSocket(_this, _this.url);

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

            (0, _logger2.default)('error', 'WebSocket connection to \'' + this.url + '\' failed: HTTP Authentication failed; no valid credentials available');

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

          (0, _logger2.default)('error', 'WebSocket connection to \'' + this.url + '\' failed');
        }
      }, _this);
      return _this;
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

        var server = _networkBridge2.default.serverLookup(this.url);

        if (server) {
          server.dispatchEvent(messageEvent, data);
        }
      }
    }, {
      key: 'close',
      value: function close() {
        if (this.readyState !== WebSocket.OPEN) {
          return undefined;
        }

        var server = _networkBridge2.default.serverLookup(this.url);
        var closeEvent = (0, _eventFactory.createCloseEvent)({
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
    }]);

    return WebSocket;
  }(_eventTarget2.default);

  WebSocket.CONNECTING = 0;
  WebSocket.OPEN = 1;
  WebSocket.CLOSING = 2;
  WebSocket.CLOSED = 3;

  exports.default = WebSocket;
});