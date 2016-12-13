(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Mock"] = factory();
	else
		root["Mock"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.SocketIO = exports.WebSocket = exports.Server = undefined;
	
	var _server = __webpack_require__(1);
	
	var _server2 = _interopRequireDefault(_server);
	
	var _socketIo = __webpack_require__(17);
	
	var _socketIo2 = _interopRequireDefault(_socketIo);
	
	var _websocket = __webpack_require__(2);
	
	var _websocket2 = _interopRequireDefault(_websocket);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var Server = exports.Server = _server2.default;
	var WebSocket = exports.WebSocket = _websocket2.default;
	var SocketIO = exports.SocketIO = _socketIo2.default;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _websocket = __webpack_require__(2);
	
	var _websocket2 = _interopRequireDefault(_websocket);
	
	var _eventTarget = __webpack_require__(4);
	
	var _eventTarget2 = _interopRequireDefault(_eventTarget);
	
	var _networkBridge = __webpack_require__(6);
	
	var _networkBridge2 = _interopRequireDefault(_networkBridge);
	
	var _closeCodes = __webpack_require__(7);
	
	var _closeCodes2 = _interopRequireDefault(_closeCodes);
	
	var _normalizeUrl = __webpack_require__(8);
	
	var _normalizeUrl2 = _interopRequireDefault(_normalizeUrl);
	
	var _globalObject = __webpack_require__(16);
	
	var _globalObject2 = _interopRequireDefault(_globalObject);
	
	var _eventFactory = __webpack_require__(11);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	/*
	* https://github.com/websockets/ws#server-example
	*/
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
	
	    /*
	    * Removes the mock websocket object from the global object
	    */
	
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
	      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	
	      this.emit('message', data, options);
	    }
	
	    /*
	    * Sends a generic message event to all mock clients.
	    */
	
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
	
	    /*
	    * Returns an array of websockets which are listening to this server
	    */
	
	  }, {
	    key: 'clients',
	    value: function clients() {
	      return _networkBridge2.default.websocketsLookup(this.url);
	    }
	
	    /*
	    * Prepares a method to submit an event to members of the room
	    *
	    * e.g. server.to('my-room').emit('hi!');
	    */
	
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

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _delay = __webpack_require__(3);
	
	var _delay2 = _interopRequireDefault(_delay);
	
	var _eventTarget = __webpack_require__(4);
	
	var _eventTarget2 = _interopRequireDefault(_eventTarget);
	
	var _networkBridge = __webpack_require__(6);
	
	var _networkBridge2 = _interopRequireDefault(_networkBridge);
	
	var _closeCodes = __webpack_require__(7);
	
	var _closeCodes2 = _interopRequireDefault(_closeCodes);
	
	var _normalizeUrl = __webpack_require__(8);
	
	var _normalizeUrl2 = _interopRequireDefault(_normalizeUrl);
	
	var _logger = __webpack_require__(9);
	
	var _logger2 = _interopRequireDefault(_logger);
	
	var _eventFactory = __webpack_require__(11);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	/*
	* The main websocket class which is designed to mimick the native WebSocket class as close
	* as possible.
	*
	* https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
	*/
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

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = delay;
	/*
	* This delay allows the thread to finish assigning its on* methods
	* before invoking the delay callback. This is purely a timing hack.
	* http://geekabyte.blogspot.com/2014/01/javascript-effect-of-setting-settimeout.html
	*
	* @param {callback: function} the callback which will be invoked after the timeout
	* @parma {context: object} the context in which to invoke the function
	*/
	function delay(callback, context) {
	  setTimeout(function (timeoutContext) {
	    return callback.call(timeoutContext);
	  }, 4, context);
	}

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _arrayHelpers = __webpack_require__(5);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/*
	* EventTarget is an interface implemented by objects that can
	* receive events and may have listeners for them.
	*
	* https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
	*/
	var EventTarget = function () {
	  function EventTarget() {
	    _classCallCheck(this, EventTarget);
	
	    this.listeners = {};
	  }
	
	  /*
	  * Ties a listener function to a event type which can later be invoked via the
	  * dispatchEvent method.
	  *
	  * @param {string} type - the type of event (ie: 'open', 'message', etc.)
	  * @param {function} listener - the callback function to invoke whenever a event is dispatched matching the given type
	  * @param {boolean} useCapture - N/A TODO: implement useCapture functionality
	  */
	
	
	  _createClass(EventTarget, [{
	    key: 'addEventListener',
	    value: function addEventListener(type, listener /* , useCapture */) {
	      if (typeof listener === 'function') {
	        if (!Array.isArray(this.listeners[type])) {
	          this.listeners[type] = [];
	        }
	
	        // Only add the same function once
	        if ((0, _arrayHelpers.filter)(this.listeners[type], function (item) {
	          return item === listener;
	        }).length === 0) {
	          this.listeners[type].push(listener);
	        }
	      }
	    }
	
	    /*
	    * Removes the listener so it will no longer be invoked via the dispatchEvent method.
	    *
	    * @param {string} type - the type of event (ie: 'open', 'message', etc.)
	    * @param {function} listener - the callback function to invoke whenever a event is dispatched matching the given type
	    * @param {boolean} useCapture - N/A TODO: implement useCapture functionality
	    */
	
	  }, {
	    key: 'removeEventListener',
	    value: function removeEventListener(type, removingListener /* , useCapture */) {
	      var arrayOfListeners = this.listeners[type];
	      this.listeners[type] = (0, _arrayHelpers.reject)(arrayOfListeners, function (listener) {
	        return listener === removingListener;
	      });
	    }
	
	    /*
	    * Invokes all listener functions that are listening to the given event.type property. Each
	    * listener will be passed the event as the first argument.
	    *
	    * @param {object} event - event object which will be passed to all listeners of the event.type property
	    */
	
	  }, {
	    key: 'dispatchEvent',
	    value: function dispatchEvent(event) {
	      var _this = this;
	
	      for (var _len = arguments.length, customArguments = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        customArguments[_key - 1] = arguments[_key];
	      }
	
	      var eventName = event.type;
	      var listeners = this.listeners[eventName];
	
	      if (!Array.isArray(listeners)) {
	        return false;
	      }
	
	      listeners.forEach(function (listener) {
	        if (customArguments.length > 0) {
	          listener.apply(_this, customArguments);
	        } else {
	          listener.call(_this, event);
	        }
	      });
	
	      return true;
	    }
	  }]);
	
	  return EventTarget;
	}();
	
	exports.default = EventTarget;

/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.reject = reject;
	exports.filter = filter;
	function reject(array, callback) {
	  var results = [];
	  array.forEach(function (itemInArray) {
	    if (!callback(itemInArray)) {
	      results.push(itemInArray);
	    }
	  });
	
	  return results;
	}
	
	function filter(array, callback) {
	  var results = [];
	  array.forEach(function (itemInArray) {
	    if (callback(itemInArray)) {
	      results.push(itemInArray);
	    }
	  });
	
	  return results;
	}

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _arrayHelpers = __webpack_require__(5);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/*
	* The network bridge is a way for the mock websocket object to 'communicate' with
	* all available servers. This is a singleton object so it is important that you
	* clean up urlMap whenever you are finished.
	*/
	var NetworkBridge = function () {
	  function NetworkBridge() {
	    _classCallCheck(this, NetworkBridge);
	
	    this.urlMap = {};
	  }
	
	  /*
	  * Attaches a websocket object to the urlMap hash so that it can find the server
	  * it is connected to and the server in turn can find it.
	  *
	  * @param {object} websocket - websocket object to add to the urlMap hash
	  * @param {string} url
	  */
	
	
	  _createClass(NetworkBridge, [{
	    key: 'attachWebSocket',
	    value: function attachWebSocket(websocket, url) {
	      var connectionLookup = this.urlMap[url];
	
	      if (connectionLookup && connectionLookup.server && connectionLookup.websockets.indexOf(websocket) === -1) {
	        connectionLookup.websockets.push(websocket);
	        return connectionLookup.server;
	      }
	    }
	
	    /*
	    * Attaches a websocket to a room
	    */
	
	  }, {
	    key: 'addMembershipToRoom',
	    value: function addMembershipToRoom(websocket, room) {
	      var connectionLookup = this.urlMap[websocket.url];
	
	      if (connectionLookup && connectionLookup.server && connectionLookup.websockets.indexOf(websocket) !== -1) {
	        if (!connectionLookup.roomMemberships[room]) {
	          connectionLookup.roomMemberships[room] = [];
	        }
	
	        connectionLookup.roomMemberships[room].push(websocket);
	      }
	    }
	
	    /*
	    * Attaches a server object to the urlMap hash so that it can find a websockets
	    * which are connected to it and so that websockets can in turn can find it.
	    *
	    * @param {object} server - server object to add to the urlMap hash
	    * @param {string} url
	    */
	
	  }, {
	    key: 'attachServer',
	    value: function attachServer(server, url) {
	      var connectionLookup = this.urlMap[url];
	
	      if (!connectionLookup) {
	        this.urlMap[url] = {
	          server: server,
	          websockets: [],
	          roomMemberships: {}
	        };
	
	        return server;
	      }
	    }
	
	    /*
	    * Finds the server which is 'running' on the given url.
	    *
	    * @param {string} url - the url to use to find which server is running on it
	    */
	
	  }, {
	    key: 'serverLookup',
	    value: function serverLookup(url) {
	      var connectionLookup = this.urlMap[url];
	
	      if (connectionLookup) {
	        return connectionLookup.server;
	      }
	    }
	
	    /*
	    * Finds all websockets which is 'listening' on the given url.
	    *
	    * @param {string} url - the url to use to find all websockets which are associated with it
	    * @param {string} room - if a room is provided, will only return sockets in this room
	    * @param {class} broadcaster - socket that is broadcasting and is to be excluded from the lookup
	    */
	
	  }, {
	    key: 'websocketsLookup',
	    value: function websocketsLookup(url, room, broadcaster) {
	      var websockets = void 0;
	      var connectionLookup = this.urlMap[url];
	
	      websockets = connectionLookup ? connectionLookup.websockets : [];
	
	      if (room) {
	        var members = connectionLookup.roomMemberships[room];
	        websockets = members || [];
	      }
	
	      return broadcaster ? websockets.filter(function (websocket) {
	        return websocket !== broadcaster;
	      }) : websockets;
	    }
	
	    /*
	    * Removes the entry associated with the url.
	    *
	    * @param {string} url
	    */
	
	  }, {
	    key: 'removeServer',
	    value: function removeServer(url) {
	      delete this.urlMap[url];
	    }
	
	    /*
	    * Removes the individual websocket from the map of associated websockets.
	    *
	    * @param {object} websocket - websocket object to remove from the url map
	    * @param {string} url
	    */
	
	  }, {
	    key: 'removeWebSocket',
	    value: function removeWebSocket(websocket, url) {
	      var connectionLookup = this.urlMap[url];
	
	      if (connectionLookup) {
	        connectionLookup.websockets = (0, _arrayHelpers.reject)(connectionLookup.websockets, function (socket) {
	          return socket === websocket;
	        });
	      }
	    }
	
	    /*
	    * Removes a websocket from a room
	    */
	
	  }, {
	    key: 'removeMembershipFromRoom',
	    value: function removeMembershipFromRoom(websocket, room) {
	      var connectionLookup = this.urlMap[websocket.url];
	      var memberships = connectionLookup.roomMemberships[room];
	
	      if (connectionLookup && memberships !== null) {
	        connectionLookup.roomMemberships[room] = (0, _arrayHelpers.reject)(memberships, function (socket) {
	          return socket === websocket;
	        });
	      }
	    }
	  }]);
	
	  return NetworkBridge;
	}();
	
	exports.default = new NetworkBridge(); // Note: this is a singleton

/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/*
	* https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
	*/
	var codes = {
	  CLOSE_NORMAL: 1000,
	  CLOSE_GOING_AWAY: 1001,
	  CLOSE_PROTOCOL_ERROR: 1002,
	  CLOSE_UNSUPPORTED: 1003,
	  CLOSE_NO_STATUS: 1005,
	  CLOSE_ABNORMAL: 1006,
	  CLOSE_TOO_LARGE: 1009
	};
	
	exports.default = codes;

/***/ },
/* 8 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = normalizeUrl;
	function normalizeUrl(url) {
	  var parts = url.split('://');
	  return parts[1] && parts[1].indexOf('/') === -1 ? url + '/' : url;
	}

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = log;
	function log(method, message) {
	  /* eslint-disable no-console */
	  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
	    console[method].call(null, message);
	  }
	  /* eslint-enable no-console */
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10)))

