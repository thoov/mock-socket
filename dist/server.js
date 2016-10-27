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

  /*
  * https://github.com/websockets/ws#server-example
  */
  class Server extends _eventTarget2.default {
    /*
    * @param {string} url
    */
    constructor(url, options = {}) {
      super();
      this.url = (0, _normalizeUrl2.default)(url);
      this.originalWebSocket = null;
      const server = _networkBridge2.default.attachServer(this, this.url);

      if (!server) {
        this.dispatchEvent((0, _eventFactory.createEvent)({ type: 'error' }));
        throw new Error('A mock server is already listening on this url');
      }

      this.options = Object.assign({ verifiyClient: null }, options);

      this.start();
    }

    /*
    * Attaches the mock websocket object to the global object
    */
    start() {
      const globalObj = (0, _globalObject2.default)();

      if (globalObj.WebSocket) {
        this.originalWebSocket = globalObj.WebSocket;
      }

      globalObj.WebSocket = _websocket2.default;
    }

    /*
    * Removes the mock websocket object from the global object
    */
    stop() {
      const globalObj = (0, _globalObject2.default)();

      if (this.originalWebSocket) {
        globalObj.WebSocket = this.originalWebSocket;
      } else {
        delete globalObj.WebSocket;
      }

      this.originalWebSocket = null;

      _networkBridge2.default.removeServer(this.url);
    }

    /*
    * This is the main function for the mock server to subscribe to the on events.
    *
    * ie: mockServer.on('connection', function() { console.log('a mock client connected'); });
    *
    * @param {string} type - The event key to subscribe to. Valid keys are: connection, message, and close.
    * @param {function} callback - The callback which should be called when a certain event is fired.
    */
    on(type, callback) {
      this.addEventListener(type, callback);
    }

    /*
    * This send function will notify all mock clients via their onmessage callbacks that the server
    * has a message for them.
    *
    * @param {*} data - Any javascript object which will be crafted into a MessageObject.
    */
    send(data, options = {}) {
      this.emit('message', data, options);
    }

    /*
    * Sends a generic message event to all mock clients.
    */
    emit(event, data, options = {}) {
      let { websockets } = options;

      if (!websockets) {
        websockets = _networkBridge2.default.websocketsLookup(this.url);
      }

      if (typeof options !== 'object' || arguments.length > 3) {
        data = Array.prototype.slice.call(arguments, 1, arguments.length);
      }

      websockets.forEach(socket => {
        if (Array.isArray(data)) {
          socket.dispatchEvent((0, _eventFactory.createMessageEvent)({
            type: event,
            data,
            origin: this.url,
            target: socket
          }), ...data);
        } else {
          socket.dispatchEvent((0, _eventFactory.createMessageEvent)({
            type: event,
            data,
            origin: this.url,
            target: socket
          }));
        }
      });
    }

    /*
    * Closes the connection and triggers the onclose method of all listening
    * websockets. After that it removes itself from the urlMap so another server
    * could add itself to the url.
    *
    * @param {object} options
    */
    close(options = {}) {
      const {
        code,
        reason,
        wasClean
      } = options;
      const listeners = _networkBridge2.default.websocketsLookup(this.url);

      listeners.forEach(socket => {
        socket.readyState = _websocket2.default.CLOSE;
        socket.dispatchEvent((0, _eventFactory.createCloseEvent)({
          type: 'close',
          target: socket,
          code: code || _closeCodes2.default.CLOSE_NORMAL,
          reason: reason || '',
          wasClean
        }));
      });

      this.dispatchEvent((0, _eventFactory.createCloseEvent)({ type: 'close' }), this);
      _networkBridge2.default.removeServer(this.url);
    }

    /*
    * Returns an array of websockets which are listening to this server
    */
    clients() {
      return _networkBridge2.default.websocketsLookup(this.url);
    }

    /*
    * Prepares a method to submit an event to members of the room
    *
    * e.g. server.to('my-room').emit('hi!');
    */
    to(room, broadcaster) {
      const self = this;
      const websockets = _networkBridge2.default.websocketsLookup(this.url, room, broadcaster);
      return {
        emit(event, data) {
          self.emit(event, data, { websockets });
        }
      };
    }

    /*
     * Alias for Server.to
     */
    in(...args) {
      return this.to.apply(null, args);
    }
  }

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