(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './websocket', './event-target', './network-bridge', './helpers/close-codes', './helpers/normalize-url', './helpers/global-object', './event-factory'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./websocket'), require('./event-target'), require('./network-bridge'), require('./helpers/close-codes'), require('./helpers/normalize-url'), require('./helpers/global-object'), require('./event-factory'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.websocket, global.eventTarget, global.networkBridge, global.closeCodes, global.normalizeUrl, global.globalObject, global.eventFactory);
    global.server = mod.exports;
  }
})(this, function (exports, _websocket, _eventTarget, _networkBridge, _closeCodes, _normalizeUrl, _globalObject, _eventFactory) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _websocket2 = _interopRequireDefault(_websocket);

  var _eventTarget2 = _interopRequireDefault(_eventTarget);

  var _networkBridge2 = _interopRequireDefault(_networkBridge);

  var _closeCodes2 = _interopRequireDefault(_closeCodes);

  var _normalizeUrl2 = _interopRequireDefault(_normalizeUrl);

  var _globalObject2 = _interopRequireDefault(_globalObject);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    } else {
      return Array.from(arr);
    }
  }

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

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

  var Server = function (_EventTarget) {
    _inherits(Server, _EventTarget);

    /*
    * @param {string} url
    */
    function Server(url) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, Server);

      var _this = _possibleConstructorReturn(this, (Server.__proto__ || Object.getPrototypeOf(Server)).call(this));

      _this.url = (0, _normalizeUrl2.default)(url);
      _this.originalWebSocket = null;
      var server = _networkBridge2.default.attachServer(_this, _this.url);

      if (!server) {
        _this.dispatchEvent((0, _eventFactory.createEvent)({ type: 'error' }));
        throw new Error('A mock server is already listening on this url');
      }

      if (typeof options.verifiyClient === 'undefined') {
        options.verifiyClient = null;
      }

      _this.options = options;

      _this.start();
      return _this;
    }

    /*
    * Attaches the mock websocket object to the global object
    */


    _createClass(Server, [{
      key: 'start',
      value: function start() {
        var globalObj = (0, _globalObject2.default)();

        if (globalObj.WebSocket) {
          this.originalWebSocket = globalObj.WebSocket;
        }

        globalObj.WebSocket = _websocket2.default;
      }
    }, {
      key: 'stop',
      value: function stop() {
        var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

        var globalObj = (0, _globalObject2.default)();

        if (this.originalWebSocket) {
          globalObj.WebSocket = this.originalWebSocket;
        } else {
          delete globalObj.WebSocket;
        }

        this.originalWebSocket = null;

        _networkBridge2.default.removeServer(this.url);

        if (typeof callback === 'function') {
          callback();
        }
      }
    }, {
      key: 'on',
      value: function on(type, callback) {
        this.addEventListener(type, callback);
      }
    }, {
      key: 'send',
      value: function send(data) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        this.emit('message', data, options);
      }
    }, {
      key: 'emit',
      value: function emit(event, data) {
        var _this2 = this;

        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var websockets = options.websockets;


        if (!websockets) {
          websockets = _networkBridge2.default.websocketsLookup(this.url);
        }

        if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object' || arguments.length > 3) {
          data = Array.prototype.slice.call(arguments, 1, arguments.length);
        }

        websockets.forEach(function (socket) {
          if (Array.isArray(data)) {
            socket.dispatchEvent.apply(socket, [(0, _eventFactory.createMessageEvent)({
              type: event,
              data: data,
              origin: _this2.url,
              target: socket
            })].concat(_toConsumableArray(data)));
          } else {
            socket.dispatchEvent((0, _eventFactory.createMessageEvent)({
              type: event,
              data: data,
              origin: _this2.url,
              target: socket
            }));
          }
        });
      }
    }, {
      key: 'close',
      value: function close() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var code = options.code,
            reason = options.reason,
            wasClean = options.wasClean;

        var listeners = _networkBridge2.default.websocketsLookup(this.url);

        listeners.forEach(function (socket) {
          socket.readyState = _websocket2.default.CLOSE;
          socket.dispatchEvent((0, _eventFactory.createCloseEvent)({
            type: 'close',
            target: socket,
            code: code || _closeCodes2.default.CLOSE_NORMAL,
            reason: reason || '',
            wasClean: wasClean
          }));
        });

        this.dispatchEvent((0, _eventFactory.createCloseEvent)({ type: 'close' }), this);
        _networkBridge2.default.removeServer(this.url);
      }
    }, {
      key: 'clients',
      value: function clients() {
        return _networkBridge2.default.websocketsLookup(this.url);
      }
    }, {
      key: 'to',
      value: function to(room, broadcaster) {
        var self = this;
        var websockets = _networkBridge2.default.websocketsLookup(this.url, room, broadcaster);
        return {
          emit: function emit(event, data) {
            self.emit(event, data, { websockets: websockets });
          }
        };
      }
    }, {
      key: 'in',
      value: function _in() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return this.to.apply(null, args);
      }
    }]);

    return Server;
  }(_eventTarget2.default);

  /*
   * Alternative constructor to support namespaces in socket.io
   *
   * http://socket.io/docs/rooms-and-namespaces/#custom-namespaces
   */
  Server.of = function of(url) {
    return new Server(url);
  };

  exports.default = Server;
});