/***/ },
/* 10 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	
	
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	
	
	
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.createCloseEvent = exports.createMessageEvent = exports.createEvent = undefined;
	
	var _event = __webpack_require__(12);
	
	var _event2 = _interopRequireDefault(_event);
	
	var _messageEvent = __webpack_require__(14);
	
	var _messageEvent2 = _interopRequireDefault(_messageEvent);
	
	var _closeEvent = __webpack_require__(15);
	
	var _closeEvent2 = _interopRequireDefault(_closeEvent);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/*
	* Creates an Event object and extends it to allow full modification of
	* its properties.
	*
	* @param {object} config - within config you will need to pass type and optionally target
	*/
	function createEvent(config) {
	  var type = config.type,
	      target = config.target;
	
	  var eventObject = new _event2.default(type);
	
	  if (target) {
	    eventObject.target = target;
	    eventObject.srcElement = target;
	    eventObject.currentTarget = target;
	  }
	
	  return eventObject;
	}
	
	/*
	* Creates a MessageEvent object and extends it to allow full modification of
	* its properties.
	*
	* @param {object} config - within config: type, origin, data and optionally target
	*/
	function createMessageEvent(config) {
	  var type = config.type,
	      origin = config.origin,
	      data = config.data,
	      target = config.target;
	
	  var messageEvent = new _messageEvent2.default(type, {
	    data: data,
	    origin: origin
	  });
	
	  if (target) {
	    messageEvent.target = target;
	    messageEvent.srcElement = target;
	    messageEvent.currentTarget = target;
	  }
	
	  return messageEvent;
	}
	
	/*
	* Creates a CloseEvent object and extends it to allow full modification of
	* its properties.
	*
	* @param {object} config - within config: type and optionally target, code, and reason
	*/
	function createCloseEvent(config) {
	  var code = config.code,
	      reason = config.reason,
	      type = config.type,
	      target = config.target;
	  var wasClean = config.wasClean;
	
	
	  if (!wasClean) {
	    wasClean = code === 1000;
	  }
	
	  var closeEvent = new _closeEvent2.default(type, {
	    code: code,
	    reason: reason,
	    wasClean: wasClean
	  });
	
	  if (target) {
	    closeEvent.target = target;
	    closeEvent.srcElement = target;
	    closeEvent.currentTarget = target;
	  }
	
	  return closeEvent;
	}
	
	exports.createEvent = createEvent;
	exports.createMessageEvent = createMessageEvent;
	exports.createCloseEvent = createCloseEvent;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var _eventPrototype = __webpack_require__(13);
	
	var _eventPrototype2 = _interopRequireDefault(_eventPrototype);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Event = function (_EventPrototype) {
	  _inherits(Event, _EventPrototype);
	
	  function Event(type) {
	    var eventInitConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	
	    _classCallCheck(this, Event);
	
	    var _this = _possibleConstructorReturn(this, (Event.__proto__ || Object.getPrototypeOf(Event)).call(this));
	
	    if (!type) {
	      throw new TypeError('Failed to construct \'Event\': 1 argument required, but only 0 present.');
	    }
	
	    if ((typeof eventInitConfig === 'undefined' ? 'undefined' : _typeof(eventInitConfig)) !== 'object') {
	      throw new TypeError('Failed to construct \'Event\': parameter 2 (\'eventInitDict\') is not an object');
	    }
	
	    var bubbles = eventInitConfig.bubbles,
	        cancelable = eventInitConfig.cancelable;
	
	
	    _this.type = String(type);
	    _this.timeStamp = Date.now();
	    _this.target = null;
	    _this.srcElement = null;
	    _this.returnValue = true;
	    _this.isTrusted = false;
	    _this.eventPhase = 0;
	    _this.defaultPrevented = false;
	    _this.currentTarget = null;
	    _this.cancelable = cancelable ? Boolean(cancelable) : false;
	    _this.canncelBubble = false;
	    _this.bubbles = bubbles ? Boolean(bubbles) : false;
	    return _this;
	  }
	
	  return Event;
	}(_eventPrototype2.default);
	
	exports.default = Event;

