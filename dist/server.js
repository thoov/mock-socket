'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x5, _x6, _x7) { var _again = true; _function: while (_again) { var object = _x5, property = _x6, receiver = _x7; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x5 = parent; _x6 = property; _x7 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _websocket = require('./websocket');

var _websocket2 = _interopRequireDefault(_websocket);

var _eventTarget = require('./event-target');

var _eventTarget2 = _interopRequireDefault(_eventTarget);

var _networkBridge = require('./network-bridge');

var _networkBridge2 = _interopRequireDefault(_networkBridge);

var _helpersCloseCodes = require('./helpers/close-codes');

var _helpersCloseCodes2 = _interopRequireDefault(_helpersCloseCodes);

var _helpersNormalizeUrl = require('./helpers/normalize-url');

var _helpersNormalizeUrl2 = _interopRequireDefault(_helpersNormalizeUrl);

var _helpersGlobalObject = require('./helpers/global-object');

var _helpersGlobalObject2 = _interopRequireDefault(_helpersGlobalObject);

var _eventFactory = require('./event-factory');

/*
* https://github.com/websockets/ws#server-example
*/

var Server = (function (_EventTarget) {
  _inherits(Server, _EventTarget);

  /*
  * @param {string} url
  */

  function Server(url) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Server);

    _get(Object.getPrototypeOf(Server.prototype), 'constructor', this).call(this);
    this.url = (0, _helpersNormalizeUrl2['default'])(url);
    this._originalWebSocket = null;
    var server = _networkBridge2['default'].attachServer(this, this.url);

    if (!server) {
      this.dispatchEvent((0, _eventFactory.createEvent)({ type: 'error' }));
      throw new Error('A mock server is already listening on this url');
    }

    this.options = Object.assign({
      verifiyClient: null
    }, options);

    this.start();
  }

  /*
   * Alternative constructor to support namespaces in socket.io
   *
   * http://socket.io/docs/rooms-and-namespaces/#custom-namespaces
   */

  /*
  * Attaches the mock websocket object to the global object
  */

  _createClass(Server, [{
    key: 'start',
    value: function start() {
      var globalObj = (0, _helpersGlobalObject2['default'])();

      if (globalObj.WebSocket) {
        this._originalWebSocket = globalObj.WebSocket;
      }

      globalObj.WebSocket = _websocket2['default'];
    }

    /*
    * Removes the mock websocket object from the global object
    */
  }, {
    key: 'stop',
    value: function stop() {
      var globalObj = (0, _helpersGlobalObject2['default'])();

      if (this._originalWebSocket) {
        globalObj.WebSocket = this._originalWebSocket;
      } else {
        delete globalObj.WebSocket;
      }

      this._originalWebSocket = null;

      _networkBridge2['default'].removeServer(this.url);
    }

    /*
    * This is the main function for the mock server to subscribe to the on events.
    *
    * ie: mockServer.on('connection', function() { console.log('a mock client connected'); });
    *
    * @param {string} type - The event key to subscribe to. Valid keys are: connection, message, and close.
    * @param {function} callback - The callback which should be called when a certain event is fired.
    */
  }, {
    key: 'on',
    value: function on(type, callback) {
      this.addEventListener(type, callback);
    }

    /*
    * This send function will notify all mock clients via their onmessage callbacks that the server
    * has a message for them.
    *
    * @param {*} data - Any javascript object which will be crafted into a MessageObject.
    */
  }, {
    key: 'send',
    value: function send(data) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      this.emit('message', data, options);
    }

    /*
    * Sends a generic message event to all mock clients.
    */
  }, {
    key: 'emit',
    value: function emit(event, data) {
      var _this2 = this;

      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
      var websockets = options.websockets;

      if (!websockets) {
        websockets = _networkBridge2['default'].websocketsLookup(this.url);
      }

      if (typeof options !== 'object' || arguments.length > 3) {
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

    /*
    * Closes the connection and triggers the onclose method of all listening
    * websockets. After that it removes itself from the urlMap so another server
    * could add itself to the url.
    *
    * @param {object} options
    */
  }, {
    key: 'close',
    value: function close() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var code = options.code;
      var reason = options.reason;
      var wasClean = options.wasClean;

      var listeners = _networkBridge2['default'].websocketsLookup(this.url);

      listeners.forEach(function (socket) {
        socket.readyState = _websocket2['default'].CLOSE;
        socket.dispatchEvent((0, _eventFactory.createCloseEvent)({
          type: 'close',
          target: socket,
          code: code || _helpersCloseCodes2['default'].CLOSE_NORMAL,
          reason: reason || '',
          wasClean: wasClean
        }));
      });

      this.dispatchEvent((0, _eventFactory.createCloseEvent)({ type: 'close' }), this);
      _networkBridge2['default'].removeServer(this.url);
    }

    /*
    * Returns an array of websockets which are listening to this server
    */
  }, {
    key: 'clients',
    value: function clients() {
      return _networkBridge2['default'].websocketsLookup(this.url);
    }

    /*
    * Prepares a method to submit an event to members of the room
    *
    * e.g. server.to('my-room').emit('hi!');
    */
  }, {
    key: 'to',
    value: function to(room, broadcaster) {
      var _this = this;
      var websockets = _networkBridge2['default'].websocketsLookup(this.url, room, broadcaster);
      return {
        emit: function emit(event, data) {
          _this.emit(event, data, { websockets: websockets });
        }
      };
    }

    /*
     * Alias for Server.to
     */
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
})(_eventTarget2['default']);

Server.of = function of(url) {
  return new Server(url);
};

exports['default'] = Server;
module.exports = exports['default'];