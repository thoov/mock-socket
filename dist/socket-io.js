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
    global.socketIo = mod.exports;
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

  var SocketIO = function (_EventTarget) {
    _inherits(SocketIO, _EventTarget);

    /*
    * @param {string} url
    */
    function SocketIO() {
      var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'socket.io';
      var protocol = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      _classCallCheck(this, SocketIO);

      var _this = _possibleConstructorReturn(this, (SocketIO.__proto__ || Object.getPrototypeOf(SocketIO)).call(this));

      _this.binaryType = 'blob';
      _this.url = (0, _normalizeUrl2.default)(url);
      _this.readyState = SocketIO.CONNECTING;
      _this.protocol = '';

      if (typeof protocol === 'string') {
        _this.protocol = protocol;
      } else if (Array.isArray(protocol) && protocol.length > 0) {
        _this.protocol = protocol[0];
      }

      var server = _networkBridge2.default.attachWebSocket(_this, _this.url);

      /*
      * Delay triggering the connection events so they can be defined in time.
      */
      (0, _delay2.default)(function delayCallback() {
        if (server) {
          this.readyState = SocketIO.OPEN;
          server.dispatchEvent((0, _eventFactory.createEvent)({ type: 'connection' }), server, this);
          server.dispatchEvent((0, _eventFactory.createEvent)({ type: 'connect' }), server, this); // alias
          this.dispatchEvent((0, _eventFactory.createEvent)({ type: 'connect', target: this }));
        } else {
          this.readyState = SocketIO.CLOSED;
          this.dispatchEvent((0, _eventFactory.createEvent)({ type: 'error', target: this }));
          this.dispatchEvent((0, _eventFactory.createCloseEvent)({
            type: 'close',
            target: this,
            code: _closeCodes2.default.CLOSE_NORMAL
          }));

          (0, _logger2.default)('error', 'Socket.io connection to \'' + this.url + '\' failed');
        }
      }, _this);

      /**
        Add an aliased event listener for close / disconnect
       */
      _this.addEventListener('close', function (event) {
        _this.dispatchEvent((0, _eventFactory.createCloseEvent)({
          type: 'disconnect',
          target: event.target,
          code: event.code
        }));
      });
      return _this;
    }

    /*
    * Closes the SocketIO connection or connection attempt, if any.
    * If the connection is already CLOSED, this method does nothing.
    */


    _createClass(SocketIO, [{
      key: 'close',
      value: function close() {
        if (this.readyState !== SocketIO.OPEN) {
          return undefined;
        }

        var server = _networkBridge2.default.serverLookup(this.url);
        _networkBridge2.default.removeWebSocket(this, this.url);

        this.readyState = SocketIO.CLOSED;
        this.dispatchEvent((0, _eventFactory.createCloseEvent)({
          type: 'close',
          target: this,
          code: _closeCodes2.default.CLOSE_NORMAL
        }));

        if (server) {
          server.dispatchEvent((0, _eventFactory.createCloseEvent)({
            type: 'disconnect',
            target: this,
            code: _closeCodes2.default.CLOSE_NORMAL
          }), server);
        }
      }
    }, {
      key: 'disconnect',
      value: function disconnect() {
        this.close();
      }
    }, {
      key: 'emit',
      value: function emit(event) {
        for (var _len = arguments.length, data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          data[_key - 1] = arguments[_key];
        }

        if (this.readyState !== SocketIO.OPEN) {
          throw new Error('SocketIO is already in CLOSING or CLOSED state');
        }

        var messageEvent = (0, _eventFactory.createMessageEvent)({
          type: event,
          origin: this.url,
          data: data
        });

        var server = _networkBridge2.default.serverLookup(this.url);

        if (server) {
          server.dispatchEvent.apply(server, [messageEvent].concat(data));
        }
      }
    }, {
      key: 'send',
      value: function send(data) {
        this.emit('message', data);
      }
    }, {
      key: 'on',
      value: function on(type, callback) {
        this.addEventListener(type, callback);
      }
    }, {
      key: 'join',
      value: function join(room) {
        _networkBridge2.default.addMembershipToRoom(this, room);
      }
    }, {
      key: 'leave',
      value: function leave(room) {
        _networkBridge2.default.removeMembershipFromRoom(this, room);
      }
    }, {
      key: 'dispatchEvent',
      value: function dispatchEvent(event) {
        var _this2 = this;

        for (var _len2 = arguments.length, customArguments = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          customArguments[_key2 - 1] = arguments[_key2];
        }

        var eventName = event.type;
        var listeners = this.listeners[eventName];

        if (!Array.isArray(listeners)) {
          return false;
        }

        listeners.forEach(function (listener) {
          if (customArguments.length > 0) {
            listener.apply(_this2, customArguments);
          } else {
            // Regular WebSockets expect a MessageEvent but Socketio.io just wants raw data
            //  payload instanceof MessageEvent works, but you can't isntance of NodeEvent
            //  for now we detect if the output has data defined on it
            listener.call(_this2, event.data ? event.data : event);
          }
        });
      }
    }, {
      key: 'broadcast',
      get: function get() {
        if (this.readyState !== SocketIO.OPEN) {
          throw new Error('SocketIO is already in CLOSING or CLOSED state');
        }

        var self = this;
        var server = _networkBridge2.default.serverLookup(this.url);
        if (!server) {
          throw new Error('SocketIO can not find a server at the specified URL (' + this.url + ')');
        }

        return {
          emit: function emit(event, data) {
            server.emit(event, data, { websockets: _networkBridge2.default.websocketsLookup(self.url, null, self) });
          },
          to: function to(room) {
            return server.to(room, self);
          },
          in: function _in(room) {
            return server.in(room, self);
          }
        };
      }
    }]);

    return SocketIO;
  }(_eventTarget2.default);

  SocketIO.CONNECTING = 0;
  SocketIO.OPEN = 1;
  SocketIO.CLOSING = 2;
  SocketIO.CLOSED = 3;

  /*
  * Static constructor methods for the IO Socket
  */
  var IO = function ioConstructor(url) {
    return new SocketIO(url);
  };

  /*
  * Alias the raw IO() constructor
  */
  IO.connect = function ioConnect(url) {
    /* eslint-disable new-cap */
    return IO(url);
    /* eslint-enable new-cap */
  };

  exports.default = IO;
});