/***/ },
/* 13 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var EventPrototype = function () {
	  function EventPrototype() {
	    _classCallCheck(this, EventPrototype);
	  }
	
	  _createClass(EventPrototype, [{
	    key: 'stopPropagation',
	
	    // Noops
	    value: function stopPropagation() {}
	  }, {
	    key: 'stopImmediatePropagation',
	    value: function stopImmediatePropagation() {}
	
	    // if no arguments are passed then the type is set to "undefined" on
	    // chrome and safari.
	
	  }, {
	    key: 'initEvent',
	    value: function initEvent() {
	      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'undefined';
	      var bubbles = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
	      var cancelable = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
	
	      this.type = String(type);
	      this.bubbles = Boolean(bubbles);
	      this.cancelable = Boolean(cancelable);
	    }
	  }]);
	
	  return EventPrototype;
	}();
	
	exports.default = EventPrototype;

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var _eventPrototype = __webpack_require__(13);
	
	var _eventPrototype2 = _interopRequireDefault(_eventPrototype);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var MessageEvent = function (_EventPrototype) {
	  _inherits(MessageEvent, _EventPrototype);
	
	  function MessageEvent(type) {
	    var eventInitConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	
	    _classCallCheck(this, MessageEvent);
	
	    var _this = _possibleConstructorReturn(this, (MessageEvent.__proto__ || Object.getPrototypeOf(MessageEvent)).call(this));
	
	    if (!type) {
	      throw new TypeError('Failed to construct \'MessageEvent\': 1 argument required, but only 0 present.');
	    }
	
	    if ((typeof eventInitConfig === 'undefined' ? 'undefined' : _typeof(eventInitConfig)) !== 'object') {
	      throw new TypeError('Failed to construct \'MessageEvent\': parameter 2 (\'eventInitDict\') is not an object');
	    }
	
	    var bubbles = eventInitConfig.bubbles,
	        cancelable = eventInitConfig.cancelable,
	        data = eventInitConfig.data,
	        origin = eventInitConfig.origin,
	        lastEventId = eventInitConfig.lastEventId,
	        ports = eventInitConfig.ports;
	
	
	    _this.type = String(type);
	    _this.timeStamp = Date.now();
	    _this.target = null;
	    _this.srcElement = null;
	    _this.returnValue = true;
	    _this.isTrusted = false;
	    _this.eventPhase = 0;
	    _this.defaultPrevented = false;
	    _this.currentTarget = null;
	    _this.cancelable = cancelable ? Boolean(cancelable) : false;
	    _this.canncelBubble = false;
	    _this.bubbles = bubbles ? Boolean(bubbles) : false;
	    _this.origin = origin ? String(origin) : '';
	    _this.ports = typeof ports === 'undefined' ? null : ports;
	    _this.data = typeof data === 'undefined' ? null : data;
	    _this.lastEventId = lastEventId ? String(lastEventId) : '';
	    return _this;
	  }
	
	  return MessageEvent;
	}(_eventPrototype2.default);
	
	exports.default = MessageEvent;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var _eventPrototype = __webpack_require__(13);
	
	var _eventPrototype2 = _interopRequireDefault(_eventPrototype);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var CloseEvent = function (_EventPrototype) {
	  _inherits(CloseEvent, _EventPrototype);
	
	  function CloseEvent(type) {
	    var eventInitConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	
	    _classCallCheck(this, CloseEvent);
	
	    var _this = _possibleConstructorReturn(this, (CloseEvent.__proto__ || Object.getPrototypeOf(CloseEvent)).call(this));
	
	    if (!type) {
	      throw new TypeError('Failed to construct \'CloseEvent\': 1 argument required, but only 0 present.');
	    }
	
	    if ((typeof eventInitConfig === 'undefined' ? 'undefined' : _typeof(eventInitConfig)) !== 'object') {
	      throw new TypeError('Failed to construct \'CloseEvent\': parameter 2 (\'eventInitDict\') is not an object');
	    }
	
	    var bubbles = eventInitConfig.bubbles,
	        cancelable = eventInitConfig.cancelable,
	        code = eventInitConfig.code,
	        reason = eventInitConfig.reason,
	        wasClean = eventInitConfig.wasClean;
	
	
	    _this.type = String(type);
	    _this.timeStamp = Date.now();
	    _this.target = null;
	    _this.srcElement = null;
	    _this.returnValue = true;
	    _this.isTrusted = false;
	    _this.eventPhase = 0;
	    _this.defaultPrevented = false;
	    _this.currentTarget = null;
	    _this.cancelable = cancelable ? Boolean(cancelable) : false;
	    _this.canncelBubble = false;
	    _this.bubbles = bubbles ? Boolean(bubbles) : false;
	    _this.code = typeof code === 'number' ? Number(code) : 0;
	    _this.reason = reason ? String(reason) : '';
	    _this.wasClean = wasClean ? Boolean(wasClean) : false;
	    return _this;
	  }
	
	  return CloseEvent;
	}(_eventPrototype2.default);
	
	exports.default = CloseEvent;

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, global) {'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	exports.default = retrieveGlobalObject;
	function retrieveGlobalObject() {
	  if (typeof window !== 'undefined') {
	    return window;
	  }
	
	  return (typeof process === 'undefined' ? 'undefined' : _typeof(process)) === 'object' && "function" === 'function' && (typeof global === 'undefined' ? 'undefined' : _typeof(global)) === 'object' ? global : this;
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10), (function() { return this; }())))

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _delay = __webpack_require__(3);
	
	var _delay2 = _interopRequireDefault(_delay);
	
	var _eventTarget = __webpack_require__(4);
	
	var _eventTarget2 = _interopRequireDefault(_eventTarget);
	
	var _networkBridge = __webpack_require__(6);
	
	var _networkBridge2 = _interopRequireDefault(_networkBridge);
	
	var _closeCodes = __webpack_require__(7);
	
	var _closeCodes2 = _interopRequireDefault(_closeCodes);
	
	var _normalizeUrl = __webpack_require__(8);
	
	var _normalizeUrl2 = _interopRequireDefault(_normalizeUrl);
	
	var _logger = __webpack_require__(9);
	
	var _logger2 = _interopRequireDefault(_logger);
	
	var _eventFactory = __webpack_require__(11);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	/*
	* The socket-io class is designed to mimick the real API as closely as possible.
	*
	* http://socket.io/docs/
	*/
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
	
	    /*
	    * Alias for Socket#close
	    *
	    * https://github.com/socketio/socket.io-client/blob/master/lib/socket.js#L383
	    */
	
	  }, {
	    key: 'disconnect',
	    value: function disconnect() {
	      this.close();
	    }
	
	    /*
	    * Submits an event to the server with a payload
	    */
	
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
	
	    /*
	    * Submits a 'message' event to the server.
	    *
	    * Should behave exactly like WebSocket#send
	    *
	    * https://github.com/socketio/socket.io-client/blob/master/lib/socket.js#L113
	    */
	
	  }, {
	    key: 'send',
	    value: function send(data) {
	      this.emit('message', data);
	    }
	
	    /*
	    * For broadcasting events to other connected sockets.
	    *
	    * e.g. socket.broadcast.emit('hi!');
	    * e.g. socket.broadcast.to('my-room').emit('hi!');
	    */
	
	  }, {
	    key: 'on',
	
	
	    /*
	    * For registering events to be received from the server
	    */
	    value: function on(type, callback) {
	      this.addEventListener(type, callback);
	    }
	
	    /*
	     * Join a room on a server
	     *
	     * http://socket.io/docs/rooms-and-namespaces/#joining-and-leaving
	     */
	
	  }, {
	    key: 'join',
	    value: function join(room) {
	      _networkBridge2.default.addMembershipToRoom(this, room);
	    }
	
	    /*
	     * Get the websocket to leave the room
	     *
	     * http://socket.io/docs/rooms-and-namespaces/#joining-and-leaving
	     */
	
	  }, {
	    key: 'leave',
	    value: function leave(room) {
	      _networkBridge2.default.removeMembershipFromRoom(this, room);
	    }
	
	    /*
	     * Invokes all listener functions that are listening to the given event.type property. Each
	     * listener will be passed the event as the first argument.
	     *
	     * @param {object} event - event object which will be passed to all listeners of the event.type property
	     */
	
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

/***/ }
/******/ ])
});
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCAzMGZjYjIwMTg4MjQ3MmM5NGZjZSIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NlcnZlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvd2Vic29ja2V0LmpzIiwid2VicGFjazovLy8uL3NyYy9oZWxwZXJzL2RlbGF5LmpzIiwid2VicGFjazovLy8uL3NyYy9ldmVudC10YXJnZXQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2hlbHBlcnMvYXJyYXktaGVscGVycy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbmV0d29yay1icmlkZ2UuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2hlbHBlcnMvY2xvc2UtY29kZXMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2hlbHBlcnMvbm9ybWFsaXplLXVybC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaGVscGVycy9sb2dnZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9wcm9jZXNzL2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V2ZW50LWZhY3RvcnkuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2hlbHBlcnMvZXZlbnQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2hlbHBlcnMvZXZlbnQtcHJvdG90eXBlLmpzIiwid2VicGFjazovLy8uL3NyYy9oZWxwZXJzL21lc3NhZ2UtZXZlbnQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2hlbHBlcnMvY2xvc2UtZXZlbnQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2hlbHBlcnMvZ2xvYmFsLW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvc29ja2V0LWlvLmpzIl0sIm5hbWVzIjpbIlNlcnZlciIsIldlYlNvY2tldCIsIlNvY2tldElPIiwidXJsIiwib3B0aW9ucyIsIm9yaWdpbmFsV2ViU29ja2V0Iiwic2VydmVyIiwiYXR0YWNoU2VydmVyIiwiZGlzcGF0Y2hFdmVudCIsInR5cGUiLCJFcnJvciIsInZlcmlmaXlDbGllbnQiLCJzdGFydCIsImdsb2JhbE9iaiIsImNhbGxiYWNrIiwicmVtb3ZlU2VydmVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsImRhdGEiLCJlbWl0IiwiZXZlbnQiLCJ3ZWJzb2NrZXRzIiwid2Vic29ja2V0c0xvb2t1cCIsImFyZ3VtZW50cyIsImxlbmd0aCIsIkFycmF5IiwicHJvdG90eXBlIiwic2xpY2UiLCJjYWxsIiwiZm9yRWFjaCIsInNvY2tldCIsImlzQXJyYXkiLCJvcmlnaW4iLCJ0YXJnZXQiLCJjb2RlIiwicmVhc29uIiwid2FzQ2xlYW4iLCJsaXN0ZW5lcnMiLCJyZWFkeVN0YXRlIiwiQ0xPU0UiLCJDTE9TRV9OT1JNQUwiLCJyb29tIiwiYnJvYWRjYXN0ZXIiLCJzZWxmIiwiYXJncyIsInRvIiwiYXBwbHkiLCJvZiIsInByb3RvY29sIiwiVHlwZUVycm9yIiwiYmluYXJ5VHlwZSIsIkNPTk5FQ1RJTkciLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0aWVzIiwib25vcGVuIiwiY29uZmlndXJhYmxlIiwiZW51bWVyYWJsZSIsImdldCIsIm9wZW4iLCJzZXQiLCJsaXN0ZW5lciIsIm9ubWVzc2FnZSIsIm1lc3NhZ2UiLCJvbmNsb3NlIiwiY2xvc2UiLCJvbmVycm9yIiwiZXJyb3IiLCJhdHRhY2hXZWJTb2NrZXQiLCJkZWxheUNhbGxiYWNrIiwidmVyaWZ5Q2xpZW50IiwiQ0xPU0VEIiwicmVtb3ZlV2ViU29ja2V0IiwiT1BFTiIsIkNMT1NJTkciLCJtZXNzYWdlRXZlbnQiLCJzZXJ2ZXJMb29rdXAiLCJ1bmRlZmluZWQiLCJjbG9zZUV2ZW50IiwiZGVsYXkiLCJjb250ZXh0Iiwic2V0VGltZW91dCIsInRpbWVvdXRDb250ZXh0IiwiRXZlbnRUYXJnZXQiLCJpdGVtIiwicHVzaCIsInJlbW92aW5nTGlzdGVuZXIiLCJhcnJheU9mTGlzdGVuZXJzIiwiY3VzdG9tQXJndW1lbnRzIiwiZXZlbnROYW1lIiwicmVqZWN0IiwiZmlsdGVyIiwiYXJyYXkiLCJyZXN1bHRzIiwiaXRlbUluQXJyYXkiLCJOZXR3b3JrQnJpZGdlIiwidXJsTWFwIiwid2Vic29ja2V0IiwiY29ubmVjdGlvbkxvb2t1cCIsImluZGV4T2YiLCJyb29tTWVtYmVyc2hpcHMiLCJtZW1iZXJzIiwibWVtYmVyc2hpcHMiLCJjb2RlcyIsIkNMT1NFX0dPSU5HX0FXQVkiLCJDTE9TRV9QUk9UT0NPTF9FUlJPUiIsIkNMT1NFX1VOU1VQUE9SVEVEIiwiQ0xPU0VfTk9fU1RBVFVTIiwiQ0xPU0VfQUJOT1JNQUwiLCJDTE9TRV9UT09fTEFSR0UiLCJub3JtYWxpemVVcmwiLCJwYXJ0cyIsInNwbGl0IiwibG9nIiwibWV0aG9kIiwicHJvY2VzcyIsImVudiIsIk5PREVfRU5WIiwiY29uc29sZSIsImNyZWF0ZUV2ZW50IiwiY29uZmlnIiwiZXZlbnRPYmplY3QiLCJzcmNFbGVtZW50IiwiY3VycmVudFRhcmdldCIsImNyZWF0ZU1lc3NhZ2VFdmVudCIsImNyZWF0ZUNsb3NlRXZlbnQiLCJFdmVudCIsImV2ZW50SW5pdENvbmZpZyIsImJ1YmJsZXMiLCJjYW5jZWxhYmxlIiwiU3RyaW5nIiwidGltZVN0YW1wIiwiRGF0ZSIsIm5vdyIsInJldHVyblZhbHVlIiwiaXNUcnVzdGVkIiwiZXZlbnRQaGFzZSIsImRlZmF1bHRQcmV2ZW50ZWQiLCJCb29sZWFuIiwiY2FubmNlbEJ1YmJsZSIsIkV2ZW50UHJvdG90eXBlIiwiTWVzc2FnZUV2ZW50IiwibGFzdEV2ZW50SWQiLCJwb3J0cyIsIkNsb3NlRXZlbnQiLCJOdW1iZXIiLCJyZXRyaWV2ZUdsb2JhbE9iamVjdCIsIndpbmRvdyIsImdsb2JhbCIsImFkZE1lbWJlcnNoaXBUb1Jvb20iLCJyZW1vdmVNZW1iZXJzaGlwRnJvbVJvb20iLCJpbiIsIklPIiwiaW9Db25zdHJ1Y3RvciIsImNvbm5lY3QiLCJpb0Nvbm5lY3QiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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LFFBQUosQ0FBYUMsR0FBYixDQUFQO0FBQ0QsRUFGRDs7QUFJQTs7O0FBR0FtSixJQUFHRSxPQUFILEdBQWEsU0FBU0MsU0FBVCxDQUFtQnRKLEdBQW5CLEVBQXdCO0FBQ25DO0FBQ0EsVUFBT21KLEdBQUduSixHQUFILENBQVA7QUFDQTtBQUNELEVBSkQ7O21CQU1lbUosRSIsImZpbGUiOiJkaXN0L21vY2stc29ja2V0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wiTW9ja1wiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJNb2NrXCJdID0gZmFjdG9yeSgpO1xufSkodGhpcywgZnVuY3Rpb24oKSB7XG5yZXR1cm4gXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbiIsIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRleHBvcnRzOiB7fSxcbiBcdFx0XHRpZDogbW9kdWxlSWQsXG4gXHRcdFx0bG9hZGVkOiBmYWxzZVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDMwZmNiMjAxODgyNDcyYzk0ZmNlIiwiaW1wb3J0IE1vY2tTZXJ2ZXIgZnJvbSAnLi9zZXJ2ZXInO1xuaW1wb3J0IE1vY2tTb2NrZXRJTyBmcm9tICcuL3NvY2tldC1pbyc7XG5pbXBvcnQgTW9ja1dlYlNvY2tldCBmcm9tICcuL3dlYnNvY2tldCc7XG5cblxuZGVidWdnZXI7XG5cbmV4cG9ydCBjb25zdCBTZXJ2ZXIgPSBNb2NrU2VydmVyO1xuZXhwb3J0IGNvbnN0IFdlYlNvY2tldCA9IE1vY2tXZWJTb2NrZXQ7XG5leHBvcnQgY29uc3QgU29ja2V0SU8gPSBNb2NrU29ja2V0SU87XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvaW5kZXguanMiLCJpbXBvcnQgV2ViU29ja2V0IGZyb20gJy4vd2Vic29ja2V0JztcbmltcG9ydCBFdmVudFRhcmdldCBmcm9tICcuL2V2ZW50LXRhcmdldCc7XG5pbXBvcnQgbmV0d29ya0JyaWRnZSBmcm9tICcuL25ldHdvcmstYnJpZGdlJztcbmltcG9ydCBDTE9TRV9DT0RFUyBmcm9tICcuL2hlbHBlcnMvY2xvc2UtY29kZXMnO1xuaW1wb3J0IG5vcm1hbGl6ZSBmcm9tICcuL2hlbHBlcnMvbm9ybWFsaXplLXVybCc7XG5pbXBvcnQgZ2xvYmFsT2JqZWN0IGZyb20gJy4vaGVscGVycy9nbG9iYWwtb2JqZWN0JztcbmltcG9ydCB7IGNyZWF0ZUV2ZW50LCBjcmVhdGVNZXNzYWdlRXZlbnQsIGNyZWF0ZUNsb3NlRXZlbnQgfSBmcm9tICcuL2V2ZW50LWZhY3RvcnknO1xuXG4vKlxuKiBodHRwczovL2dpdGh1Yi5jb20vd2Vic29ja2V0cy93cyNzZXJ2ZXItZXhhbXBsZVxuKi9cbmNsYXNzIFNlcnZlciBleHRlbmRzIEV2ZW50VGFyZ2V0IHtcbiAgLypcbiAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICovXG4gIGNvbnN0cnVjdG9yKHVybCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnVybCA9IG5vcm1hbGl6ZSh1cmwpO1xuICAgIHRoaXMub3JpZ2luYWxXZWJTb2NrZXQgPSBudWxsO1xuICAgIGNvbnN0IHNlcnZlciA9IG5ldHdvcmtCcmlkZ2UuYXR0YWNoU2VydmVyKHRoaXMsIHRoaXMudXJsKTtcblxuICAgIGlmICghc2VydmVyKSB7XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoY3JlYXRlRXZlbnQoeyB0eXBlOiAnZXJyb3InIH0pKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQSBtb2NrIHNlcnZlciBpcyBhbHJlYWR5IGxpc3RlbmluZyBvbiB0aGlzIHVybCcpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucy52ZXJpZml5Q2xpZW50ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgb3B0aW9ucy52ZXJpZml5Q2xpZW50ID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXG4gICAgdGhpcy5zdGFydCgpO1xuICB9XG5cbiAgLypcbiAgKiBBdHRhY2hlcyB0aGUgbW9jayB3ZWJzb2NrZXQgb2JqZWN0IHRvIHRoZSBnbG9iYWwgb2JqZWN0XG4gICovXG4gIHN0YXJ0KCkge1xuICAgIGNvbnN0IGdsb2JhbE9iaiA9IGdsb2JhbE9iamVjdCgpO1xuXG4gICAgaWYgKGdsb2JhbE9iai5XZWJTb2NrZXQpIHtcbiAgICAgIHRoaXMub3JpZ2luYWxXZWJTb2NrZXQgPSBnbG9iYWxPYmouV2ViU29ja2V0O1xuICAgIH1cblxuICAgIGdsb2JhbE9iai5XZWJTb2NrZXQgPSBXZWJTb2NrZXQ7XG4gIH1cblxuICAvKlxuICAqIFJlbW92ZXMgdGhlIG1vY2sgd2Vic29ja2V0IG9iamVjdCBmcm9tIHRoZSBnbG9iYWwgb2JqZWN0XG4gICovXG4gIHN0b3AoY2FsbGJhY2sgPSAoKSA9PiB7fSkge1xuICAgIGNvbnN0IGdsb2JhbE9iaiA9IGdsb2JhbE9iamVjdCgpO1xuXG4gICAgaWYgKHRoaXMub3JpZ2luYWxXZWJTb2NrZXQpIHtcbiAgICAgIGdsb2JhbE9iai5XZWJTb2NrZXQgPSB0aGlzLm9yaWdpbmFsV2ViU29ja2V0O1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgZ2xvYmFsT2JqLldlYlNvY2tldDtcbiAgICB9XG5cbiAgICB0aGlzLm9yaWdpbmFsV2ViU29ja2V0ID0gbnVsbDtcblxuICAgIG5ldHdvcmtCcmlkZ2UucmVtb3ZlU2VydmVyKHRoaXMudXJsKTtcblxuICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNhbGxiYWNrKCk7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgKiBUaGlzIGlzIHRoZSBtYWluIGZ1bmN0aW9uIGZvciB0aGUgbW9jayBzZXJ2ZXIgdG8gc3Vic2NyaWJlIHRvIHRoZSBvbiBldmVudHMuXG4gICpcbiAgKiBpZTogbW9ja1NlcnZlci5vbignY29ubmVjdGlvbicsIGZ1bmN0aW9uKCkgeyBjb25zb2xlLmxvZygnYSBtb2NrIGNsaWVudCBjb25uZWN0ZWQnKTsgfSk7XG4gICpcbiAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIFRoZSBldmVudCBrZXkgdG8gc3Vic2NyaWJlIHRvLiBWYWxpZCBrZXlzIGFyZTogY29ubmVjdGlvbiwgbWVzc2FnZSwgYW5kIGNsb3NlLlxuICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gVGhlIGNhbGxiYWNrIHdoaWNoIHNob3VsZCBiZSBjYWxsZWQgd2hlbiBhIGNlcnRhaW4gZXZlbnQgaXMgZmlyZWQuXG4gICovXG4gIG9uKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qXG4gICogVGhpcyBzZW5kIGZ1bmN0aW9uIHdpbGwgbm90aWZ5IGFsbCBtb2NrIGNsaWVudHMgdmlhIHRoZWlyIG9ubWVzc2FnZSBjYWxsYmFja3MgdGhhdCB0aGUgc2VydmVyXG4gICogaGFzIGEgbWVzc2FnZSBmb3IgdGhlbS5cbiAgKlxuICAqIEBwYXJhbSB7Kn0gZGF0YSAtIEFueSBqYXZhc2NyaXB0IG9iamVjdCB3aGljaCB3aWxsIGJlIGNyYWZ0ZWQgaW50byBhIE1lc3NhZ2VPYmplY3QuXG4gICovXG4gIHNlbmQoZGF0YSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5lbWl0KCdtZXNzYWdlJywgZGF0YSwgb3B0aW9ucyk7XG4gIH1cblxuICAvKlxuICAqIFNlbmRzIGEgZ2VuZXJpYyBtZXNzYWdlIGV2ZW50IHRvIGFsbCBtb2NrIGNsaWVudHMuXG4gICovXG4gIGVtaXQoZXZlbnQsIGRhdGEsIG9wdGlvbnMgPSB7fSkge1xuICAgIGxldCB7IHdlYnNvY2tldHMgfSA9IG9wdGlvbnM7XG5cbiAgICBpZiAoIXdlYnNvY2tldHMpIHtcbiAgICAgIHdlYnNvY2tldHMgPSBuZXR3b3JrQnJpZGdlLndlYnNvY2tldHNMb29rdXAodGhpcy51cmwpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcgfHwgYXJndW1lbnRzLmxlbmd0aCA+IDMpIHtcbiAgICAgIGRhdGEgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEsIGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIH1cblxuICAgIHdlYnNvY2tldHMuZm9yRWFjaCgoc29ja2V0KSA9PiB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgICAgICBzb2NrZXQuZGlzcGF0Y2hFdmVudChjcmVhdGVNZXNzYWdlRXZlbnQoe1xuICAgICAgICAgIHR5cGU6IGV2ZW50LFxuICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgb3JpZ2luOiB0aGlzLnVybCxcbiAgICAgICAgICB0YXJnZXQ6IHNvY2tldFxuICAgICAgICB9KSwgLi4uZGF0YSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzb2NrZXQuZGlzcGF0Y2hFdmVudChjcmVhdGVNZXNzYWdlRXZlbnQoe1xuICAgICAgICAgIHR5cGU6IGV2ZW50LFxuICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgb3JpZ2luOiB0aGlzLnVybCxcbiAgICAgICAgICB0YXJnZXQ6IHNvY2tldFxuICAgICAgICB9KSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKlxuICAqIENsb3NlcyB0aGUgY29ubmVjdGlvbiBhbmQgdHJpZ2dlcnMgdGhlIG9uY2xvc2UgbWV0aG9kIG9mIGFsbCBsaXN0ZW5pbmdcbiAgKiB3ZWJzb2NrZXRzLiBBZnRlciB0aGF0IGl0IHJlbW92ZXMgaXRzZWxmIGZyb20gdGhlIHVybE1hcCBzbyBhbm90aGVyIHNlcnZlclxuICAqIGNvdWxkIGFkZCBpdHNlbGYgdG8gdGhlIHVybC5cbiAgKlxuICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gICovXG4gIGNsb3NlKG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHtcbiAgICAgIGNvZGUsXG4gICAgICByZWFzb24sXG4gICAgICB3YXNDbGVhblxuICAgIH0gPSBvcHRpb25zO1xuICAgIGNvbnN0IGxpc3RlbmVycyA9IG5ldHdvcmtCcmlkZ2Uud2Vic29ja2V0c0xvb2t1cCh0aGlzLnVybCk7XG5cbiAgICBsaXN0ZW5lcnMuZm9yRWFjaCgoc29ja2V0KSA9PiB7XG4gICAgICBzb2NrZXQucmVhZHlTdGF0ZSA9IFdlYlNvY2tldC5DTE9TRTtcbiAgICAgIHNvY2tldC5kaXNwYXRjaEV2ZW50KGNyZWF0ZUNsb3NlRXZlbnQoe1xuICAgICAgICB0eXBlOiAnY2xvc2UnLFxuICAgICAgICB0YXJnZXQ6IHNvY2tldCxcbiAgICAgICAgY29kZTogY29kZSB8fCBDTE9TRV9DT0RFUy5DTE9TRV9OT1JNQUwsXG4gICAgICAgIHJlYXNvbjogcmVhc29uIHx8ICcnLFxuICAgICAgICB3YXNDbGVhblxuICAgICAgfSkpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KGNyZWF0ZUNsb3NlRXZlbnQoeyB0eXBlOiAnY2xvc2UnIH0pLCB0aGlzKTtcbiAgICBuZXR3b3JrQnJpZGdlLnJlbW92ZVNlcnZlcih0aGlzLnVybCk7XG4gIH1cblxuICAvKlxuICAqIFJldHVybnMgYW4gYXJyYXkgb2Ygd2Vic29ja2V0cyB3aGljaCBhcmUgbGlzdGVuaW5nIHRvIHRoaXMgc2VydmVyXG4gICovXG4gIGNsaWVudHMoKSB7XG4gICAgcmV0dXJuIG5ldHdvcmtCcmlkZ2Uud2Vic29ja2V0c0xvb2t1cCh0aGlzLnVybCk7XG4gIH1cblxuICAvKlxuICAqIFByZXBhcmVzIGEgbWV0aG9kIHRvIHN1Ym1pdCBhbiBldmVudCB0byBtZW1iZXJzIG9mIHRoZSByb29tXG4gICpcbiAgKiBlLmcuIHNlcnZlci50bygnbXktcm9vbScpLmVtaXQoJ2hpIScpO1xuICAqL1xuICB0byhyb29tLCBicm9hZGNhc3Rlcikge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGNvbnN0IHdlYnNvY2tldHMgPSBuZXR3b3JrQnJpZGdlLndlYnNvY2tldHNMb29rdXAodGhpcy51cmwsIHJvb20sIGJyb2FkY2FzdGVyKTtcbiAgICByZXR1cm4ge1xuICAgICAgZW1pdChldmVudCwgZGF0YSkge1xuICAgICAgICBzZWxmLmVtaXQoZXZlbnQsIGRhdGEsIHsgd2Vic29ja2V0cyB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLypcbiAgICogQWxpYXMgZm9yIFNlcnZlci50b1xuICAgKi9cbiAgaW4oLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLnRvLmFwcGx5KG51bGwsIGFyZ3MpO1xuICB9XG59XG5cbi8qXG4gKiBBbHRlcm5hdGl2ZSBjb25zdHJ1Y3RvciB0byBzdXBwb3J0IG5hbWVzcGFjZXMgaW4gc29ja2V0LmlvXG4gKlxuICogaHR0cDovL3NvY2tldC5pby9kb2NzL3Jvb21zLWFuZC1uYW1lc3BhY2VzLyNjdXN0b20tbmFtZXNwYWNlc1xuICovXG5TZXJ2ZXIub2YgPSBmdW5jdGlvbiBvZih1cmwpIHtcbiAgcmV0dXJuIG5ldyBTZXJ2ZXIodXJsKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFNlcnZlcjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9zZXJ2ZXIuanMiLCJpbXBvcnQgZGVsYXkgZnJvbSAnLi9oZWxwZXJzL2RlbGF5JztcbmltcG9ydCBFdmVudFRhcmdldCBmcm9tICcuL2V2ZW50LXRhcmdldCc7XG5pbXBvcnQgbmV0d29ya0JyaWRnZSBmcm9tICcuL25ldHdvcmstYnJpZGdlJztcbmltcG9ydCBDTE9TRV9DT0RFUyBmcm9tICcuL2hlbHBlcnMvY2xvc2UtY29kZXMnO1xuaW1wb3J0IG5vcm1hbGl6ZSBmcm9tICcuL2hlbHBlcnMvbm9ybWFsaXplLXVybCc7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vaGVscGVycy9sb2dnZXInO1xuaW1wb3J0IHsgY3JlYXRlRXZlbnQsIGNyZWF0ZU1lc3NhZ2VFdmVudCwgY3JlYXRlQ2xvc2VFdmVudCB9IGZyb20gJy4vZXZlbnQtZmFjdG9yeSc7XG5cbi8qXG4qIFRoZSBtYWluIHdlYnNvY2tldCBjbGFzcyB3aGljaCBpcyBkZXNpZ25lZCB0byBtaW1pY2sgdGhlIG5hdGl2ZSBXZWJTb2NrZXQgY2xhc3MgYXMgY2xvc2VcbiogYXMgcG9zc2libGUuXG4qXG4qIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9XZWJTb2NrZXRcbiovXG5jbGFzcyBXZWJTb2NrZXQgZXh0ZW5kcyBFdmVudFRhcmdldCB7XG4gIC8qXG4gICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAqL1xuICBjb25zdHJ1Y3Rvcih1cmwsIHByb3RvY29sID0gJycpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgaWYgKCF1cmwpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZhaWxlZCB0byBjb25zdHJ1Y3QgXFwnV2ViU29ja2V0XFwnOiAxIGFyZ3VtZW50IHJlcXVpcmVkLCBidXQgb25seSAwIHByZXNlbnQuJyk7XG4gICAgfVxuXG4gICAgdGhpcy5iaW5hcnlUeXBlID0gJ2Jsb2InO1xuICAgIHRoaXMudXJsID0gbm9ybWFsaXplKHVybCk7XG4gICAgdGhpcy5yZWFkeVN0YXRlID0gV2ViU29ja2V0LkNPTk5FQ1RJTkc7XG4gICAgdGhpcy5wcm90b2NvbCA9ICcnO1xuXG4gICAgaWYgKHR5cGVvZiBwcm90b2NvbCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRoaXMucHJvdG9jb2wgPSBwcm90b2NvbDtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocHJvdG9jb2wpICYmIHByb3RvY29sLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMucHJvdG9jb2wgPSBwcm90b2NvbFswXTtcbiAgICB9XG5cbiAgICAvKlxuICAgICogSW4gb3JkZXIgdG8gY2FwdHVyZSB0aGUgY2FsbGJhY2sgZnVuY3Rpb24gd2UgbmVlZCB0byBkZWZpbmUgY3VzdG9tIHNldHRlcnMuXG4gICAgKiBUbyBpbGx1c3RyYXRlOlxuICAgICogICBteVNvY2tldC5vbm9wZW4gPSBmdW5jdGlvbigpIHsgYWxlcnQodHJ1ZSkgfTtcbiAgICAqXG4gICAgKiBUaGUgb25seSB3YXkgdG8gY2FwdHVyZSB0aGF0IGZ1bmN0aW9uIGFuZCBob2xkIG9udG8gaXQgZm9yIGxhdGVyIGlzIHdpdGggdGhlXG4gICAgKiBiZWxvdyBjb2RlOlxuICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgb25vcGVuOiB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0KCkgeyByZXR1cm4gdGhpcy5saXN0ZW5lcnMub3BlbjsgfSxcbiAgICAgICAgc2V0KGxpc3RlbmVyKSB7XG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdvcGVuJywgbGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb25tZXNzYWdlOiB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0KCkgeyByZXR1cm4gdGhpcy5saXN0ZW5lcnMubWVzc2FnZTsgfSxcbiAgICAgICAgc2V0KGxpc3RlbmVyKSB7XG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgbGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb25jbG9zZToge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHsgcmV0dXJuIHRoaXMubGlzdGVuZXJzLmNsb3NlOyB9LFxuICAgICAgICBzZXQobGlzdGVuZXIpIHtcbiAgICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgbGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb25lcnJvcjoge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHsgcmV0dXJuIHRoaXMubGlzdGVuZXJzLmVycm9yOyB9LFxuICAgICAgICBzZXQobGlzdGVuZXIpIHtcbiAgICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgbGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBzZXJ2ZXIgPSBuZXR3b3JrQnJpZGdlLmF0dGFjaFdlYlNvY2tldCh0aGlzLCB0aGlzLnVybCk7XG5cbiAgICAvKlxuICAgICogVGhpcyBkZWxheSBpcyBuZWVkZWQgc28gdGhhdCB3ZSBkb250IHRyaWdnZXIgYW4gZXZlbnQgYmVmb3JlIHRoZSBjYWxsYmFja3MgaGF2ZSBiZWVuXG4gICAgKiBzZXR1cC4gRm9yIGV4YW1wbGU6XG4gICAgKlxuICAgICogdmFyIHNvY2tldCA9IG5ldyBXZWJTb2NrZXQoJ3dzOi8vbG9jYWxob3N0Jyk7XG4gICAgKlxuICAgICogLy8gSWYgd2UgZG9udCBoYXZlIHRoZSBkZWxheSB0aGVuIHRoZSBldmVudCB3b3VsZCBiZSB0cmlnZ2VyZWQgcmlnaHQgaGVyZSBhbmQgdGhpcyBpc1xuICAgICogLy8gYmVmb3JlIHRoZSBvbm9wZW4gaGFkIGEgY2hhbmNlIHRvIHJlZ2lzdGVyIGl0c2VsZi5cbiAgICAqXG4gICAgKiBzb2NrZXQub25vcGVuID0gKCkgPT4geyAvLyB0aGlzIHdvdWxkIG5ldmVyIGJlIGNhbGxlZCB9O1xuICAgICpcbiAgICAqIC8vIGFuZCB3aXRoIHRoZSBkZWxheSB0aGUgZXZlbnQgZ2V0cyB0cmlnZ2VyZWQgaGVyZSBhZnRlciBhbGwgb2YgdGhlIGNhbGxiYWNrcyBoYXZlIGJlZW5cbiAgICAqIC8vIHJlZ2lzdGVyZWQgOi0pXG4gICAgKi9cbiAgICBkZWxheShmdW5jdGlvbiBkZWxheUNhbGxiYWNrKCkge1xuICAgICAgaWYgKHNlcnZlcikge1xuICAgICAgICBpZiAoc2VydmVyLm9wdGlvbnMudmVyaWZ5Q2xpZW50XG4gICAgICAgICAgJiYgdHlwZW9mIHNlcnZlci5vcHRpb25zLnZlcmlmeUNsaWVudCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICYmICFzZXJ2ZXIub3B0aW9ucy52ZXJpZnlDbGllbnQoKSkge1xuICAgICAgICAgIHRoaXMucmVhZHlTdGF0ZSA9IFdlYlNvY2tldC5DTE9TRUQ7XG5cbiAgICAgICAgICBsb2dnZXIoXG4gICAgICAgICAgICAnZXJyb3InLFxuICAgICAgICAgICAgYFdlYlNvY2tldCBjb25uZWN0aW9uIHRvICcke3RoaXMudXJsfScgZmFpbGVkOiBIVFRQIEF1dGhlbnRpY2F0aW9uIGZhaWxlZDsgbm8gdmFsaWQgY3JlZGVudGlhbHMgYXZhaWxhYmxlYFxuICAgICAgICAgICk7XG5cbiAgICAgICAgICBuZXR3b3JrQnJpZGdlLnJlbW92ZVdlYlNvY2tldCh0aGlzLCB0aGlzLnVybCk7XG4gICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGNyZWF0ZUV2ZW50KHsgdHlwZTogJ2Vycm9yJywgdGFyZ2V0OiB0aGlzIH0pKTtcbiAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoY3JlYXRlQ2xvc2VFdmVudCh7IHR5cGU6ICdjbG9zZScsIHRhcmdldDogdGhpcywgY29kZTogQ0xPU0VfQ09ERVMuQ0xPU0VfTk9STUFMIH0pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnJlYWR5U3RhdGUgPSBXZWJTb2NrZXQuT1BFTjtcbiAgICAgICAgICBzZXJ2ZXIuZGlzcGF0Y2hFdmVudChjcmVhdGVFdmVudCh7IHR5cGU6ICdjb25uZWN0aW9uJyB9KSwgc2VydmVyLCB0aGlzKTtcbiAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoY3JlYXRlRXZlbnQoeyB0eXBlOiAnb3BlbicsIHRhcmdldDogdGhpcyB9KSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucmVhZHlTdGF0ZSA9IFdlYlNvY2tldC5DTE9TRUQ7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChjcmVhdGVFdmVudCh7IHR5cGU6ICdlcnJvcicsIHRhcmdldDogdGhpcyB9KSk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChjcmVhdGVDbG9zZUV2ZW50KHsgdHlwZTogJ2Nsb3NlJywgdGFyZ2V0OiB0aGlzLCBjb2RlOiBDTE9TRV9DT0RFUy5DTE9TRV9OT1JNQUwgfSkpO1xuXG4gICAgICAgIGxvZ2dlcignZXJyb3InLCBgV2ViU29ja2V0IGNvbm5lY3Rpb24gdG8gJyR7dGhpcy51cmx9JyBmYWlsZWRgKTtcbiAgICAgIH1cbiAgICB9LCB0aGlzKTtcbiAgfVxuXG4gIC8qXG4gICogVHJhbnNtaXRzIGRhdGEgdG8gdGhlIHNlcnZlciBvdmVyIHRoZSBXZWJTb2NrZXQgY29ubmVjdGlvbi5cbiAgKlxuICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9XZWJTb2NrZXQjc2VuZCgpXG4gICovXG4gIHNlbmQoZGF0YSkge1xuICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5DTE9TSU5HIHx8IHRoaXMucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0LkNMT1NFRCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdXZWJTb2NrZXQgaXMgYWxyZWFkeSBpbiBDTE9TSU5HIG9yIENMT1NFRCBzdGF0ZScpO1xuICAgIH1cblxuICAgIGNvbnN0IG1lc3NhZ2VFdmVudCA9IGNyZWF0ZU1lc3NhZ2VFdmVudCh7XG4gICAgICB0eXBlOiAnbWVzc2FnZScsXG4gICAgICBvcmlnaW46IHRoaXMudXJsLFxuICAgICAgZGF0YVxuICAgIH0pO1xuXG4gICAgY29uc3Qgc2VydmVyID0gbmV0d29ya0JyaWRnZS5zZXJ2ZXJMb29rdXAodGhpcy51cmwpO1xuXG4gICAgaWYgKHNlcnZlcikge1xuICAgICAgc2VydmVyLmRpc3BhdGNoRXZlbnQobWVzc2FnZUV2ZW50LCBkYXRhKTtcbiAgICB9XG4gIH1cblxuICAvKlxuICAqIENsb3NlcyB0aGUgV2ViU29ja2V0IGNvbm5lY3Rpb24gb3IgY29ubmVjdGlvbiBhdHRlbXB0LCBpZiBhbnkuXG4gICogSWYgdGhlIGNvbm5lY3Rpb24gaXMgYWxyZWFkeSBDTE9TRUQsIHRoaXMgbWV0aG9kIGRvZXMgbm90aGluZy5cbiAgKlxuICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9XZWJTb2NrZXQjY2xvc2UoKVxuICAqL1xuICBjbG9zZSgpIHtcbiAgICBpZiAodGhpcy5yZWFkeVN0YXRlICE9PSBXZWJTb2NrZXQuT1BFTikgeyByZXR1cm4gdW5kZWZpbmVkOyB9XG5cbiAgICBjb25zdCBzZXJ2ZXIgPSBuZXR3b3JrQnJpZGdlLnNlcnZlckxvb2t1cCh0aGlzLnVybCk7XG4gICAgY29uc3QgY2xvc2VFdmVudCA9IGNyZWF0ZUNsb3NlRXZlbnQoe1xuICAgICAgdHlwZTogJ2Nsb3NlJyxcbiAgICAgIHRhcmdldDogdGhpcyxcbiAgICAgIGNvZGU6IENMT1NFX0NPREVTLkNMT1NFX05PUk1BTFxuICAgIH0pO1xuXG4gICAgbmV0d29ya0JyaWRnZS5yZW1vdmVXZWJTb2NrZXQodGhpcywgdGhpcy51cmwpO1xuXG4gICAgdGhpcy5yZWFkeVN0YXRlID0gV2ViU29ja2V0LkNMT1NFRDtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoY2xvc2VFdmVudCk7XG5cbiAgICBpZiAoc2VydmVyKSB7XG4gICAgICBzZXJ2ZXIuZGlzcGF0Y2hFdmVudChjbG9zZUV2ZW50LCBzZXJ2ZXIpO1xuICAgIH1cbiAgfVxufVxuXG5XZWJTb2NrZXQuQ09OTkVDVElORyA9IDA7XG5XZWJTb2NrZXQuT1BFTiA9IDE7XG5XZWJTb2NrZXQuQ0xPU0lORyA9IDI7XG5XZWJTb2NrZXQuQ0xPU0VEID0gMztcblxuZXhwb3J0IGRlZmF1bHQgV2ViU29ja2V0O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3dlYnNvY2tldC5qcyIsIi8qXG4qIFRoaXMgZGVsYXkgYWxsb3dzIHRoZSB0aHJlYWQgdG8gZmluaXNoIGFzc2lnbmluZyBpdHMgb24qIG1ldGhvZHNcbiogYmVmb3JlIGludm9raW5nIHRoZSBkZWxheSBjYWxsYmFjay4gVGhpcyBpcyBwdXJlbHkgYSB0aW1pbmcgaGFjay5cbiogaHR0cDovL2dlZWthYnl0ZS5ibG9nc3BvdC5jb20vMjAxNC8wMS9qYXZhc2NyaXB0LWVmZmVjdC1vZi1zZXR0aW5nLXNldHRpbWVvdXQuaHRtbFxuKlxuKiBAcGFyYW0ge2NhbGxiYWNrOiBmdW5jdGlvbn0gdGhlIGNhbGxiYWNrIHdoaWNoIHdpbGwgYmUgaW52b2tlZCBhZnRlciB0aGUgdGltZW91dFxuKiBAcGFybWEge2NvbnRleHQ6IG9iamVjdH0gdGhlIGNvbnRleHQgaW4gd2hpY2ggdG8gaW52b2tlIHRoZSBmdW5jdGlvblxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbGF5KGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gIHNldFRpbWVvdXQodGltZW91dENvbnRleHQgPT4gY2FsbGJhY2suY2FsbCh0aW1lb3V0Q29udGV4dCksIDQsIGNvbnRleHQpO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2hlbHBlcnMvZGVsYXkuanMiLCJpbXBvcnQgeyByZWplY3QsIGZpbHRlciB9IGZyb20gJy4vaGVscGVycy9hcnJheS1oZWxwZXJzJztcblxuLypcbiogRXZlbnRUYXJnZXQgaXMgYW4gaW50ZXJmYWNlIGltcGxlbWVudGVkIGJ5IG9iamVjdHMgdGhhdCBjYW5cbiogcmVjZWl2ZSBldmVudHMgYW5kIG1heSBoYXZlIGxpc3RlbmVycyBmb3IgdGhlbS5cbipcbiogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0V2ZW50VGFyZ2V0XG4qL1xuY2xhc3MgRXZlbnRUYXJnZXQge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubGlzdGVuZXJzID0ge307XG4gIH1cblxuICAvKlxuICAqIFRpZXMgYSBsaXN0ZW5lciBmdW5jdGlvbiB0byBhIGV2ZW50IHR5cGUgd2hpY2ggY2FuIGxhdGVyIGJlIGludm9rZWQgdmlhIHRoZVxuICAqIGRpc3BhdGNoRXZlbnQgbWV0aG9kLlxuICAqXG4gICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSB0aGUgdHlwZSBvZiBldmVudCAoaWU6ICdvcGVuJywgJ21lc3NhZ2UnLCBldGMuKVxuICAqIEBwYXJhbSB7ZnVuY3Rpb259IGxpc3RlbmVyIC0gdGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSB3aGVuZXZlciBhIGV2ZW50IGlzIGRpc3BhdGNoZWQgbWF0Y2hpbmcgdGhlIGdpdmVuIHR5cGVcbiAgKiBAcGFyYW0ge2Jvb2xlYW59IHVzZUNhcHR1cmUgLSBOL0EgVE9ETzogaW1wbGVtZW50IHVzZUNhcHR1cmUgZnVuY3Rpb25hbGl0eVxuICAqL1xuICBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyIC8qICwgdXNlQ2FwdHVyZSAqLykge1xuICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheSh0aGlzLmxpc3RlbmVyc1t0eXBlXSkpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbdHlwZV0gPSBbXTtcbiAgICAgIH1cblxuICAgICAgLy8gT25seSBhZGQgdGhlIHNhbWUgZnVuY3Rpb24gb25jZVxuICAgICAgaWYgKGZpbHRlcih0aGlzLmxpc3RlbmVyc1t0eXBlXSwgaXRlbSA9PiBpdGVtID09PSBsaXN0ZW5lcikubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qXG4gICogUmVtb3ZlcyB0aGUgbGlzdGVuZXIgc28gaXQgd2lsbCBubyBsb25nZXIgYmUgaW52b2tlZCB2aWEgdGhlIGRpc3BhdGNoRXZlbnQgbWV0aG9kLlxuICAqXG4gICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSB0aGUgdHlwZSBvZiBldmVudCAoaWU6ICdvcGVuJywgJ21lc3NhZ2UnLCBldGMuKVxuICAqIEBwYXJhbSB7ZnVuY3Rpb259IGxpc3RlbmVyIC0gdGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSB3aGVuZXZlciBhIGV2ZW50IGlzIGRpc3BhdGNoZWQgbWF0Y2hpbmcgdGhlIGdpdmVuIHR5cGVcbiAgKiBAcGFyYW0ge2Jvb2xlYW59IHVzZUNhcHR1cmUgLSBOL0EgVE9ETzogaW1wbGVtZW50IHVzZUNhcHR1cmUgZnVuY3Rpb25hbGl0eVxuICAqL1xuICByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIHJlbW92aW5nTGlzdGVuZXIgLyogLCB1c2VDYXB0dXJlICovKSB7XG4gICAgY29uc3QgYXJyYXlPZkxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzW3R5cGVdO1xuICAgIHRoaXMubGlzdGVuZXJzW3R5cGVdID0gcmVqZWN0KGFycmF5T2ZMaXN0ZW5lcnMsIGxpc3RlbmVyID0+IGxpc3RlbmVyID09PSByZW1vdmluZ0xpc3RlbmVyKTtcbiAgfVxuXG4gIC8qXG4gICogSW52b2tlcyBhbGwgbGlzdGVuZXIgZnVuY3Rpb25zIHRoYXQgYXJlIGxpc3RlbmluZyB0byB0aGUgZ2l2ZW4gZXZlbnQudHlwZSBwcm9wZXJ0eS4gRWFjaFxuICAqIGxpc3RlbmVyIHdpbGwgYmUgcGFzc2VkIHRoZSBldmVudCBhcyB0aGUgZmlyc3QgYXJndW1lbnQuXG4gICpcbiAgKiBAcGFyYW0ge29iamVjdH0gZXZlbnQgLSBldmVudCBvYmplY3Qgd2hpY2ggd2lsbCBiZSBwYXNzZWQgdG8gYWxsIGxpc3RlbmVycyBvZiB0aGUgZXZlbnQudHlwZSBwcm9wZXJ0eVxuICAqL1xuICBkaXNwYXRjaEV2ZW50KGV2ZW50LCAuLi5jdXN0b21Bcmd1bWVudHMpIHtcbiAgICBjb25zdCBldmVudE5hbWUgPSBldmVudC50eXBlO1xuICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzW2V2ZW50TmFtZV07XG5cbiAgICBpZiAoIUFycmF5LmlzQXJyYXkobGlzdGVuZXJzKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgaWYgKGN1c3RvbUFyZ3VtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGN1c3RvbUFyZ3VtZW50cyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsaXN0ZW5lci5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEV2ZW50VGFyZ2V0O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2V2ZW50LXRhcmdldC5qcyIsImV4cG9ydCBmdW5jdGlvbiByZWplY3QoYXJyYXksIGNhbGxiYWNrKSB7XG4gIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgYXJyYXkuZm9yRWFjaCgoaXRlbUluQXJyYXkpID0+IHtcbiAgICBpZiAoIWNhbGxiYWNrKGl0ZW1JbkFycmF5KSkge1xuICAgICAgcmVzdWx0cy5wdXNoKGl0ZW1JbkFycmF5KTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiByZXN1bHRzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyKGFycmF5LCBjYWxsYmFjaykge1xuICBjb25zdCByZXN1bHRzID0gW107XG4gIGFycmF5LmZvckVhY2goKGl0ZW1JbkFycmF5KSA9PiB7XG4gICAgaWYgKGNhbGxiYWNrKGl0ZW1JbkFycmF5KSkge1xuICAgICAgcmVzdWx0cy5wdXNoKGl0ZW1JbkFycmF5KTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiByZXN1bHRzO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2hlbHBlcnMvYXJyYXktaGVscGVycy5qcyIsImltcG9ydCB7IHJlamVjdCB9IGZyb20gJy4vaGVscGVycy9hcnJheS1oZWxwZXJzJztcblxuLypcbiogVGhlIG5ldHdvcmsgYnJpZGdlIGlzIGEgd2F5IGZvciB0aGUgbW9jayB3ZWJzb2NrZXQgb2JqZWN0IHRvICdjb21tdW5pY2F0ZScgd2l0aFxuKiBhbGwgYXZhaWxhYmxlIHNlcnZlcnMuIFRoaXMgaXMgYSBzaW5nbGV0b24gb2JqZWN0IHNvIGl0IGlzIGltcG9ydGFudCB0aGF0IHlvdVxuKiBjbGVhbiB1cCB1cmxNYXAgd2hlbmV2ZXIgeW91IGFyZSBmaW5pc2hlZC5cbiovXG5jbGFzcyBOZXR3b3JrQnJpZGdlIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy51cmxNYXAgPSB7fTtcbiAgfVxuXG4gIC8qXG4gICogQXR0YWNoZXMgYSB3ZWJzb2NrZXQgb2JqZWN0IHRvIHRoZSB1cmxNYXAgaGFzaCBzbyB0aGF0IGl0IGNhbiBmaW5kIHRoZSBzZXJ2ZXJcbiAgKiBpdCBpcyBjb25uZWN0ZWQgdG8gYW5kIHRoZSBzZXJ2ZXIgaW4gdHVybiBjYW4gZmluZCBpdC5cbiAgKlxuICAqIEBwYXJhbSB7b2JqZWN0fSB3ZWJzb2NrZXQgLSB3ZWJzb2NrZXQgb2JqZWN0IHRvIGFkZCB0byB0aGUgdXJsTWFwIGhhc2hcbiAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICovXG4gIGF0dGFjaFdlYlNvY2tldCh3ZWJzb2NrZXQsIHVybCkge1xuICAgIGNvbnN0IGNvbm5lY3Rpb25Mb29rdXAgPSB0aGlzLnVybE1hcFt1cmxdO1xuXG4gICAgaWYgKGNvbm5lY3Rpb25Mb29rdXAgJiZcbiAgICAgICAgY29ubmVjdGlvbkxvb2t1cC5zZXJ2ZXIgJiZcbiAgICAgICAgY29ubmVjdGlvbkxvb2t1cC53ZWJzb2NrZXRzLmluZGV4T2Yod2Vic29ja2V0KSA9PT0gLTEpIHtcbiAgICAgIGNvbm5lY3Rpb25Mb29rdXAud2Vic29ja2V0cy5wdXNoKHdlYnNvY2tldCk7XG4gICAgICByZXR1cm4gY29ubmVjdGlvbkxvb2t1cC5zZXJ2ZXI7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgKiBBdHRhY2hlcyBhIHdlYnNvY2tldCB0byBhIHJvb21cbiAgKi9cbiAgYWRkTWVtYmVyc2hpcFRvUm9vbSh3ZWJzb2NrZXQsIHJvb20pIHtcbiAgICBjb25zdCBjb25uZWN0aW9uTG9va3VwID0gdGhpcy51cmxNYXBbd2Vic29ja2V0LnVybF07XG5cbiAgICBpZiAoY29ubmVjdGlvbkxvb2t1cCAmJlxuICAgICAgICBjb25uZWN0aW9uTG9va3VwLnNlcnZlciAmJlxuICAgICAgICBjb25uZWN0aW9uTG9va3VwLndlYnNvY2tldHMuaW5kZXhPZih3ZWJzb2NrZXQpICE9PSAtMSkge1xuICAgICAgaWYgKCFjb25uZWN0aW9uTG9va3VwLnJvb21NZW1iZXJzaGlwc1tyb29tXSkge1xuICAgICAgICBjb25uZWN0aW9uTG9va3VwLnJvb21NZW1iZXJzaGlwc1tyb29tXSA9IFtdO1xuICAgICAgfVxuXG4gICAgICBjb25uZWN0aW9uTG9va3VwLnJvb21NZW1iZXJzaGlwc1tyb29tXS5wdXNoKHdlYnNvY2tldCk7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgKiBBdHRhY2hlcyBhIHNlcnZlciBvYmplY3QgdG8gdGhlIHVybE1hcCBoYXNoIHNvIHRoYXQgaXQgY2FuIGZpbmQgYSB3ZWJzb2NrZXRzXG4gICogd2hpY2ggYXJlIGNvbm5lY3RlZCB0byBpdCBhbmQgc28gdGhhdCB3ZWJzb2NrZXRzIGNhbiBpbiB0dXJuIGNhbiBmaW5kIGl0LlxuICAqXG4gICogQHBhcmFtIHtvYmplY3R9IHNlcnZlciAtIHNlcnZlciBvYmplY3QgdG8gYWRkIHRvIHRoZSB1cmxNYXAgaGFzaFxuICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgKi9cbiAgYXR0YWNoU2VydmVyKHNlcnZlciwgdXJsKSB7XG4gICAgY29uc3QgY29ubmVjdGlvbkxvb2t1cCA9IHRoaXMudXJsTWFwW3VybF07XG5cbiAgICBpZiAoIWNvbm5lY3Rpb25Mb29rdXApIHtcbiAgICAgIHRoaXMudXJsTWFwW3VybF0gPSB7XG4gICAgICAgIHNlcnZlcixcbiAgICAgICAgd2Vic29ja2V0czogW10sXG4gICAgICAgIHJvb21NZW1iZXJzaGlwczoge31cbiAgICAgIH07XG5cbiAgICAgIHJldHVybiBzZXJ2ZXI7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgKiBGaW5kcyB0aGUgc2VydmVyIHdoaWNoIGlzICdydW5uaW5nJyBvbiB0aGUgZ2l2ZW4gdXJsLlxuICAqXG4gICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIHRoZSB1cmwgdG8gdXNlIHRvIGZpbmQgd2hpY2ggc2VydmVyIGlzIHJ1bm5pbmcgb24gaXRcbiAgKi9cbiAgc2VydmVyTG9va3VwKHVybCkge1xuICAgIGNvbnN0IGNvbm5lY3Rpb25Mb29rdXAgPSB0aGlzLnVybE1hcFt1cmxdO1xuXG4gICAgaWYgKGNvbm5lY3Rpb25Mb29rdXApIHtcbiAgICAgIHJldHVybiBjb25uZWN0aW9uTG9va3VwLnNlcnZlcjtcbiAgICB9XG4gIH1cblxuICAvKlxuICAqIEZpbmRzIGFsbCB3ZWJzb2NrZXRzIHdoaWNoIGlzICdsaXN0ZW5pbmcnIG9uIHRoZSBnaXZlbiB1cmwuXG4gICpcbiAgKiBAcGFyYW0ge3N0cmluZ30gdXJsIC0gdGhlIHVybCB0byB1c2UgdG8gZmluZCBhbGwgd2Vic29ja2V0cyB3aGljaCBhcmUgYXNzb2NpYXRlZCB3aXRoIGl0XG4gICogQHBhcmFtIHtzdHJpbmd9IHJvb20gLSBpZiBhIHJvb20gaXMgcHJvdmlkZWQsIHdpbGwgb25seSByZXR1cm4gc29ja2V0cyBpbiB0aGlzIHJvb21cbiAgKiBAcGFyYW0ge2NsYXNzfSBicm9hZGNhc3RlciAtIHNvY2tldCB0aGF0IGlzIGJyb2FkY2FzdGluZyBhbmQgaXMgdG8gYmUgZXhjbHVkZWQgZnJvbSB0aGUgbG9va3VwXG4gICovXG4gIHdlYnNvY2tldHNMb29rdXAodXJsLCByb29tLCBicm9hZGNhc3Rlcikge1xuICAgIGxldCB3ZWJzb2NrZXRzO1xuICAgIGNvbnN0IGNvbm5lY3Rpb25Mb29rdXAgPSB0aGlzLnVybE1hcFt1cmxdO1xuXG4gICAgd2Vic29ja2V0cyA9IGNvbm5lY3Rpb25Mb29rdXAgPyBjb25uZWN0aW9uTG9va3VwLndlYnNvY2tldHMgOiBbXTtcblxuICAgIGlmIChyb29tKSB7XG4gICAgICBjb25zdCBtZW1iZXJzID0gY29ubmVjdGlvbkxvb2t1cC5yb29tTWVtYmVyc2hpcHNbcm9vbV07XG4gICAgICB3ZWJzb2NrZXRzID0gbWVtYmVycyB8fCBbXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYnJvYWRjYXN0ZXIgPyB3ZWJzb2NrZXRzLmZpbHRlcih3ZWJzb2NrZXQgPT4gd2Vic29ja2V0ICE9PSBicm9hZGNhc3RlcikgOiB3ZWJzb2NrZXRzO1xuICB9XG5cbiAgLypcbiAgKiBSZW1vdmVzIHRoZSBlbnRyeSBhc3NvY2lhdGVkIHdpdGggdGhlIHVybC5cbiAgKlxuICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgKi9cbiAgcmVtb3ZlU2VydmVyKHVybCkge1xuICAgIGRlbGV0ZSB0aGlzLnVybE1hcFt1cmxdO1xuICB9XG5cbiAgLypcbiAgKiBSZW1vdmVzIHRoZSBpbmRpdmlkdWFsIHdlYnNvY2tldCBmcm9tIHRoZSBtYXAgb2YgYXNzb2NpYXRlZCB3ZWJzb2NrZXRzLlxuICAqXG4gICogQHBhcmFtIHtvYmplY3R9IHdlYnNvY2tldCAtIHdlYnNvY2tldCBvYmplY3QgdG8gcmVtb3ZlIGZyb20gdGhlIHVybCBtYXBcbiAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICovXG4gIHJlbW92ZVdlYlNvY2tldCh3ZWJzb2NrZXQsIHVybCkge1xuICAgIGNvbnN0IGNvbm5lY3Rpb25Mb29rdXAgPSB0aGlzLnVybE1hcFt1cmxdO1xuXG4gICAgaWYgKGNvbm5lY3Rpb25Mb29rdXApIHtcbiAgICAgIGNvbm5lY3Rpb25Mb29rdXAud2Vic29ja2V0cyA9IHJlamVjdChjb25uZWN0aW9uTG9va3VwLndlYnNvY2tldHMsIHNvY2tldCA9PiBzb2NrZXQgPT09IHdlYnNvY2tldCk7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgKiBSZW1vdmVzIGEgd2Vic29ja2V0IGZyb20gYSByb29tXG4gICovXG4gIHJlbW92ZU1lbWJlcnNoaXBGcm9tUm9vbSh3ZWJzb2NrZXQsIHJvb20pIHtcbiAgICBjb25zdCBjb25uZWN0aW9uTG9va3VwID0gdGhpcy51cmxNYXBbd2Vic29ja2V0LnVybF07XG4gICAgY29uc3QgbWVtYmVyc2hpcHMgPSBjb25uZWN0aW9uTG9va3VwLnJvb21NZW1iZXJzaGlwc1tyb29tXTtcblxuICAgIGlmIChjb25uZWN0aW9uTG9va3VwICYmIG1lbWJlcnNoaXBzICE9PSBudWxsKSB7XG4gICAgICBjb25uZWN0aW9uTG9va3VwLnJvb21NZW1iZXJzaGlwc1tyb29tXSA9IHJlamVjdChtZW1iZXJzaGlwcywgc29ja2V0ID0+IHNvY2tldCA9PT0gd2Vic29ja2V0KTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IE5ldHdvcmtCcmlkZ2UoKTsgLy8gTm90ZTogdGhpcyBpcyBhIHNpbmdsZXRvblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL25ldHdvcmstYnJpZGdlLmpzIiwiLypcbiogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0Nsb3NlRXZlbnRcbiovXG5jb25zdCBjb2RlcyA9IHtcbiAgQ0xPU0VfTk9STUFMOiAxMDAwLFxuICBDTE9TRV9HT0lOR19BV0FZOiAxMDAxLFxuICBDTE9TRV9QUk9UT0NPTF9FUlJPUjogMTAwMixcbiAgQ0xPU0VfVU5TVVBQT1JURUQ6IDEwMDMsXG4gIENMT1NFX05PX1NUQVRVUzogMTAwNSxcbiAgQ0xPU0VfQUJOT1JNQUw6IDEwMDYsXG4gIENMT1NFX1RPT19MQVJHRTogMTAwOVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY29kZXM7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvaGVscGVycy9jbG9zZS1jb2Rlcy5qcyIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG5vcm1hbGl6ZVVybCh1cmwpIHtcbiAgY29uc3QgcGFydHMgPSB1cmwuc3BsaXQoJzovLycpO1xuICByZXR1cm4gKHBhcnRzWzFdICYmIHBhcnRzWzFdLmluZGV4T2YoJy8nKSA9PT0gLTEpID8gYCR7dXJsfS9gIDogdXJsO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2hlbHBlcnMvbm9ybWFsaXplLXVybC5qcyIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGxvZyhtZXRob2QsIG1lc3NhZ2UpIHtcbiAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuICBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAndGVzdCcpIHtcbiAgICBjb25zb2xlW21ldGhvZF0uY2FsbChudWxsLCBtZXNzYWdlKTtcbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9oZWxwZXJzL2xvZ2dlci5qcyIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcHJvY2Vzcy9icm93c2VyLmpzXG4vLyBtb2R1bGUgaWQgPSAxMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgRXZlbnQgZnJvbSAnLi9oZWxwZXJzL2V2ZW50JztcbmltcG9ydCBNZXNzYWdlRXZlbnQgZnJvbSAnLi9oZWxwZXJzL21lc3NhZ2UtZXZlbnQnO1xuaW1wb3J0IENsb3NlRXZlbnQgZnJvbSAnLi9oZWxwZXJzL2Nsb3NlLWV2ZW50JztcblxuLypcbiogQ3JlYXRlcyBhbiBFdmVudCBvYmplY3QgYW5kIGV4dGVuZHMgaXQgdG8gYWxsb3cgZnVsbCBtb2RpZmljYXRpb24gb2ZcbiogaXRzIHByb3BlcnRpZXMuXG4qXG4qIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgLSB3aXRoaW4gY29uZmlnIHlvdSB3aWxsIG5lZWQgdG8gcGFzcyB0eXBlIGFuZCBvcHRpb25hbGx5IHRhcmdldFxuKi9cbmZ1bmN0aW9uIGNyZWF0ZUV2ZW50KGNvbmZpZykge1xuICBjb25zdCB7IHR5cGUsIHRhcmdldCB9ID0gY29uZmlnO1xuICBjb25zdCBldmVudE9iamVjdCA9IG5ldyBFdmVudCh0eXBlKTtcblxuICBpZiAodGFyZ2V0KSB7XG4gICAgZXZlbnRPYmplY3QudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIGV2ZW50T2JqZWN0LnNyY0VsZW1lbnQgPSB0YXJnZXQ7XG4gICAgZXZlbnRPYmplY3QuY3VycmVudFRhcmdldCA9IHRhcmdldDtcbiAgfVxuXG4gIHJldHVybiBldmVudE9iamVjdDtcbn1cblxuLypcbiogQ3JlYXRlcyBhIE1lc3NhZ2VFdmVudCBvYmplY3QgYW5kIGV4dGVuZHMgaXQgdG8gYWxsb3cgZnVsbCBtb2RpZmljYXRpb24gb2ZcbiogaXRzIHByb3BlcnRpZXMuXG4qXG4qIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgLSB3aXRoaW4gY29uZmlnOiB0eXBlLCBvcmlnaW4sIGRhdGEgYW5kIG9wdGlvbmFsbHkgdGFyZ2V0XG4qL1xuZnVuY3Rpb24gY3JlYXRlTWVzc2FnZUV2ZW50KGNvbmZpZykge1xuICBjb25zdCB7IHR5cGUsIG9yaWdpbiwgZGF0YSwgdGFyZ2V0IH0gPSBjb25maWc7XG4gIGNvbnN0IG1lc3NhZ2VFdmVudCA9IG5ldyBNZXNzYWdlRXZlbnQodHlwZSwge1xuICAgIGRhdGEsXG4gICAgb3JpZ2luXG4gIH0pO1xuXG4gIGlmICh0YXJnZXQpIHtcbiAgICBtZXNzYWdlRXZlbnQudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIG1lc3NhZ2VFdmVudC5zcmNFbGVtZW50ID0gdGFyZ2V0O1xuICAgIG1lc3NhZ2VFdmVudC5jdXJyZW50VGFyZ2V0ID0gdGFyZ2V0O1xuICB9XG5cbiAgcmV0dXJuIG1lc3NhZ2VFdmVudDtcbn1cblxuLypcbiogQ3JlYXRlcyBhIENsb3NlRXZlbnQgb2JqZWN0IGFuZCBleHRlbmRzIGl0IHRvIGFsbG93IGZ1bGwgbW9kaWZpY2F0aW9uIG9mXG4qIGl0cyBwcm9wZXJ0aWVzLlxuKlxuKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIC0gd2l0aGluIGNvbmZpZzogdHlwZSBhbmQgb3B0aW9uYWxseSB0YXJnZXQsIGNvZGUsIGFuZCByZWFzb25cbiovXG5mdW5jdGlvbiBjcmVhdGVDbG9zZUV2ZW50KGNvbmZpZykge1xuICBjb25zdCB7IGNvZGUsIHJlYXNvbiwgdHlwZSwgdGFyZ2V0IH0gPSBjb25maWc7XG4gIGxldCB7IHdhc0NsZWFuIH0gPSBjb25maWc7XG5cbiAgaWYgKCF3YXNDbGVhbikge1xuICAgIHdhc0NsZWFuID0gKGNvZGUgPT09IDEwMDApO1xuICB9XG5cbiAgY29uc3QgY2xvc2VFdmVudCA9IG5ldyBDbG9zZUV2ZW50KHR5cGUsIHtcbiAgICBjb2RlLFxuICAgIHJlYXNvbixcbiAgICB3YXNDbGVhblxuICB9KTtcblxuICBpZiAodGFyZ2V0KSB7XG4gICAgY2xvc2VFdmVudC50YXJnZXQgPSB0YXJnZXQ7XG4gICAgY2xvc2VFdmVudC5zcmNFbGVtZW50ID0gdGFyZ2V0O1xuICAgIGNsb3NlRXZlbnQuY3VycmVudFRhcmdldCA9IHRhcmdldDtcbiAgfVxuXG4gIHJldHVybiBjbG9zZUV2ZW50O1xufVxuXG5leHBvcnQge1xuICBjcmVhdGVFdmVudCxcbiAgY3JlYXRlTWVzc2FnZUV2ZW50LFxuICBjcmVhdGVDbG9zZUV2ZW50XG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2V2ZW50LWZhY3RvcnkuanMiLCJpbXBvcnQgRXZlbnRQcm90b3R5cGUgZnJvbSAnLi9ldmVudC1wcm90b3R5cGUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudCBleHRlbmRzIEV2ZW50UHJvdG90eXBlIHtcbiAgY29uc3RydWN0b3IodHlwZSwgZXZlbnRJbml0Q29uZmlnID0ge30pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgaWYgKCF0eXBlKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGYWlsZWQgdG8gY29uc3RydWN0IFxcJ0V2ZW50XFwnOiAxIGFyZ3VtZW50IHJlcXVpcmVkLCBidXQgb25seSAwIHByZXNlbnQuJyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBldmVudEluaXRDb25maWcgIT09ICdvYmplY3QnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGYWlsZWQgdG8gY29uc3RydWN0IFxcJ0V2ZW50XFwnOiBwYXJhbWV0ZXIgMiAoXFwnZXZlbnRJbml0RGljdFxcJykgaXMgbm90IGFuIG9iamVjdCcpO1xuICAgIH1cblxuICAgIGNvbnN0IHsgYnViYmxlcywgY2FuY2VsYWJsZSB9ID0gZXZlbnRJbml0Q29uZmlnO1xuXG4gICAgdGhpcy50eXBlID0gU3RyaW5nKHR5cGUpO1xuICAgIHRoaXMudGltZVN0YW1wID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLnRhcmdldCA9IG51bGw7XG4gICAgdGhpcy5zcmNFbGVtZW50ID0gbnVsbDtcbiAgICB0aGlzLnJldHVyblZhbHVlID0gdHJ1ZTtcbiAgICB0aGlzLmlzVHJ1c3RlZCA9IGZhbHNlO1xuICAgIHRoaXMuZXZlbnRQaGFzZSA9IDA7XG4gICAgdGhpcy5kZWZhdWx0UHJldmVudGVkID0gZmFsc2U7XG4gICAgdGhpcy5jdXJyZW50VGFyZ2V0ID0gbnVsbDtcbiAgICB0aGlzLmNhbmNlbGFibGUgPSBjYW5jZWxhYmxlID8gQm9vbGVhbihjYW5jZWxhYmxlKSA6IGZhbHNlO1xuICAgIHRoaXMuY2FubmNlbEJ1YmJsZSA9IGZhbHNlO1xuICAgIHRoaXMuYnViYmxlcyA9IGJ1YmJsZXMgPyBCb29sZWFuKGJ1YmJsZXMpIDogZmFsc2U7XG4gIH1cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9oZWxwZXJzL2V2ZW50LmpzIiwiXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudFByb3RvdHlwZSB7XG4gIC8vIE5vb3BzXG4gIHN0b3BQcm9wYWdhdGlvbigpIHt9XG4gIHN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpIHt9XG5cbiAgLy8gaWYgbm8gYXJndW1lbnRzIGFyZSBwYXNzZWQgdGhlbiB0aGUgdHlwZSBpcyBzZXQgdG8gXCJ1bmRlZmluZWRcIiBvblxuICAvLyBjaHJvbWUgYW5kIHNhZmFyaS5cbiAgaW5pdEV2ZW50KHR5cGUgPSAndW5kZWZpbmVkJywgYnViYmxlcyA9IGZhbHNlLCBjYW5jZWxhYmxlID0gZmFsc2UpIHtcbiAgICB0aGlzLnR5cGUgPSBTdHJpbmcodHlwZSk7XG4gICAgdGhpcy5idWJibGVzID0gQm9vbGVhbihidWJibGVzKTtcbiAgICB0aGlzLmNhbmNlbGFibGUgPSBCb29sZWFuKGNhbmNlbGFibGUpO1xuICB9XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvaGVscGVycy9ldmVudC1wcm90b3R5cGUuanMiLCJpbXBvcnQgRXZlbnRQcm90b3R5cGUgZnJvbSAnLi9ldmVudC1wcm90b3R5cGUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNZXNzYWdlRXZlbnQgZXh0ZW5kcyBFdmVudFByb3RvdHlwZSB7XG4gIGNvbnN0cnVjdG9yKHR5cGUsIGV2ZW50SW5pdENvbmZpZyA9IHt9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIGlmICghdHlwZSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRmFpbGVkIHRvIGNvbnN0cnVjdCBcXCdNZXNzYWdlRXZlbnRcXCc6IDEgYXJndW1lbnQgcmVxdWlyZWQsIGJ1dCBvbmx5IDAgcHJlc2VudC4nKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGV2ZW50SW5pdENvbmZpZyAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZhaWxlZCB0byBjb25zdHJ1Y3QgXFwnTWVzc2FnZUV2ZW50XFwnOiBwYXJhbWV0ZXIgMiAoXFwnZXZlbnRJbml0RGljdFxcJykgaXMgbm90IGFuIG9iamVjdCcpO1xuICAgIH1cblxuICAgIGNvbnN0IHtcbiAgICAgIGJ1YmJsZXMsXG4gICAgICBjYW5jZWxhYmxlLFxuICAgICAgZGF0YSxcbiAgICAgIG9yaWdpbixcbiAgICAgIGxhc3RFdmVudElkLFxuICAgICAgcG9ydHNcbiAgICB9ID0gZXZlbnRJbml0Q29uZmlnO1xuXG4gICAgdGhpcy50eXBlID0gU3RyaW5nKHR5cGUpO1xuICAgIHRoaXMudGltZVN0YW1wID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLnRhcmdldCA9IG51bGw7XG4gICAgdGhpcy5zcmNFbGVtZW50ID0gbnVsbDtcbiAgICB0aGlzLnJldHVyblZhbHVlID0gdHJ1ZTtcbiAgICB0aGlzLmlzVHJ1c3RlZCA9IGZhbHNlO1xuICAgIHRoaXMuZXZlbnRQaGFzZSA9IDA7XG4gICAgdGhpcy5kZWZhdWx0UHJldmVudGVkID0gZmFsc2U7XG4gICAgdGhpcy5jdXJyZW50VGFyZ2V0ID0gbnVsbDtcbiAgICB0aGlzLmNhbmNlbGFibGUgPSBjYW5jZWxhYmxlID8gQm9vbGVhbihjYW5jZWxhYmxlKSA6IGZhbHNlO1xuICAgIHRoaXMuY2FubmNlbEJ1YmJsZSA9IGZhbHNlO1xuICAgIHRoaXMuYnViYmxlcyA9IGJ1YmJsZXMgPyBCb29sZWFuKGJ1YmJsZXMpIDogZmFsc2U7XG4gICAgdGhpcy5vcmlnaW4gPSBvcmlnaW4gPyBTdHJpbmcob3JpZ2luKSA6ICcnO1xuICAgIHRoaXMucG9ydHMgPSB0eXBlb2YgcG9ydHMgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IHBvcnRzO1xuICAgIHRoaXMuZGF0YSA9IHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiBkYXRhO1xuICAgIHRoaXMubGFzdEV2ZW50SWQgPSBsYXN0RXZlbnRJZCA/IFN0cmluZyhsYXN0RXZlbnRJZCkgOiAnJztcbiAgfVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2hlbHBlcnMvbWVzc2FnZS1ldmVudC5qcyIsImltcG9ydCBFdmVudFByb3RvdHlwZSBmcm9tICcuL2V2ZW50LXByb3RvdHlwZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsb3NlRXZlbnQgZXh0ZW5kcyBFdmVudFByb3RvdHlwZSB7XG4gIGNvbnN0cnVjdG9yKHR5cGUsIGV2ZW50SW5pdENvbmZpZyA9IHt9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIGlmICghdHlwZSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRmFpbGVkIHRvIGNvbnN0cnVjdCBcXCdDbG9zZUV2ZW50XFwnOiAxIGFyZ3VtZW50IHJlcXVpcmVkLCBidXQgb25seSAwIHByZXNlbnQuJyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBldmVudEluaXRDb25maWcgIT09ICdvYmplY3QnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGYWlsZWQgdG8gY29uc3RydWN0IFxcJ0Nsb3NlRXZlbnRcXCc6IHBhcmFtZXRlciAyIChcXCdldmVudEluaXREaWN0XFwnKSBpcyBub3QgYW4gb2JqZWN0Jyk7XG4gICAgfVxuXG4gICAgY29uc3Qge1xuICAgICAgYnViYmxlcyxcbiAgICAgIGNhbmNlbGFibGUsXG4gICAgICBjb2RlLFxuICAgICAgcmVhc29uLFxuICAgICAgd2FzQ2xlYW5cbiAgICB9ID0gZXZlbnRJbml0Q29uZmlnO1xuXG4gICAgdGhpcy50eXBlID0gU3RyaW5nKHR5cGUpO1xuICAgIHRoaXMudGltZVN0YW1wID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLnRhcmdldCA9IG51bGw7XG4gICAgdGhpcy5zcmNFbGVtZW50ID0gbnVsbDtcbiAgICB0aGlzLnJldHVyblZhbHVlID0gdHJ1ZTtcbiAgICB0aGlzLmlzVHJ1c3RlZCA9IGZhbHNlO1xuICAgIHRoaXMuZXZlbnRQaGFzZSA9IDA7XG4gICAgdGhpcy5kZWZhdWx0UHJldmVudGVkID0gZmFsc2U7XG4gICAgdGhpcy5jdXJyZW50VGFyZ2V0ID0gbnVsbDtcbiAgICB0aGlzLmNhbmNlbGFibGUgPSBjYW5jZWxhYmxlID8gQm9vbGVhbihjYW5jZWxhYmxlKSA6IGZhbHNlO1xuICAgIHRoaXMuY2FubmNlbEJ1YmJsZSA9IGZhbHNlO1xuICAgIHRoaXMuYnViYmxlcyA9IGJ1YmJsZXMgPyBCb29sZWFuKGJ1YmJsZXMpIDogZmFsc2U7XG4gICAgdGhpcy5jb2RlID0gdHlwZW9mIGNvZGUgPT09ICdudW1iZXInID8gTnVtYmVyKGNvZGUpIDogMDtcbiAgICB0aGlzLnJlYXNvbiA9IHJlYXNvbiA/IFN0cmluZyhyZWFzb24pIDogJyc7XG4gICAgdGhpcy53YXNDbGVhbiA9IHdhc0NsZWFuID8gQm9vbGVhbih3YXNDbGVhbikgOiBmYWxzZTtcbiAgfVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2hlbHBlcnMvY2xvc2UtZXZlbnQuanMiLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZXRyaWV2ZUdsb2JhbE9iamVjdCgpIHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIHdpbmRvdztcbiAgfVxuXG4gIHJldHVybiAodHlwZW9mIHByb2Nlc3MgPT09ICdvYmplY3QnICYmXG4gICAgICB0eXBlb2YgcmVxdWlyZSA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgdHlwZW9mIGdsb2JhbCA9PT0gJ29iamVjdCcpID8gZ2xvYmFsIDogdGhpcztcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9oZWxwZXJzL2dsb2JhbC1vYmplY3QuanMiLCJpbXBvcnQgZGVsYXkgZnJvbSAnLi9oZWxwZXJzL2RlbGF5JztcbmltcG9ydCBFdmVudFRhcmdldCBmcm9tICcuL2V2ZW50LXRhcmdldCc7XG5pbXBvcnQgbmV0d29ya0JyaWRnZSBmcm9tICcuL25ldHdvcmstYnJpZGdlJztcbmltcG9ydCBDTE9TRV9DT0RFUyBmcm9tICcuL2hlbHBlcnMvY2xvc2UtY29kZXMnO1xuaW1wb3J0IG5vcm1hbGl6ZSBmcm9tICcuL2hlbHBlcnMvbm9ybWFsaXplLXVybCc7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vaGVscGVycy9sb2dnZXInO1xuaW1wb3J0IHsgY3JlYXRlRXZlbnQsIGNyZWF0ZU1lc3NhZ2VFdmVudCwgY3JlYXRlQ2xvc2VFdmVudCB9IGZyb20gJy4vZXZlbnQtZmFjdG9yeSc7XG5cbi8qXG4qIFRoZSBzb2NrZXQtaW8gY2xhc3MgaXMgZGVzaWduZWQgdG8gbWltaWNrIHRoZSByZWFsIEFQSSBhcyBjbG9zZWx5IGFzIHBvc3NpYmxlLlxuKlxuKiBodHRwOi8vc29ja2V0LmlvL2RvY3MvXG4qL1xuY2xhc3MgU29ja2V0SU8gZXh0ZW5kcyBFdmVudFRhcmdldCB7XG4gIC8qXG4gICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAqL1xuICBjb25zdHJ1Y3Rvcih1cmwgPSAnc29ja2V0LmlvJywgcHJvdG9jb2wgPSAnJykge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmJpbmFyeVR5cGUgPSAnYmxvYic7XG4gICAgdGhpcy51cmwgPSBub3JtYWxpemUodXJsKTtcbiAgICB0aGlzLnJlYWR5U3RhdGUgPSBTb2NrZXRJTy5DT05ORUNUSU5HO1xuICAgIHRoaXMucHJvdG9jb2wgPSAnJztcblxuICAgIGlmICh0eXBlb2YgcHJvdG9jb2wgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLnByb3RvY29sID0gcHJvdG9jb2w7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHByb3RvY29sKSAmJiBwcm90b2NvbC5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnByb3RvY29sID0gcHJvdG9jb2xbMF07XG4gICAgfVxuXG4gICAgY29uc3Qgc2VydmVyID0gbmV0d29ya0JyaWRnZS5hdHRhY2hXZWJTb2NrZXQodGhpcywgdGhpcy51cmwpO1xuXG4gICAgLypcbiAgICAqIERlbGF5IHRyaWdnZXJpbmcgdGhlIGNvbm5lY3Rpb24gZXZlbnRzIHNvIHRoZXkgY2FuIGJlIGRlZmluZWQgaW4gdGltZS5cbiAgICAqL1xuICAgIGRlbGF5KGZ1bmN0aW9uIGRlbGF5Q2FsbGJhY2soKSB7XG4gICAgICBpZiAoc2VydmVyKSB7XG4gICAgICAgIHRoaXMucmVhZHlTdGF0ZSA9IFNvY2tldElPLk9QRU47XG4gICAgICAgIHNlcnZlci5kaXNwYXRjaEV2ZW50KGNyZWF0ZUV2ZW50KHsgdHlwZTogJ2Nvbm5lY3Rpb24nIH0pLCBzZXJ2ZXIsIHRoaXMpO1xuICAgICAgICBzZXJ2ZXIuZGlzcGF0Y2hFdmVudChjcmVhdGVFdmVudCh7IHR5cGU6ICdjb25uZWN0JyB9KSwgc2VydmVyLCB0aGlzKTsgLy8gYWxpYXNcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGNyZWF0ZUV2ZW50KHsgdHlwZTogJ2Nvbm5lY3QnLCB0YXJnZXQ6IHRoaXMgfSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWFkeVN0YXRlID0gU29ja2V0SU8uQ0xPU0VEO1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoY3JlYXRlRXZlbnQoeyB0eXBlOiAnZXJyb3InLCB0YXJnZXQ6IHRoaXMgfSkpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoY3JlYXRlQ2xvc2VFdmVudCh7XG4gICAgICAgICAgdHlwZTogJ2Nsb3NlJyxcbiAgICAgICAgICB0YXJnZXQ6IHRoaXMsXG4gICAgICAgICAgY29kZTogQ0xPU0VfQ09ERVMuQ0xPU0VfTk9STUFMXG4gICAgICAgIH0pKTtcblxuICAgICAgICBsb2dnZXIoJ2Vycm9yJywgYFNvY2tldC5pbyBjb25uZWN0aW9uIHRvICcke3RoaXMudXJsfScgZmFpbGVkYCk7XG4gICAgICB9XG4gICAgfSwgdGhpcyk7XG5cbiAgICAvKipcbiAgICAgIEFkZCBhbiBhbGlhc2VkIGV2ZW50IGxpc3RlbmVyIGZvciBjbG9zZSAvIGRpc2Nvbm5lY3RcbiAgICAgKi9cbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgKGV2ZW50KSA9PiB7XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoY3JlYXRlQ2xvc2VFdmVudCh7XG4gICAgICAgIHR5cGU6ICdkaXNjb25uZWN0JyxcbiAgICAgICAgdGFyZ2V0OiBldmVudC50YXJnZXQsXG4gICAgICAgIGNvZGU6IGV2ZW50LmNvZGVcbiAgICAgIH0pKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qXG4gICogQ2xvc2VzIHRoZSBTb2NrZXRJTyBjb25uZWN0aW9uIG9yIGNvbm5lY3Rpb24gYXR0ZW1wdCwgaWYgYW55LlxuICAqIElmIHRoZSBjb25uZWN0aW9uIGlzIGFscmVhZHkgQ0xPU0VELCB0aGlzIG1ldGhvZCBkb2VzIG5vdGhpbmcuXG4gICovXG4gIGNsb3NlKCkge1xuICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgIT09IFNvY2tldElPLk9QRU4pIHsgcmV0dXJuIHVuZGVmaW5lZDsgfVxuXG4gICAgY29uc3Qgc2VydmVyID0gbmV0d29ya0JyaWRnZS5zZXJ2ZXJMb29rdXAodGhpcy51cmwpO1xuICAgIG5ldHdvcmtCcmlkZ2UucmVtb3ZlV2ViU29ja2V0KHRoaXMsIHRoaXMudXJsKTtcblxuICAgIHRoaXMucmVhZHlTdGF0ZSA9IFNvY2tldElPLkNMT1NFRDtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoY3JlYXRlQ2xvc2VFdmVudCh7XG4gICAgICB0eXBlOiAnY2xvc2UnLFxuICAgICAgdGFyZ2V0OiB0aGlzLFxuICAgICAgY29kZTogQ0xPU0VfQ09ERVMuQ0xPU0VfTk9STUFMXG4gICAgfSkpO1xuXG4gICAgaWYgKHNlcnZlcikge1xuICAgICAgc2VydmVyLmRpc3BhdGNoRXZlbnQoY3JlYXRlQ2xvc2VFdmVudCh7XG4gICAgICAgIHR5cGU6ICdkaXNjb25uZWN0JyxcbiAgICAgICAgdGFyZ2V0OiB0aGlzLFxuICAgICAgICBjb2RlOiBDTE9TRV9DT0RFUy5DTE9TRV9OT1JNQUxcbiAgICAgIH0pLCBzZXJ2ZXIpO1xuICAgIH1cbiAgfVxuXG4gIC8qXG4gICogQWxpYXMgZm9yIFNvY2tldCNjbG9zZVxuICAqXG4gICogaHR0cHM6Ly9naXRodWIuY29tL3NvY2tldGlvL3NvY2tldC5pby1jbGllbnQvYmxvYi9tYXN0ZXIvbGliL3NvY2tldC5qcyNMMzgzXG4gICovXG4gIGRpc2Nvbm5lY3QoKSB7XG4gICAgdGhpcy5jbG9zZSgpO1xuICB9XG5cbiAgLypcbiAgKiBTdWJtaXRzIGFuIGV2ZW50IHRvIHRoZSBzZXJ2ZXIgd2l0aCBhIHBheWxvYWRcbiAgKi9cbiAgZW1pdChldmVudCwgLi4uZGF0YSkge1xuICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgIT09IFNvY2tldElPLk9QRU4pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignU29ja2V0SU8gaXMgYWxyZWFkeSBpbiBDTE9TSU5HIG9yIENMT1NFRCBzdGF0ZScpO1xuICAgIH1cblxuICAgIGNvbnN0IG1lc3NhZ2VFdmVudCA9IGNyZWF0ZU1lc3NhZ2VFdmVudCh7XG4gICAgICB0eXBlOiBldmVudCxcbiAgICAgIG9yaWdpbjogdGhpcy51cmwsXG4gICAgICBkYXRhXG4gICAgfSk7XG5cbiAgICBjb25zdCBzZXJ2ZXIgPSBuZXR3b3JrQnJpZGdlLnNlcnZlckxvb2t1cCh0aGlzLnVybCk7XG5cbiAgICBpZiAoc2VydmVyKSB7XG4gICAgICBzZXJ2ZXIuZGlzcGF0Y2hFdmVudChtZXNzYWdlRXZlbnQsIC4uLmRhdGEpO1xuICAgIH1cbiAgfVxuXG4gIC8qXG4gICogU3VibWl0cyBhICdtZXNzYWdlJyBldmVudCB0byB0aGUgc2VydmVyLlxuICAqXG4gICogU2hvdWxkIGJlaGF2ZSBleGFjdGx5IGxpa2UgV2ViU29ja2V0I3NlbmRcbiAgKlxuICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9zb2NrZXRpby9zb2NrZXQuaW8tY2xpZW50L2Jsb2IvbWFzdGVyL2xpYi9zb2NrZXQuanMjTDExM1xuICAqL1xuICBzZW5kKGRhdGEpIHtcbiAgICB0aGlzLmVtaXQoJ21lc3NhZ2UnLCBkYXRhKTtcbiAgfVxuXG4gIC8qXG4gICogRm9yIGJyb2FkY2FzdGluZyBldmVudHMgdG8gb3RoZXIgY29ubmVjdGVkIHNvY2tldHMuXG4gICpcbiAgKiBlLmcuIHNvY2tldC5icm9hZGNhc3QuZW1pdCgnaGkhJyk7XG4gICogZS5nLiBzb2NrZXQuYnJvYWRjYXN0LnRvKCdteS1yb29tJykuZW1pdCgnaGkhJyk7XG4gICovXG4gIGdldCBicm9hZGNhc3QoKSB7XG4gICAgaWYgKHRoaXMucmVhZHlTdGF0ZSAhPT0gU29ja2V0SU8uT1BFTikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTb2NrZXRJTyBpcyBhbHJlYWR5IGluIENMT1NJTkcgb3IgQ0xPU0VEIHN0YXRlJyk7XG4gICAgfVxuXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgY29uc3Qgc2VydmVyID0gbmV0d29ya0JyaWRnZS5zZXJ2ZXJMb29rdXAodGhpcy51cmwpO1xuICAgIGlmICghc2VydmVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFNvY2tldElPIGNhbiBub3QgZmluZCBhIHNlcnZlciBhdCB0aGUgc3BlY2lmaWVkIFVSTCAoJHt0aGlzLnVybH0pYCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGVtaXQoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgc2VydmVyLmVtaXQoZXZlbnQsIGRhdGEsIHsgd2Vic29ja2V0czogbmV0d29ya0JyaWRnZS53ZWJzb2NrZXRzTG9va3VwKHNlbGYudXJsLCBudWxsLCBzZWxmKSB9KTtcbiAgICAgIH0sXG4gICAgICB0byhyb29tKSB7XG4gICAgICAgIHJldHVybiBzZXJ2ZXIudG8ocm9vbSwgc2VsZik7XG4gICAgICB9LFxuICAgICAgaW4ocm9vbSkge1xuICAgICAgICByZXR1cm4gc2VydmVyLmluKHJvb20sIHNlbGYpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKlxuICAqIEZvciByZWdpc3RlcmluZyBldmVudHMgdG8gYmUgcmVjZWl2ZWQgZnJvbSB0aGUgc2VydmVyXG4gICovXG4gIG9uKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qXG4gICAqIEpvaW4gYSByb29tIG9uIGEgc2VydmVyXG4gICAqXG4gICAqIGh0dHA6Ly9zb2NrZXQuaW8vZG9jcy9yb29tcy1hbmQtbmFtZXNwYWNlcy8jam9pbmluZy1hbmQtbGVhdmluZ1xuICAgKi9cbiAgam9pbihyb29tKSB7XG4gICAgbmV0d29ya0JyaWRnZS5hZGRNZW1iZXJzaGlwVG9Sb29tKHRoaXMsIHJvb20pO1xuICB9XG5cbiAgLypcbiAgICogR2V0IHRoZSB3ZWJzb2NrZXQgdG8gbGVhdmUgdGhlIHJvb21cbiAgICpcbiAgICogaHR0cDovL3NvY2tldC5pby9kb2NzL3Jvb21zLWFuZC1uYW1lc3BhY2VzLyNqb2luaW5nLWFuZC1sZWF2aW5nXG4gICAqL1xuICBsZWF2ZShyb29tKSB7XG4gICAgbmV0d29ya0JyaWRnZS5yZW1vdmVNZW1iZXJzaGlwRnJvbVJvb20odGhpcywgcm9vbSk7XG4gIH1cblxuICAvKlxuICAgKiBJbnZva2VzIGFsbCBsaXN0ZW5lciBmdW5jdGlvbnMgdGhhdCBhcmUgbGlzdGVuaW5nIHRvIHRoZSBnaXZlbiBldmVudC50eXBlIHByb3BlcnR5LiBFYWNoXG4gICAqIGxpc3RlbmVyIHdpbGwgYmUgcGFzc2VkIHRoZSBldmVudCBhcyB0aGUgZmlyc3QgYXJndW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBldmVudCAtIGV2ZW50IG9iamVjdCB3aGljaCB3aWxsIGJlIHBhc3NlZCB0byBhbGwgbGlzdGVuZXJzIG9mIHRoZSBldmVudC50eXBlIHByb3BlcnR5XG4gICAqL1xuICBkaXNwYXRjaEV2ZW50KGV2ZW50LCAuLi5jdXN0b21Bcmd1bWVudHMpIHtcbiAgICBjb25zdCBldmVudE5hbWUgPSBldmVudC50eXBlO1xuICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzW2V2ZW50TmFtZV07XG5cbiAgICBpZiAoIUFycmF5LmlzQXJyYXkobGlzdGVuZXJzKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgaWYgKGN1c3RvbUFyZ3VtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGN1c3RvbUFyZ3VtZW50cyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBSZWd1bGFyIFdlYlNvY2tldHMgZXhwZWN0IGEgTWVzc2FnZUV2ZW50IGJ1dCBTb2NrZXRpby5pbyBqdXN0IHdhbnRzIHJhdyBkYXRhXG4gICAgICAgIC8vICBwYXlsb2FkIGluc3RhbmNlb2YgTWVzc2FnZUV2ZW50IHdvcmtzLCBidXQgeW91IGNhbid0IGlzbnRhbmNlIG9mIE5vZGVFdmVudFxuICAgICAgICAvLyAgZm9yIG5vdyB3ZSBkZXRlY3QgaWYgdGhlIG91dHB1dCBoYXMgZGF0YSBkZWZpbmVkIG9uIGl0XG4gICAgICAgIGxpc3RlbmVyLmNhbGwodGhpcywgZXZlbnQuZGF0YSA/IGV2ZW50LmRhdGEgOiBldmVudCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuU29ja2V0SU8uQ09OTkVDVElORyA9IDA7XG5Tb2NrZXRJTy5PUEVOID0gMTtcblNvY2tldElPLkNMT1NJTkcgPSAyO1xuU29ja2V0SU8uQ0xPU0VEID0gMztcblxuLypcbiogU3RhdGljIGNvbnN0cnVjdG9yIG1ldGhvZHMgZm9yIHRoZSBJTyBTb2NrZXRcbiovXG5jb25zdCBJTyA9IGZ1bmN0aW9uIGlvQ29uc3RydWN0b3IodXJsKSB7XG4gIHJldHVybiBuZXcgU29ja2V0SU8odXJsKTtcbn07XG5cbi8qXG4qIEFsaWFzIHRoZSByYXcgSU8oKSBjb25zdHJ1Y3RvclxuKi9cbklPLmNvbm5lY3QgPSBmdW5jdGlvbiBpb0Nvbm5lY3QodXJsKSB7XG4gIC8qIGVzbGludC1kaXNhYmxlIG5ldy1jYXAgKi9cbiAgcmV0dXJuIElPKHVybCk7XG4gIC8qIGVzbGludC1lbmFibGUgbmV3LWNhcCAqL1xufTtcblxuZXhwb3J0IGRlZmF1bHQgSU87XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvc29ja2V0LWlvLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==