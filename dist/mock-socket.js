(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _globalContext = require('./global-context');

var _globalContext2 = _interopRequireDefault(_globalContext);

/*
* This delay allows the thread to finish assigning its on* methods
* before invoking the delay callback. This is purely a timing hack.
* http://geekabyte.blogspot.com/2014/01/javascript-effect-of-setting-settimeout.html
*
* @param {callback: function} the callback which will be invoked after the timeout
* @parma {context: object} the context in which to invoke the function
*/
function delay(callback, context) {
  _globalContext2['default'].setTimeout(function (context) {
    callback.call(context);
  }, 4, context);
}

exports['default'] = delay;
module.exports = exports['default'];
},{"./global-context":2}],2:[function(require,module,exports){
(function (global){
/*
* Determines the global context. This should be either window (in the)
* case where we are in a browser) or global (in the case where we are in
* node)
*/
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var globalContext;

if (typeof window === 'undefined') {
    globalContext = global;
} else {
    globalContext = window;
}

if (!globalContext) {
    throw new Error('Unable to set the global context to either window or global.');
}

exports['default'] = globalContext;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],3:[function(require,module,exports){
/*
* This is a mock websocket event message that is passed into the onopen,
* opmessage, etc functions.
*
* @param {name: string} The name of the event
* @param {data: *} The data to send.
* @param {origin: string} The url of the place where the event is originating.
*/
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
function socketEventMessage(name, data, origin) {
	var ports = null;
	var source = null;
	var bubbles = false;
	var cancelable = false;
	var lastEventId = '';
	var targetPlacehold = null;
	var messageEvent;

	try {
		messageEvent = new MessageEvent(name);
		messageEvent.initMessageEvent(name, bubbles, cancelable, data, origin, lastEventId);

		Object.defineProperties(messageEvent, {
			target: {
				get: function get() {
					return targetPlacehold;
				},
				set: function set(value) {
					targetPlacehold = value;
				}
			},
			srcElement: {
				get: function get() {
					return this.target;
				}
			},
			currentTarget: {
				get: function get() {
					return this.target;
				}
			}
		});
	} catch (e) {
		// We are unable to create a MessageEvent Object. This should only be happening in PhantomJS.
		messageEvent = {
			type: name,
			bubbles: bubbles,
			cancelable: cancelable,
			data: data,
			origin: origin,
			lastEventId: lastEventId,
			source: source,
			ports: ports,
			defaultPrevented: false,
			returnValue: true,
			clipboardData: undefined
		};

		Object.defineProperties(messageEvent, {
			target: {
				get: function get() {
					return targetPlacehold;
				},
				set: function set(value) {
					targetPlacehold = value;
				}
			},
			srcElement: {
				get: function get() {
					return this.target;
				}
			},
			currentTarget: {
				get: function get() {
					return this.target;
				}
			}
		});
	}

	return messageEvent;
}

exports['default'] = socketEventMessage;
module.exports = exports['default'];
},{}],4:[function(require,module,exports){
/*
* The native websocket object will transform urls without a pathname to have just a /.
* As an example: ws://localhost:8080 would actually be ws://localhost:8080/ but ws://example.com/foo would not
* change. This function does this transformation to stay inline with the native websocket implementation.
*
* @param {url: string} The url to transform.
*/
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
function urlTransform(url) {
  var urlPath = urlParse('path', url);
  var urlQuery = urlParse('?', url);

  urlQuery = urlQuery ? '?' + urlQuery : '';

  if (urlPath === '') {
    return url.split('?')[0] + '/' + urlQuery;
  }

  return url;
}

/*
* The following functions (isNumeric & urlParse) was taken from
* https://github.com/websanova/js-url/blob/764ed8d94012a79bfa91026f2a62fe3383a5a49e/url.js
* which is shared via the MIT license with minimal modifications.
*/
function isNumeric(arg) {
  return !isNaN(parseFloat(arg)) && isFinite(arg);
}

function urlParse(arg, url) {
  var _ls = url || window.location.toString();

  if (!arg) {
    return _ls;
  } else {
    arg = arg.toString();
  }

  if (_ls.substring(0, 2) === '//') {
    _ls = 'http:' + _ls;
  } else if (_ls.split('://').length === 1) {
    _ls = 'http://' + _ls;
  }

  url = _ls.split('/');
  var _l = { auth: '' },
      host = url[2].split('@');

  if (host.length === 1) {
    host = host[0].split(':');
  } else {
    _l.auth = host[0];host = host[1].split(':');
  }

  _l.protocol = url[0];
  _l.hostname = host[0];
  _l.port = host[1] || (_l.protocol.split(':')[0].toLowerCase() === 'https' ? '443' : '80');
  _l.pathname = (url.length > 3 ? '/' : '') + url.slice(3, url.length).join('/').split('?')[0].split('#')[0];
  var _p = _l.pathname;

  if (_p.charAt(_p.length - 1) === '/') {
    _p = _p.substring(0, _p.length - 1);
  }
  var _h = _l.hostname,
      _hs = _h.split('.'),
      _ps = _p.split('/');

  if (arg === 'hostname') {
    return _h;
  } else if (arg === 'domain') {
    if (/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(_h)) {
      return _h;
    }
    return _hs.slice(-2).join('.');
  }
  //else if (arg === 'tld') { return _hs.slice(-1).join('.'); }
  else if (arg === 'sub') {
    return _hs.slice(0, _hs.length - 2).join('.');
  } else if (arg === 'port') {
    return _l.port;
  } else if (arg === 'protocol') {
    return _l.protocol.split(':')[0];
  } else if (arg === 'auth') {
    return _l.auth;
  } else if (arg === 'user') {
    return _l.auth.split(':')[0];
  } else if (arg === 'pass') {
    return _l.auth.split(':')[1] || '';
  } else if (arg === 'path') {
    return _l.pathname;
  } else if (arg.charAt(0) === '.') {
    arg = arg.substring(1);
    if (isNumeric(arg)) {
      arg = parseInt(arg, 10);return _hs[arg < 0 ? _hs.length + arg : arg - 1] || '';
    }
  } else if (isNumeric(arg)) {
    arg = parseInt(arg, 10);return _ps[arg < 0 ? _ps.length + arg : arg] || '';
  } else if (arg === 'file') {
    return _ps.slice(-1)[0];
  } else if (arg === 'filename') {
    return _ps.slice(-1)[0].split('.')[0];
  } else if (arg === 'fileext') {
    return _ps.slice(-1)[0].split('.')[1] || '';
  } else if (arg.charAt(0) === '?' || arg.charAt(0) === '#') {
    var params = _ls,
        param = null;

    if (arg.charAt(0) === '?') {
      params = (params.split('?')[1] || '').split('#')[0];
    } else if (arg.charAt(0) === '#') {
      params = params.split('#')[1] || '';
    }

    if (!arg.charAt(1)) {
      return params;
    }

    arg = arg.substring(1);
    params = params.split('&');

    for (var i = 0, ii = params.length; i < ii; i++) {
      param = params[i].split('=');
      if (param[0] === arg) {
        return param[1] || '';
      }
    }

    return null;
  }

  return '';
}

exports['default'] = urlTransform;
module.exports = exports['default'];
},{}],5:[function(require,module,exports){
/*
* This defines four methods: onopen, onmessage, onerror, and onclose. This is done this way instead of
* just placing the methods on the prototype because we need to capture the callback when it is defined like so:
*
* mockSocket.onopen = function() { // this is what we need to store };
*
* The only way is to capture the callback via the custom setter below and then place them into the correct
* namespace so they get invoked at the right time.
*
* @param {websocket: object} The websocket object which we want to define these properties onto
*/
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
function webSocketProperties(websocket) {
  var eventMessageSource = function eventMessageSource(callback) {
    return function (event) {
      event.target = websocket;
      callback.apply(websocket, arguments);
    };
  };

  Object.defineProperties(websocket, {
    onopen: {
      configurable: true,
      enumerable: true,
      get: function get() {
        return this._onopen;
      },
      set: function set(callback) {
        this._onopen = eventMessageSource(callback);
        this.service.setCallbackObserver('clientOnOpen', this._onopen, websocket);
      }
    },
    onmessage: {
      configurable: true,
      enumerable: true,
      get: function get() {
        return this._onmessage;
      },
      set: function set(callback) {
        this._onmessage = eventMessageSource(callback);
        this.service.setCallbackObserver('clientOnMessage', this._onmessage, websocket);
      }
    },
    onclose: {
      configurable: true,
      enumerable: true,
      get: function get() {
        return this._onclose;
      },
      set: function set(callback) {
        this._onclose = eventMessageSource(callback);
        this.service.setCallbackObserver('clientOnclose', this._onclose, websocket);
      }
    },
    onerror: {
      configurable: true,
      enumerable: true,
      get: function get() {
        return this._onerror;
      },
      set: function set(callback) {
        this._onerror = eventMessageSource(callback);
        this.service.setCallbackObserver('clientOnError', this._onerror, websocket);
      }
    }
  });
}

exports['default'] = webSocketProperties;
module.exports = exports['default'];
},{}],6:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _service = require('./service');

var _service2 = _interopRequireDefault(_service);

var _mockServer = require('./mock-server');

var _mockServer2 = _interopRequireDefault(_mockServer);

var _mockSocket = require('./mock-socket');

var _mockSocket2 = _interopRequireDefault(_mockSocket);

var _helpersGlobalContext = require('./helpers/global-context');

var _helpersGlobalContext2 = _interopRequireDefault(_helpersGlobalContext);

_helpersGlobalContext2['default'].SocketService = _service2['default'];
_helpersGlobalContext2['default'].MockSocket = _mockSocket2['default'];
_helpersGlobalContext2['default'].MockServer = _mockServer2['default'];
},{"./helpers/global-context":2,"./mock-server":7,"./mock-socket":8,"./service":9}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _service = require('./service');

var _service2 = _interopRequireDefault(_service);

var _helpersDelay = require('./helpers/delay');

var _helpersDelay2 = _interopRequireDefault(_helpersDelay);

var _helpersUrlTransform = require('./helpers/url-transform');

var _helpersUrlTransform2 = _interopRequireDefault(_helpersUrlTransform);

var _helpersMessageEvent = require('./helpers/message-event');

var _helpersMessageEvent2 = _interopRequireDefault(_helpersMessageEvent);

var _helpersGlobalContext = require('./helpers/global-context');

var _helpersGlobalContext2 = _interopRequireDefault(_helpersGlobalContext);

function MockServer(url) {
  var service = new _service2['default']();
  this.url = (0, _helpersUrlTransform2['default'])(url);

  _helpersGlobalContext2['default'].MockSocket.services[this.url] = service;

  this.service = service;
  // ignore possible query parameters
  if (url.indexOf(MockServer.unresolvableURL) === -1) {
    service.server = this;
  }
}

/*
* This URL can be used to emulate server that does not establish connection
*/
MockServer.unresolvableURL = 'ws://unresolvable_url';

MockServer.prototype = {
  service: null,

  /*
  * This is the main function for the mock server to subscribe to the on events.
  *
  * ie: mockServer.on('connection', function() { console.log('a mock client connected'); });
  *
  * @param {type: string}: The event key to subscribe to. Valid keys are: connection, message, and close.
  * @param {callback: function}: The callback which should be called when a certain event is fired.
  */
  on: function on(type, callback) {
    var observerKey;

    if (typeof callback !== 'function' || typeof type !== 'string') {
      return false;
    }

    switch (type) {
      case 'connection':
        observerKey = 'clientHasJoined';
        break;
      case 'message':
        observerKey = 'clientHasSentMessage';
        break;
      case 'close':
        observerKey = 'clientHasLeft';
        break;
    }

    // Make sure that the observerKey is valid before observing on it.
    if (typeof observerKey === 'string') {
      this.service.clearAll(observerKey);
      this.service.setCallbackObserver(observerKey, callback, this);
    }
  },

  /*
  * This send function will notify all mock clients via their onmessage callbacks that the server
  * has a message for them.
  *
  * @param {data: *}: Any javascript object which will be crafted into a MessageObject.
  */
  send: function send(data) {
    (0, _helpersDelay2['default'])(function () {
      this.service.sendMessageToClients((0, _helpersMessageEvent2['default'])('message', data, this.url));
    }, this);
  },

  /*
  * Notifies all mock clients that the server is closing and their onclose callbacks should fire.
  */
  close: function close() {
    (0, _helpersDelay2['default'])(function () {
      this.service.closeConnectionFromServer((0, _helpersMessageEvent2['default'])('close', null, this.url));
    }, this);
  }
};

exports['default'] = MockServer;
module.exports = exports['default'];
},{"./helpers/delay":1,"./helpers/global-context":2,"./helpers/message-event":3,"./helpers/url-transform":4,"./service":9}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helpersDelay = require('./helpers/delay');

var _helpersDelay2 = _interopRequireDefault(_helpersDelay);

var _helpersUrlTransform = require('./helpers/url-transform');

var _helpersUrlTransform2 = _interopRequireDefault(_helpersUrlTransform);

var _helpersMessageEvent = require('./helpers/message-event');

var _helpersMessageEvent2 = _interopRequireDefault(_helpersMessageEvent);

var _helpersGlobalContext = require('./helpers/global-context');

var _helpersGlobalContext2 = _interopRequireDefault(_helpersGlobalContext);

var _helpersWebsocketProperties = require('./helpers/websocket-properties');

var _helpersWebsocketProperties2 = _interopRequireDefault(_helpersWebsocketProperties);

function MockSocket(url) {
  this.binaryType = 'blob';
  this.url = (0, _helpersUrlTransform2['default'])(url);
  this.readyState = _helpersGlobalContext2['default'].MockSocket.CONNECTING;
  this.service = _helpersGlobalContext2['default'].MockSocket.services[this.url];

  this._eventHandlers = {};

  (0, _helpersWebsocketProperties2['default'])(this);

  (0, _helpersDelay2['default'])(function () {
    // Let the service know that we are both ready to change our ready state and that
    // this client is connecting to the mock server.
    this.service.clientIsConnecting(this, this._updateReadyState);
  }, this);
}

MockSocket.CONNECTING = 0;
MockSocket.OPEN = 1;
MockSocket.CLOSING = 2;
MockSocket.CLOSED = 3;
MockSocket.services = {};

MockSocket.prototype = {

  /*
  * Holds the on*** callback functions. These are really just for the custom
  * getters that are defined in the helpers/websocket-properties. Accessing these properties is not advised.
  */
  _onopen: null,
  _onmessage: null,
  _onerror: null,
  _onclose: null,

  /*
  * This holds reference to the service object. The service object is how we can
  * communicate with the backend via the pub/sub model.
  *
  * The service has properties which we can use to observe or notifiy with.
  * this.service.notify('foo') & this.service.observe('foo', callback, context)
  */
  service: null,

  /*
  * Internal storage for event handlers. Basically, there could be more than one
  * handler per event so we store them all in array.
  */
  _eventHandlers: {},

  /*
  * This is a mock for EventTarget's addEventListener method. A bit naive and
  * doesn't implement third useCapture parameter but should be enough for most
  * (if not all) cases.
  *
  * @param {event: string}: Event name.
  * @param {handler: function}: Any callback function for event handling.
  */
  addEventListener: function addEventListener(event, handler) {
    if (!this._eventHandlers[event]) {
      this._eventHandlers[event] = [];
      var self = this;
      this['on' + event] = function (eventObject) {
        self.dispatchEvent(eventObject);
      };
    }
    this._eventHandlers[event].push(handler);
  },

  /*
  * This is a mock for EventTarget's removeEventListener method. A bit naive and
  * doesn't implement third useCapture parameter but should be enough for most
  * (if not all) cases.
  *
  * @param {event: string}: Event name.
  * @param {handler: function}: Any callback function for event handling. Should
  * be one of the functions used in the previous calls of addEventListener method.
  */
  removeEventListener: function removeEventListener(event, handler) {
    if (!this._eventHandlers[event]) {
      return;
    }
    var handlers = this._eventHandlers[event];
    handlers.splice(handlers.indexOf(handler), 1);
    if (!handlers.length) {
      delete this._eventHandlers[event];
      delete this['on' + event];
    }
  },

  /*
  * This is a mock for EventTarget's dispatchEvent method.
  *
  * @param {event: MessageEvent}: Some event, either native MessageEvent or an object
  * returned by require('./helpers/message-event')
  */
  dispatchEvent: function dispatchEvent(event) {
    var handlers = this._eventHandlers[event.type];
    if (!handlers) {
      return;
    }
    for (var i = 0; i < handlers.length; i++) {
      handlers[i].call(this, event);
    }
  },

  /*
  * This is a mock for the native send function found on the WebSocket object. It notifies the
  * service that it has sent a message.
  *
  * @param {data: *}: Any javascript object which will be crafted into a MessageObject.
  */
  send: function send(data) {
    (0, _helpersDelay2['default'])(function () {
      this.service.sendMessageToServer((0, _helpersMessageEvent2['default'])('message', data, this.url));
    }, this);
  },

  /*
  * This is a mock for the native close function found on the WebSocket object. It notifies the
  * service that it is closing the connection.
  */
  close: function close() {
    (0, _helpersDelay2['default'])(function () {
      this.service.closeConnectionFromClient((0, _helpersMessageEvent2['default'])('close', null, this.url), this);
    }, this);
  },

  /*
  * This is a private method that can be used to change the readyState. This is used
  * like this: this.protocol.subject.observe('updateReadyState', this._updateReadyState, this);
  * so that the service and the server can change the readyState simply be notifing a namespace.
  *
  * @param {newReadyState: number}: The new ready state. Must be 0-4
  */
  _updateReadyState: function _updateReadyState(newReadyState) {
    if (newReadyState >= 0 && newReadyState <= 4) {
      this.readyState = newReadyState;
    }
  }
};

exports['default'] = MockSocket;
module.exports = exports['default'];
},{"./helpers/delay":1,"./helpers/global-context":2,"./helpers/message-event":3,"./helpers/url-transform":4,"./helpers/websocket-properties":5}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helpersMessageEvent = require('./helpers/message-event');

var _helpersMessageEvent2 = _interopRequireDefault(_helpersMessageEvent);

var _helpersGlobalContext = require('./helpers/global-context');

var _helpersGlobalContext2 = _interopRequireDefault(_helpersGlobalContext);

function SocketService() {
  this.list = {};
}

SocketService.prototype = {
  server: null,

  /*
  * This notifies the mock server that a client is connecting and also sets up
  * the ready state observer.
  *
  * @param {client: object} the context of the client
  * @param {readyStateFunction: function} the function that will be invoked on a ready state change
  */
  clientIsConnecting: function clientIsConnecting(client, readyStateFunction) {
    this.observe('updateReadyState', readyStateFunction, client);

    // if the server has not been set then we notify the onclose method of this client
    if (!this.server) {
      this.notifyOnlyFor(client, 'updateReadyState', _helpersGlobalContext2['default'].MockSocket.CLOSED);
      this.notifyOnlyFor(client, 'clientOnError', (0, _helpersMessageEvent2['default'])('error', null, client.url));
      return false;
    }

    this.notifyOnlyFor(client, 'updateReadyState', _helpersGlobalContext2['default'].MockSocket.OPEN);
    this.notify('clientHasJoined', this.server);
    this.notifyOnlyFor(client, 'clientOnOpen', (0, _helpersMessageEvent2['default'])('open', null, this.server.url));
  },

  /*
  * Closes a connection from the server's perspective. This should
  * close all clients.
  *
  * @param {messageEvent: object} the mock message event.
  */
  closeConnectionFromServer: function closeConnectionFromServer(messageEvent) {
    this.notify('updateReadyState', _helpersGlobalContext2['default'].MockSocket.CLOSING);
    this.notify('clientOnclose', messageEvent);
    this.notify('updateReadyState', _helpersGlobalContext2['default'].MockSocket.CLOSED);
    this.notify('clientHasLeft');
  },

  /*
  * Closes a connection from the clients perspective. This
  * should only close the client who initiated the close and not
  * all of the other clients.
  *
  * @param {messageEvent: object} the mock message event.
  * @param {client: object} the context of the client
  */
  closeConnectionFromClient: function closeConnectionFromClient(messageEvent, client) {
    if (client.readyState === _helpersGlobalContext2['default'].MockSocket.OPEN) {
      this.notifyOnlyFor(client, 'updateReadyState', _helpersGlobalContext2['default'].MockSocket.CLOSING);
      this.notifyOnlyFor(client, 'clientOnclose', messageEvent);
      this.notifyOnlyFor(client, 'updateReadyState', _helpersGlobalContext2['default'].MockSocket.CLOSED);
      this.notify('clientHasLeft');
    }
  },

  /*
  * Notifies the mock server that a client has sent a message.
  *
  * @param {messageEvent: object} the mock message event.
  */
  sendMessageToServer: function sendMessageToServer(messageEvent) {
    this.notify('clientHasSentMessage', messageEvent.data, messageEvent);
  },

  /*
  * Notifies all clients that the server has sent a message
  *
  * @param {messageEvent: object} the mock message event.
  */
  sendMessageToClients: function sendMessageToClients(messageEvent) {
    this.notify('clientOnMessage', messageEvent);
  },

  /*
  * Setup the callback function observers for both the server and client.
  *
  * @param {observerKey: string} either: connection, message or close
  * @param {callback: function} the callback to be invoked
  * @param {server: object} the context of the server
  */
  setCallbackObserver: function setCallbackObserver(observerKey, callback, server) {
    this.observe(observerKey, callback, server);
  },

  /*
  * Binds a callback to a namespace. If notify is called on a namespace all "observers" will be
  * fired with the context that is passed in.
  *
  * @param {namespace: string}
  * @param {callback: function}
  * @param {context: object}
  */
  observe: function observe(namespace, callback, context) {

    // Make sure the arguments are of the correct type
    if (typeof namespace !== 'string' || typeof callback !== 'function' || context && typeof context !== 'object') {
      return false;
    }

    // If a namespace has not been created before then we need to "initialize" the namespace
    if (!this.list[namespace]) {
      this.list[namespace] = [];
    }

    this.list[namespace].push({ callback: callback, context: context });
  },

  /*
  * Remove all observers from a given namespace.
  *
  * @param {namespace: string} The namespace to clear.
  */
  clearAll: function clearAll(namespace) {

    if (!this.verifyNamespaceArg(namespace)) {
      return false;
    }

    this.list[namespace] = [];
  },

  /*
  * Notify all callbacks that have been bound to the given namespace.
  *
  * @param {namespace: string} The namespace to notify observers on.
  * @param {namespace: url} The url to notify observers on.
  */
  notify: function notify(namespace) {

    // This strips the namespace from the list of args as we dont want to pass that into the callback.
    var argumentsForCallback = Array.prototype.slice.call(arguments, 1);

    if (!this.verifyNamespaceArg(namespace)) {
      return false;
    }

    // Loop over all of the observers and fire the callback function with the context.
    for (var i = 0, len = this.list[namespace].length; i < len; i++) {
      this.list[namespace][i].callback.apply(this.list[namespace][i].context, argumentsForCallback);
    }
  },

  /*
  * Notify only the callback of the given context and namespace.
  *
  * @param {context: object} the context to match against.
  * @param {namespace: string} The namespace to notify observers on.
  */
  notifyOnlyFor: function notifyOnlyFor(context, namespace) {

    // This strips the namespace from the list of args as we dont want to pass that into the callback.
    var argumentsForCallback = Array.prototype.slice.call(arguments, 2);

    if (!this.verifyNamespaceArg(namespace)) {
      return false;
    }

    // Loop over all of the observers and fire the callback function with the context.
    for (var i = 0, len = this.list[namespace].length; i < len; i++) {
      if (this.list[namespace][i].context === context) {
        this.list[namespace][i].callback.apply(this.list[namespace][i].context, argumentsForCallback);
      }
    }
  },

  /*
  * Verifies that the namespace is valid.
  *
  * @param {namespace: string} The namespace to verify.
  */
  verifyNamespaceArg: function verifyNamespaceArg(namespace) {
    if (typeof namespace !== 'string' || !this.list[namespace]) {
      return false;
    }

    return true;
  }
};

exports['default'] = SocketService;
module.exports = exports['default'];
},{"./helpers/global-context":2,"./helpers/message-event":3}]},{},[6])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm9jY29saS1mYXN0LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImhlbHBlcnMvZGVsYXkuanMiLCJoZWxwZXJzL2dsb2JhbC1jb250ZXh0LmpzIiwiaGVscGVycy9tZXNzYWdlLWV2ZW50LmpzIiwiaGVscGVycy91cmwtdHJhbnNmb3JtLmpzIiwiaGVscGVycy93ZWJzb2NrZXQtcHJvcGVydGllcy5qcyIsIm1haW4uanMiLCJtb2NrLXNlcnZlci5qcyIsIm1vY2stc29ja2V0LmpzIiwic2VydmljZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9nbG9iYWxDb250ZXh0ID0gcmVxdWlyZSgnLi9nbG9iYWwtY29udGV4dCcpO1xuXG52YXIgX2dsb2JhbENvbnRleHQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZ2xvYmFsQ29udGV4dCk7XG5cbi8qXG4qIFRoaXMgZGVsYXkgYWxsb3dzIHRoZSB0aHJlYWQgdG8gZmluaXNoIGFzc2lnbmluZyBpdHMgb24qIG1ldGhvZHNcbiogYmVmb3JlIGludm9raW5nIHRoZSBkZWxheSBjYWxsYmFjay4gVGhpcyBpcyBwdXJlbHkgYSB0aW1pbmcgaGFjay5cbiogaHR0cDovL2dlZWthYnl0ZS5ibG9nc3BvdC5jb20vMjAxNC8wMS9qYXZhc2NyaXB0LWVmZmVjdC1vZi1zZXR0aW5nLXNldHRpbWVvdXQuaHRtbFxuKlxuKiBAcGFyYW0ge2NhbGxiYWNrOiBmdW5jdGlvbn0gdGhlIGNhbGxiYWNrIHdoaWNoIHdpbGwgYmUgaW52b2tlZCBhZnRlciB0aGUgdGltZW91dFxuKiBAcGFybWEge2NvbnRleHQ6IG9iamVjdH0gdGhlIGNvbnRleHQgaW4gd2hpY2ggdG8gaW52b2tlIHRoZSBmdW5jdGlvblxuKi9cbmZ1bmN0aW9uIGRlbGF5KGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gIF9nbG9iYWxDb250ZXh0MlsnZGVmYXVsdCddLnNldFRpbWVvdXQoZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICBjYWxsYmFjay5jYWxsKGNvbnRleHQpO1xuICB9LCA0LCBjb250ZXh0KTtcbn1cblxuZXhwb3J0c1snZGVmYXVsdCddID0gZGVsYXk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIvKlxuKiBEZXRlcm1pbmVzIHRoZSBnbG9iYWwgY29udGV4dC4gVGhpcyBzaG91bGQgYmUgZWl0aGVyIHdpbmRvdyAoaW4gdGhlKVxuKiBjYXNlIHdoZXJlIHdlIGFyZSBpbiBhIGJyb3dzZXIpIG9yIGdsb2JhbCAoaW4gdGhlIGNhc2Ugd2hlcmUgd2UgYXJlIGluXG4qIG5vZGUpXG4qL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xudmFyIGdsb2JhbENvbnRleHQ7XG5cbmlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgIGdsb2JhbENvbnRleHQgPSBnbG9iYWw7XG59IGVsc2Uge1xuICAgIGdsb2JhbENvbnRleHQgPSB3aW5kb3c7XG59XG5cbmlmICghZ2xvYmFsQ29udGV4dCkge1xuICAgIHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIHNldCB0aGUgZ2xvYmFsIGNvbnRleHQgdG8gZWl0aGVyIHdpbmRvdyBvciBnbG9iYWwuJyk7XG59XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGdsb2JhbENvbnRleHQ7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIvKlxuKiBUaGlzIGlzIGEgbW9jayB3ZWJzb2NrZXQgZXZlbnQgbWVzc2FnZSB0aGF0IGlzIHBhc3NlZCBpbnRvIHRoZSBvbm9wZW4sXG4qIG9wbWVzc2FnZSwgZXRjIGZ1bmN0aW9ucy5cbipcbiogQHBhcmFtIHtuYW1lOiBzdHJpbmd9IFRoZSBuYW1lIG9mIHRoZSBldmVudFxuKiBAcGFyYW0ge2RhdGE6ICp9IFRoZSBkYXRhIHRvIHNlbmQuXG4qIEBwYXJhbSB7b3JpZ2luOiBzdHJpbmd9IFRoZSB1cmwgb2YgdGhlIHBsYWNlIHdoZXJlIHRoZSBldmVudCBpcyBvcmlnaW5hdGluZy5cbiovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcblx0dmFsdWU6IHRydWVcbn0pO1xuZnVuY3Rpb24gc29ja2V0RXZlbnRNZXNzYWdlKG5hbWUsIGRhdGEsIG9yaWdpbikge1xuXHR2YXIgcG9ydHMgPSBudWxsO1xuXHR2YXIgc291cmNlID0gbnVsbDtcblx0dmFyIGJ1YmJsZXMgPSBmYWxzZTtcblx0dmFyIGNhbmNlbGFibGUgPSBmYWxzZTtcblx0dmFyIGxhc3RFdmVudElkID0gJyc7XG5cdHZhciB0YXJnZXRQbGFjZWhvbGQgPSBudWxsO1xuXHR2YXIgbWVzc2FnZUV2ZW50O1xuXG5cdHRyeSB7XG5cdFx0bWVzc2FnZUV2ZW50ID0gbmV3IE1lc3NhZ2VFdmVudChuYW1lKTtcblx0XHRtZXNzYWdlRXZlbnQuaW5pdE1lc3NhZ2VFdmVudChuYW1lLCBidWJibGVzLCBjYW5jZWxhYmxlLCBkYXRhLCBvcmlnaW4sIGxhc3RFdmVudElkKTtcblxuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKG1lc3NhZ2VFdmVudCwge1xuXHRcdFx0dGFyZ2V0OiB7XG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xuXHRcdFx0XHRcdHJldHVybiB0YXJnZXRQbGFjZWhvbGQ7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHNldDogZnVuY3Rpb24gc2V0KHZhbHVlKSB7XG5cdFx0XHRcdFx0dGFyZ2V0UGxhY2Vob2xkID0gdmFsdWU7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRzcmNFbGVtZW50OiB7XG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLnRhcmdldDtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGN1cnJlbnRUYXJnZXQ6IHtcblx0XHRcdFx0Z2V0OiBmdW5jdGlvbiBnZXQoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMudGFyZ2V0O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHQvLyBXZSBhcmUgdW5hYmxlIHRvIGNyZWF0ZSBhIE1lc3NhZ2VFdmVudCBPYmplY3QuIFRoaXMgc2hvdWxkIG9ubHkgYmUgaGFwcGVuaW5nIGluIFBoYW50b21KUy5cblx0XHRtZXNzYWdlRXZlbnQgPSB7XG5cdFx0XHR0eXBlOiBuYW1lLFxuXHRcdFx0YnViYmxlczogYnViYmxlcyxcblx0XHRcdGNhbmNlbGFibGU6IGNhbmNlbGFibGUsXG5cdFx0XHRkYXRhOiBkYXRhLFxuXHRcdFx0b3JpZ2luOiBvcmlnaW4sXG5cdFx0XHRsYXN0RXZlbnRJZDogbGFzdEV2ZW50SWQsXG5cdFx0XHRzb3VyY2U6IHNvdXJjZSxcblx0XHRcdHBvcnRzOiBwb3J0cyxcblx0XHRcdGRlZmF1bHRQcmV2ZW50ZWQ6IGZhbHNlLFxuXHRcdFx0cmV0dXJuVmFsdWU6IHRydWUsXG5cdFx0XHRjbGlwYm9hcmREYXRhOiB1bmRlZmluZWRcblx0XHR9O1xuXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnRpZXMobWVzc2FnZUV2ZW50LCB7XG5cdFx0XHR0YXJnZXQ6IHtcblx0XHRcdFx0Z2V0OiBmdW5jdGlvbiBnZXQoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRhcmdldFBsYWNlaG9sZDtcblx0XHRcdFx0fSxcblx0XHRcdFx0c2V0OiBmdW5jdGlvbiBzZXQodmFsdWUpIHtcblx0XHRcdFx0XHR0YXJnZXRQbGFjZWhvbGQgPSB2YWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdHNyY0VsZW1lbnQ6IHtcblx0XHRcdFx0Z2V0OiBmdW5jdGlvbiBnZXQoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMudGFyZ2V0O1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0Y3VycmVudFRhcmdldDoge1xuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy50YXJnZXQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHJldHVybiBtZXNzYWdlRXZlbnQ7XG59XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IHNvY2tldEV2ZW50TWVzc2FnZTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIi8qXG4qIFRoZSBuYXRpdmUgd2Vic29ja2V0IG9iamVjdCB3aWxsIHRyYW5zZm9ybSB1cmxzIHdpdGhvdXQgYSBwYXRobmFtZSB0byBoYXZlIGp1c3QgYSAvLlxuKiBBcyBhbiBleGFtcGxlOiB3czovL2xvY2FsaG9zdDo4MDgwIHdvdWxkIGFjdHVhbGx5IGJlIHdzOi8vbG9jYWxob3N0OjgwODAvIGJ1dCB3czovL2V4YW1wbGUuY29tL2ZvbyB3b3VsZCBub3RcbiogY2hhbmdlLiBUaGlzIGZ1bmN0aW9uIGRvZXMgdGhpcyB0cmFuc2Zvcm1hdGlvbiB0byBzdGF5IGlubGluZSB3aXRoIHRoZSBuYXRpdmUgd2Vic29ja2V0IGltcGxlbWVudGF0aW9uLlxuKlxuKiBAcGFyYW0ge3VybDogc3RyaW5nfSBUaGUgdXJsIHRvIHRyYW5zZm9ybS5cbiovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZnVuY3Rpb24gdXJsVHJhbnNmb3JtKHVybCkge1xuICB2YXIgdXJsUGF0aCA9IHVybFBhcnNlKCdwYXRoJywgdXJsKTtcbiAgdmFyIHVybFF1ZXJ5ID0gdXJsUGFyc2UoJz8nLCB1cmwpO1xuXG4gIHVybFF1ZXJ5ID0gdXJsUXVlcnkgPyAnPycgKyB1cmxRdWVyeSA6ICcnO1xuXG4gIGlmICh1cmxQYXRoID09PSAnJykge1xuICAgIHJldHVybiB1cmwuc3BsaXQoJz8nKVswXSArICcvJyArIHVybFF1ZXJ5O1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn1cblxuLypcbiogVGhlIGZvbGxvd2luZyBmdW5jdGlvbnMgKGlzTnVtZXJpYyAmIHVybFBhcnNlKSB3YXMgdGFrZW4gZnJvbVxuKiBodHRwczovL2dpdGh1Yi5jb20vd2Vic2Fub3ZhL2pzLXVybC9ibG9iLzc2NGVkOGQ5NDAxMmE3OWJmYTkxMDI2ZjJhNjJmZTMzODNhNWE0OWUvdXJsLmpzXG4qIHdoaWNoIGlzIHNoYXJlZCB2aWEgdGhlIE1JVCBsaWNlbnNlIHdpdGggbWluaW1hbCBtb2RpZmljYXRpb25zLlxuKi9cbmZ1bmN0aW9uIGlzTnVtZXJpYyhhcmcpIHtcbiAgcmV0dXJuICFpc05hTihwYXJzZUZsb2F0KGFyZykpICYmIGlzRmluaXRlKGFyZyk7XG59XG5cbmZ1bmN0aW9uIHVybFBhcnNlKGFyZywgdXJsKSB7XG4gIHZhciBfbHMgPSB1cmwgfHwgd2luZG93LmxvY2F0aW9uLnRvU3RyaW5nKCk7XG5cbiAgaWYgKCFhcmcpIHtcbiAgICByZXR1cm4gX2xzO1xuICB9IGVsc2Uge1xuICAgIGFyZyA9IGFyZy50b1N0cmluZygpO1xuICB9XG5cbiAgaWYgKF9scy5zdWJzdHJpbmcoMCwgMikgPT09ICcvLycpIHtcbiAgICBfbHMgPSAnaHR0cDonICsgX2xzO1xuICB9IGVsc2UgaWYgKF9scy5zcGxpdCgnOi8vJykubGVuZ3RoID09PSAxKSB7XG4gICAgX2xzID0gJ2h0dHA6Ly8nICsgX2xzO1xuICB9XG5cbiAgdXJsID0gX2xzLnNwbGl0KCcvJyk7XG4gIHZhciBfbCA9IHsgYXV0aDogJycgfSxcbiAgICAgIGhvc3QgPSB1cmxbMl0uc3BsaXQoJ0AnKTtcblxuICBpZiAoaG9zdC5sZW5ndGggPT09IDEpIHtcbiAgICBob3N0ID0gaG9zdFswXS5zcGxpdCgnOicpO1xuICB9IGVsc2Uge1xuICAgIF9sLmF1dGggPSBob3N0WzBdO2hvc3QgPSBob3N0WzFdLnNwbGl0KCc6Jyk7XG4gIH1cblxuICBfbC5wcm90b2NvbCA9IHVybFswXTtcbiAgX2wuaG9zdG5hbWUgPSBob3N0WzBdO1xuICBfbC5wb3J0ID0gaG9zdFsxXSB8fCAoX2wucHJvdG9jb2wuc3BsaXQoJzonKVswXS50b0xvd2VyQ2FzZSgpID09PSAnaHR0cHMnID8gJzQ0MycgOiAnODAnKTtcbiAgX2wucGF0aG5hbWUgPSAodXJsLmxlbmd0aCA+IDMgPyAnLycgOiAnJykgKyB1cmwuc2xpY2UoMywgdXJsLmxlbmd0aCkuam9pbignLycpLnNwbGl0KCc/JylbMF0uc3BsaXQoJyMnKVswXTtcbiAgdmFyIF9wID0gX2wucGF0aG5hbWU7XG5cbiAgaWYgKF9wLmNoYXJBdChfcC5sZW5ndGggLSAxKSA9PT0gJy8nKSB7XG4gICAgX3AgPSBfcC5zdWJzdHJpbmcoMCwgX3AubGVuZ3RoIC0gMSk7XG4gIH1cbiAgdmFyIF9oID0gX2wuaG9zdG5hbWUsXG4gICAgICBfaHMgPSBfaC5zcGxpdCgnLicpLFxuICAgICAgX3BzID0gX3Auc3BsaXQoJy8nKTtcblxuICBpZiAoYXJnID09PSAnaG9zdG5hbWUnKSB7XG4gICAgcmV0dXJuIF9oO1xuICB9IGVsc2UgaWYgKGFyZyA9PT0gJ2RvbWFpbicpIHtcbiAgICBpZiAoL14oKFswLTldfFsxLTldWzAtOV18MVswLTldezJ9fDJbMC00XVswLTldfDI1WzAtNV0pXFwuKXszfShbMC05XXxbMS05XVswLTldfDFbMC05XXsyfXwyWzAtNF1bMC05XXwyNVswLTVdKSQvLnRlc3QoX2gpKSB7XG4gICAgICByZXR1cm4gX2g7XG4gICAgfVxuICAgIHJldHVybiBfaHMuc2xpY2UoLTIpLmpvaW4oJy4nKTtcbiAgfVxuICAvL2Vsc2UgaWYgKGFyZyA9PT0gJ3RsZCcpIHsgcmV0dXJuIF9ocy5zbGljZSgtMSkuam9pbignLicpOyB9XG4gIGVsc2UgaWYgKGFyZyA9PT0gJ3N1YicpIHtcbiAgICByZXR1cm4gX2hzLnNsaWNlKDAsIF9ocy5sZW5ndGggLSAyKS5qb2luKCcuJyk7XG4gIH0gZWxzZSBpZiAoYXJnID09PSAncG9ydCcpIHtcbiAgICByZXR1cm4gX2wucG9ydDtcbiAgfSBlbHNlIGlmIChhcmcgPT09ICdwcm90b2NvbCcpIHtcbiAgICByZXR1cm4gX2wucHJvdG9jb2wuc3BsaXQoJzonKVswXTtcbiAgfSBlbHNlIGlmIChhcmcgPT09ICdhdXRoJykge1xuICAgIHJldHVybiBfbC5hdXRoO1xuICB9IGVsc2UgaWYgKGFyZyA9PT0gJ3VzZXInKSB7XG4gICAgcmV0dXJuIF9sLmF1dGguc3BsaXQoJzonKVswXTtcbiAgfSBlbHNlIGlmIChhcmcgPT09ICdwYXNzJykge1xuICAgIHJldHVybiBfbC5hdXRoLnNwbGl0KCc6JylbMV0gfHwgJyc7XG4gIH0gZWxzZSBpZiAoYXJnID09PSAncGF0aCcpIHtcbiAgICByZXR1cm4gX2wucGF0aG5hbWU7XG4gIH0gZWxzZSBpZiAoYXJnLmNoYXJBdCgwKSA9PT0gJy4nKSB7XG4gICAgYXJnID0gYXJnLnN1YnN0cmluZygxKTtcbiAgICBpZiAoaXNOdW1lcmljKGFyZykpIHtcbiAgICAgIGFyZyA9IHBhcnNlSW50KGFyZywgMTApO3JldHVybiBfaHNbYXJnIDwgMCA/IF9ocy5sZW5ndGggKyBhcmcgOiBhcmcgLSAxXSB8fCAnJztcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNOdW1lcmljKGFyZykpIHtcbiAgICBhcmcgPSBwYXJzZUludChhcmcsIDEwKTtyZXR1cm4gX3BzW2FyZyA8IDAgPyBfcHMubGVuZ3RoICsgYXJnIDogYXJnXSB8fCAnJztcbiAgfSBlbHNlIGlmIChhcmcgPT09ICdmaWxlJykge1xuICAgIHJldHVybiBfcHMuc2xpY2UoLTEpWzBdO1xuICB9IGVsc2UgaWYgKGFyZyA9PT0gJ2ZpbGVuYW1lJykge1xuICAgIHJldHVybiBfcHMuc2xpY2UoLTEpWzBdLnNwbGl0KCcuJylbMF07XG4gIH0gZWxzZSBpZiAoYXJnID09PSAnZmlsZWV4dCcpIHtcbiAgICByZXR1cm4gX3BzLnNsaWNlKC0xKVswXS5zcGxpdCgnLicpWzFdIHx8ICcnO1xuICB9IGVsc2UgaWYgKGFyZy5jaGFyQXQoMCkgPT09ICc/JyB8fCBhcmcuY2hhckF0KDApID09PSAnIycpIHtcbiAgICB2YXIgcGFyYW1zID0gX2xzLFxuICAgICAgICBwYXJhbSA9IG51bGw7XG5cbiAgICBpZiAoYXJnLmNoYXJBdCgwKSA9PT0gJz8nKSB7XG4gICAgICBwYXJhbXMgPSAocGFyYW1zLnNwbGl0KCc/JylbMV0gfHwgJycpLnNwbGl0KCcjJylbMF07XG4gICAgfSBlbHNlIGlmIChhcmcuY2hhckF0KDApID09PSAnIycpIHtcbiAgICAgIHBhcmFtcyA9IHBhcmFtcy5zcGxpdCgnIycpWzFdIHx8ICcnO1xuICAgIH1cblxuICAgIGlmICghYXJnLmNoYXJBdCgxKSkge1xuICAgICAgcmV0dXJuIHBhcmFtcztcbiAgICB9XG5cbiAgICBhcmcgPSBhcmcuc3Vic3RyaW5nKDEpO1xuICAgIHBhcmFtcyA9IHBhcmFtcy5zcGxpdCgnJicpO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGlpID0gcGFyYW1zLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgIHBhcmFtID0gcGFyYW1zW2ldLnNwbGl0KCc9Jyk7XG4gICAgICBpZiAocGFyYW1bMF0gPT09IGFyZykge1xuICAgICAgICByZXR1cm4gcGFyYW1bMV0gfHwgJyc7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gJyc7XG59XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IHVybFRyYW5zZm9ybTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIi8qXG4qIFRoaXMgZGVmaW5lcyBmb3VyIG1ldGhvZHM6IG9ub3Blbiwgb25tZXNzYWdlLCBvbmVycm9yLCBhbmQgb25jbG9zZS4gVGhpcyBpcyBkb25lIHRoaXMgd2F5IGluc3RlYWQgb2ZcbioganVzdCBwbGFjaW5nIHRoZSBtZXRob2RzIG9uIHRoZSBwcm90b3R5cGUgYmVjYXVzZSB3ZSBuZWVkIHRvIGNhcHR1cmUgdGhlIGNhbGxiYWNrIHdoZW4gaXQgaXMgZGVmaW5lZCBsaWtlIHNvOlxuKlxuKiBtb2NrU29ja2V0Lm9ub3BlbiA9IGZ1bmN0aW9uKCkgeyAvLyB0aGlzIGlzIHdoYXQgd2UgbmVlZCB0byBzdG9yZSB9O1xuKlxuKiBUaGUgb25seSB3YXkgaXMgdG8gY2FwdHVyZSB0aGUgY2FsbGJhY2sgdmlhIHRoZSBjdXN0b20gc2V0dGVyIGJlbG93IGFuZCB0aGVuIHBsYWNlIHRoZW0gaW50byB0aGUgY29ycmVjdFxuKiBuYW1lc3BhY2Ugc28gdGhleSBnZXQgaW52b2tlZCBhdCB0aGUgcmlnaHQgdGltZS5cbipcbiogQHBhcmFtIHt3ZWJzb2NrZXQ6IG9iamVjdH0gVGhlIHdlYnNvY2tldCBvYmplY3Qgd2hpY2ggd2Ugd2FudCB0byBkZWZpbmUgdGhlc2UgcHJvcGVydGllcyBvbnRvXG4qL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmZ1bmN0aW9uIHdlYlNvY2tldFByb3BlcnRpZXMod2Vic29ja2V0KSB7XG4gIHZhciBldmVudE1lc3NhZ2VTb3VyY2UgPSBmdW5jdGlvbiBldmVudE1lc3NhZ2VTb3VyY2UoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBldmVudC50YXJnZXQgPSB3ZWJzb2NrZXQ7XG4gICAgICBjYWxsYmFjay5hcHBseSh3ZWJzb2NrZXQsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh3ZWJzb2NrZXQsIHtcbiAgICBvbm9wZW46IHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29ub3BlbjtcbiAgICAgIH0sXG4gICAgICBzZXQ6IGZ1bmN0aW9uIHNldChjYWxsYmFjaykge1xuICAgICAgICB0aGlzLl9vbm9wZW4gPSBldmVudE1lc3NhZ2VTb3VyY2UoY2FsbGJhY2spO1xuICAgICAgICB0aGlzLnNlcnZpY2Uuc2V0Q2FsbGJhY2tPYnNlcnZlcignY2xpZW50T25PcGVuJywgdGhpcy5fb25vcGVuLCB3ZWJzb2NrZXQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgb25tZXNzYWdlOiB7XG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vbm1lc3NhZ2U7XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbiBzZXQoY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5fb25tZXNzYWdlID0gZXZlbnRNZXNzYWdlU291cmNlKGNhbGxiYWNrKTtcbiAgICAgICAgdGhpcy5zZXJ2aWNlLnNldENhbGxiYWNrT2JzZXJ2ZXIoJ2NsaWVudE9uTWVzc2FnZScsIHRoaXMuX29ubWVzc2FnZSwgd2Vic29ja2V0KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG9uY2xvc2U6IHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29uY2xvc2U7XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbiBzZXQoY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5fb25jbG9zZSA9IGV2ZW50TWVzc2FnZVNvdXJjZShjYWxsYmFjayk7XG4gICAgICAgIHRoaXMuc2VydmljZS5zZXRDYWxsYmFja09ic2VydmVyKCdjbGllbnRPbmNsb3NlJywgdGhpcy5fb25jbG9zZSwgd2Vic29ja2V0KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG9uZXJyb3I6IHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29uZXJyb3I7XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbiBzZXQoY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5fb25lcnJvciA9IGV2ZW50TWVzc2FnZVNvdXJjZShjYWxsYmFjayk7XG4gICAgICAgIHRoaXMuc2VydmljZS5zZXRDYWxsYmFja09ic2VydmVyKCdjbGllbnRPbkVycm9yJywgdGhpcy5fb25lcnJvciwgd2Vic29ja2V0KTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnRzWydkZWZhdWx0J10gPSB3ZWJTb2NrZXRQcm9wZXJ0aWVzO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfc2VydmljZSA9IHJlcXVpcmUoJy4vc2VydmljZScpO1xuXG52YXIgX3NlcnZpY2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc2VydmljZSk7XG5cbnZhciBfbW9ja1NlcnZlciA9IHJlcXVpcmUoJy4vbW9jay1zZXJ2ZXInKTtcblxudmFyIF9tb2NrU2VydmVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21vY2tTZXJ2ZXIpO1xuXG52YXIgX21vY2tTb2NrZXQgPSByZXF1aXJlKCcuL21vY2stc29ja2V0Jyk7XG5cbnZhciBfbW9ja1NvY2tldDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tb2NrU29ja2V0KTtcblxudmFyIF9oZWxwZXJzR2xvYmFsQ29udGV4dCA9IHJlcXVpcmUoJy4vaGVscGVycy9nbG9iYWwtY29udGV4dCcpO1xuXG52YXIgX2hlbHBlcnNHbG9iYWxDb250ZXh0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hlbHBlcnNHbG9iYWxDb250ZXh0KTtcblxuX2hlbHBlcnNHbG9iYWxDb250ZXh0MlsnZGVmYXVsdCddLlNvY2tldFNlcnZpY2UgPSBfc2VydmljZTJbJ2RlZmF1bHQnXTtcbl9oZWxwZXJzR2xvYmFsQ29udGV4dDJbJ2RlZmF1bHQnXS5Nb2NrU29ja2V0ID0gX21vY2tTb2NrZXQyWydkZWZhdWx0J107XG5faGVscGVyc0dsb2JhbENvbnRleHQyWydkZWZhdWx0J10uTW9ja1NlcnZlciA9IF9tb2NrU2VydmVyMlsnZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9zZXJ2aWNlID0gcmVxdWlyZSgnLi9zZXJ2aWNlJyk7XG5cbnZhciBfc2VydmljZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9zZXJ2aWNlKTtcblxudmFyIF9oZWxwZXJzRGVsYXkgPSByZXF1aXJlKCcuL2hlbHBlcnMvZGVsYXknKTtcblxudmFyIF9oZWxwZXJzRGVsYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc0RlbGF5KTtcblxudmFyIF9oZWxwZXJzVXJsVHJhbnNmb3JtID0gcmVxdWlyZSgnLi9oZWxwZXJzL3VybC10cmFuc2Zvcm0nKTtcblxudmFyIF9oZWxwZXJzVXJsVHJhbnNmb3JtMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hlbHBlcnNVcmxUcmFuc2Zvcm0pO1xuXG52YXIgX2hlbHBlcnNNZXNzYWdlRXZlbnQgPSByZXF1aXJlKCcuL2hlbHBlcnMvbWVzc2FnZS1ldmVudCcpO1xuXG52YXIgX2hlbHBlcnNNZXNzYWdlRXZlbnQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc01lc3NhZ2VFdmVudCk7XG5cbnZhciBfaGVscGVyc0dsb2JhbENvbnRleHQgPSByZXF1aXJlKCcuL2hlbHBlcnMvZ2xvYmFsLWNvbnRleHQnKTtcblxudmFyIF9oZWxwZXJzR2xvYmFsQ29udGV4dDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWxwZXJzR2xvYmFsQ29udGV4dCk7XG5cbmZ1bmN0aW9uIE1vY2tTZXJ2ZXIodXJsKSB7XG4gIHZhciBzZXJ2aWNlID0gbmV3IF9zZXJ2aWNlMlsnZGVmYXVsdCddKCk7XG4gIHRoaXMudXJsID0gKDAsIF9oZWxwZXJzVXJsVHJhbnNmb3JtMlsnZGVmYXVsdCddKSh1cmwpO1xuXG4gIF9oZWxwZXJzR2xvYmFsQ29udGV4dDJbJ2RlZmF1bHQnXS5Nb2NrU29ja2V0LnNlcnZpY2VzW3RoaXMudXJsXSA9IHNlcnZpY2U7XG5cbiAgdGhpcy5zZXJ2aWNlID0gc2VydmljZTtcbiAgLy8gaWdub3JlIHBvc3NpYmxlIHF1ZXJ5IHBhcmFtZXRlcnNcbiAgaWYgKHVybC5pbmRleE9mKE1vY2tTZXJ2ZXIudW5yZXNvbHZhYmxlVVJMKSA9PT0gLTEpIHtcbiAgICBzZXJ2aWNlLnNlcnZlciA9IHRoaXM7XG4gIH1cbn1cblxuLypcbiogVGhpcyBVUkwgY2FuIGJlIHVzZWQgdG8gZW11bGF0ZSBzZXJ2ZXIgdGhhdCBkb2VzIG5vdCBlc3RhYmxpc2ggY29ubmVjdGlvblxuKi9cbk1vY2tTZXJ2ZXIudW5yZXNvbHZhYmxlVVJMID0gJ3dzOi8vdW5yZXNvbHZhYmxlX3VybCc7XG5cbk1vY2tTZXJ2ZXIucHJvdG90eXBlID0ge1xuICBzZXJ2aWNlOiBudWxsLFxuXG4gIC8qXG4gICogVGhpcyBpcyB0aGUgbWFpbiBmdW5jdGlvbiBmb3IgdGhlIG1vY2sgc2VydmVyIHRvIHN1YnNjcmliZSB0byB0aGUgb24gZXZlbnRzLlxuICAqXG4gICogaWU6IG1vY2tTZXJ2ZXIub24oJ2Nvbm5lY3Rpb24nLCBmdW5jdGlvbigpIHsgY29uc29sZS5sb2coJ2EgbW9jayBjbGllbnQgY29ubmVjdGVkJyk7IH0pO1xuICAqXG4gICogQHBhcmFtIHt0eXBlOiBzdHJpbmd9OiBUaGUgZXZlbnQga2V5IHRvIHN1YnNjcmliZSB0by4gVmFsaWQga2V5cyBhcmU6IGNvbm5lY3Rpb24sIG1lc3NhZ2UsIGFuZCBjbG9zZS5cbiAgKiBAcGFyYW0ge2NhbGxiYWNrOiBmdW5jdGlvbn06IFRoZSBjYWxsYmFjayB3aGljaCBzaG91bGQgYmUgY2FsbGVkIHdoZW4gYSBjZXJ0YWluIGV2ZW50IGlzIGZpcmVkLlxuICAqL1xuICBvbjogZnVuY3Rpb24gb24odHlwZSwgY2FsbGJhY2spIHtcbiAgICB2YXIgb2JzZXJ2ZXJLZXk7XG5cbiAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiB0eXBlICE9PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSAnY29ubmVjdGlvbic6XG4gICAgICAgIG9ic2VydmVyS2V5ID0gJ2NsaWVudEhhc0pvaW5lZCc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbWVzc2FnZSc6XG4gICAgICAgIG9ic2VydmVyS2V5ID0gJ2NsaWVudEhhc1NlbnRNZXNzYWdlJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjbG9zZSc6XG4gICAgICAgIG9ic2VydmVyS2V5ID0gJ2NsaWVudEhhc0xlZnQnO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhhdCB0aGUgb2JzZXJ2ZXJLZXkgaXMgdmFsaWQgYmVmb3JlIG9ic2VydmluZyBvbiBpdC5cbiAgICBpZiAodHlwZW9mIG9ic2VydmVyS2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5zZXJ2aWNlLmNsZWFyQWxsKG9ic2VydmVyS2V5KTtcbiAgICAgIHRoaXMuc2VydmljZS5zZXRDYWxsYmFja09ic2VydmVyKG9ic2VydmVyS2V5LCBjYWxsYmFjaywgdGhpcyk7XG4gICAgfVxuICB9LFxuXG4gIC8qXG4gICogVGhpcyBzZW5kIGZ1bmN0aW9uIHdpbGwgbm90aWZ5IGFsbCBtb2NrIGNsaWVudHMgdmlhIHRoZWlyIG9ubWVzc2FnZSBjYWxsYmFja3MgdGhhdCB0aGUgc2VydmVyXG4gICogaGFzIGEgbWVzc2FnZSBmb3IgdGhlbS5cbiAgKlxuICAqIEBwYXJhbSB7ZGF0YTogKn06IEFueSBqYXZhc2NyaXB0IG9iamVjdCB3aGljaCB3aWxsIGJlIGNyYWZ0ZWQgaW50byBhIE1lc3NhZ2VPYmplY3QuXG4gICovXG4gIHNlbmQ6IGZ1bmN0aW9uIHNlbmQoZGF0YSkge1xuICAgICgwLCBfaGVscGVyc0RlbGF5MlsnZGVmYXVsdCddKShmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNlcnZpY2Uuc2VuZE1lc3NhZ2VUb0NsaWVudHMoKDAsIF9oZWxwZXJzTWVzc2FnZUV2ZW50MlsnZGVmYXVsdCddKSgnbWVzc2FnZScsIGRhdGEsIHRoaXMudXJsKSk7XG4gICAgfSwgdGhpcyk7XG4gIH0sXG5cbiAgLypcbiAgKiBOb3RpZmllcyBhbGwgbW9jayBjbGllbnRzIHRoYXQgdGhlIHNlcnZlciBpcyBjbG9zaW5nIGFuZCB0aGVpciBvbmNsb3NlIGNhbGxiYWNrcyBzaG91bGQgZmlyZS5cbiAgKi9cbiAgY2xvc2U6IGZ1bmN0aW9uIGNsb3NlKCkge1xuICAgICgwLCBfaGVscGVyc0RlbGF5MlsnZGVmYXVsdCddKShmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNlcnZpY2UuY2xvc2VDb25uZWN0aW9uRnJvbVNlcnZlcigoMCwgX2hlbHBlcnNNZXNzYWdlRXZlbnQyWydkZWZhdWx0J10pKCdjbG9zZScsIG51bGwsIHRoaXMudXJsKSk7XG4gICAgfSwgdGhpcyk7XG4gIH1cbn07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IE1vY2tTZXJ2ZXI7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfaGVscGVyc0RlbGF5ID0gcmVxdWlyZSgnLi9oZWxwZXJzL2RlbGF5Jyk7XG5cbnZhciBfaGVscGVyc0RlbGF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hlbHBlcnNEZWxheSk7XG5cbnZhciBfaGVscGVyc1VybFRyYW5zZm9ybSA9IHJlcXVpcmUoJy4vaGVscGVycy91cmwtdHJhbnNmb3JtJyk7XG5cbnZhciBfaGVscGVyc1VybFRyYW5zZm9ybTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWxwZXJzVXJsVHJhbnNmb3JtKTtcblxudmFyIF9oZWxwZXJzTWVzc2FnZUV2ZW50ID0gcmVxdWlyZSgnLi9oZWxwZXJzL21lc3NhZ2UtZXZlbnQnKTtcblxudmFyIF9oZWxwZXJzTWVzc2FnZUV2ZW50MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hlbHBlcnNNZXNzYWdlRXZlbnQpO1xuXG52YXIgX2hlbHBlcnNHbG9iYWxDb250ZXh0ID0gcmVxdWlyZSgnLi9oZWxwZXJzL2dsb2JhbC1jb250ZXh0Jyk7XG5cbnZhciBfaGVscGVyc0dsb2JhbENvbnRleHQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc0dsb2JhbENvbnRleHQpO1xuXG52YXIgX2hlbHBlcnNXZWJzb2NrZXRQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi9oZWxwZXJzL3dlYnNvY2tldC1wcm9wZXJ0aWVzJyk7XG5cbnZhciBfaGVscGVyc1dlYnNvY2tldFByb3BlcnRpZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc1dlYnNvY2tldFByb3BlcnRpZXMpO1xuXG5mdW5jdGlvbiBNb2NrU29ja2V0KHVybCkge1xuICB0aGlzLmJpbmFyeVR5cGUgPSAnYmxvYic7XG4gIHRoaXMudXJsID0gKDAsIF9oZWxwZXJzVXJsVHJhbnNmb3JtMlsnZGVmYXVsdCddKSh1cmwpO1xuICB0aGlzLnJlYWR5U3RhdGUgPSBfaGVscGVyc0dsb2JhbENvbnRleHQyWydkZWZhdWx0J10uTW9ja1NvY2tldC5DT05ORUNUSU5HO1xuICB0aGlzLnNlcnZpY2UgPSBfaGVscGVyc0dsb2JhbENvbnRleHQyWydkZWZhdWx0J10uTW9ja1NvY2tldC5zZXJ2aWNlc1t0aGlzLnVybF07XG5cbiAgdGhpcy5fZXZlbnRIYW5kbGVycyA9IHt9O1xuXG4gICgwLCBfaGVscGVyc1dlYnNvY2tldFByb3BlcnRpZXMyWydkZWZhdWx0J10pKHRoaXMpO1xuXG4gICgwLCBfaGVscGVyc0RlbGF5MlsnZGVmYXVsdCddKShmdW5jdGlvbiAoKSB7XG4gICAgLy8gTGV0IHRoZSBzZXJ2aWNlIGtub3cgdGhhdCB3ZSBhcmUgYm90aCByZWFkeSB0byBjaGFuZ2Ugb3VyIHJlYWR5IHN0YXRlIGFuZCB0aGF0XG4gICAgLy8gdGhpcyBjbGllbnQgaXMgY29ubmVjdGluZyB0byB0aGUgbW9jayBzZXJ2ZXIuXG4gICAgdGhpcy5zZXJ2aWNlLmNsaWVudElzQ29ubmVjdGluZyh0aGlzLCB0aGlzLl91cGRhdGVSZWFkeVN0YXRlKTtcbiAgfSwgdGhpcyk7XG59XG5cbk1vY2tTb2NrZXQuQ09OTkVDVElORyA9IDA7XG5Nb2NrU29ja2V0Lk9QRU4gPSAxO1xuTW9ja1NvY2tldC5DTE9TSU5HID0gMjtcbk1vY2tTb2NrZXQuQ0xPU0VEID0gMztcbk1vY2tTb2NrZXQuc2VydmljZXMgPSB7fTtcblxuTW9ja1NvY2tldC5wcm90b3R5cGUgPSB7XG5cbiAgLypcbiAgKiBIb2xkcyB0aGUgb24qKiogY2FsbGJhY2sgZnVuY3Rpb25zLiBUaGVzZSBhcmUgcmVhbGx5IGp1c3QgZm9yIHRoZSBjdXN0b21cbiAgKiBnZXR0ZXJzIHRoYXQgYXJlIGRlZmluZWQgaW4gdGhlIGhlbHBlcnMvd2Vic29ja2V0LXByb3BlcnRpZXMuIEFjY2Vzc2luZyB0aGVzZSBwcm9wZXJ0aWVzIGlzIG5vdCBhZHZpc2VkLlxuICAqL1xuICBfb25vcGVuOiBudWxsLFxuICBfb25tZXNzYWdlOiBudWxsLFxuICBfb25lcnJvcjogbnVsbCxcbiAgX29uY2xvc2U6IG51bGwsXG5cbiAgLypcbiAgKiBUaGlzIGhvbGRzIHJlZmVyZW5jZSB0byB0aGUgc2VydmljZSBvYmplY3QuIFRoZSBzZXJ2aWNlIG9iamVjdCBpcyBob3cgd2UgY2FuXG4gICogY29tbXVuaWNhdGUgd2l0aCB0aGUgYmFja2VuZCB2aWEgdGhlIHB1Yi9zdWIgbW9kZWwuXG4gICpcbiAgKiBUaGUgc2VydmljZSBoYXMgcHJvcGVydGllcyB3aGljaCB3ZSBjYW4gdXNlIHRvIG9ic2VydmUgb3Igbm90aWZpeSB3aXRoLlxuICAqIHRoaXMuc2VydmljZS5ub3RpZnkoJ2ZvbycpICYgdGhpcy5zZXJ2aWNlLm9ic2VydmUoJ2ZvbycsIGNhbGxiYWNrLCBjb250ZXh0KVxuICAqL1xuICBzZXJ2aWNlOiBudWxsLFxuXG4gIC8qXG4gICogSW50ZXJuYWwgc3RvcmFnZSBmb3IgZXZlbnQgaGFuZGxlcnMuIEJhc2ljYWxseSwgdGhlcmUgY291bGQgYmUgbW9yZSB0aGFuIG9uZVxuICAqIGhhbmRsZXIgcGVyIGV2ZW50IHNvIHdlIHN0b3JlIHRoZW0gYWxsIGluIGFycmF5LlxuICAqL1xuICBfZXZlbnRIYW5kbGVyczoge30sXG5cbiAgLypcbiAgKiBUaGlzIGlzIGEgbW9jayBmb3IgRXZlbnRUYXJnZXQncyBhZGRFdmVudExpc3RlbmVyIG1ldGhvZC4gQSBiaXQgbmFpdmUgYW5kXG4gICogZG9lc24ndCBpbXBsZW1lbnQgdGhpcmQgdXNlQ2FwdHVyZSBwYXJhbWV0ZXIgYnV0IHNob3VsZCBiZSBlbm91Z2ggZm9yIG1vc3RcbiAgKiAoaWYgbm90IGFsbCkgY2FzZXMuXG4gICpcbiAgKiBAcGFyYW0ge2V2ZW50OiBzdHJpbmd9OiBFdmVudCBuYW1lLlxuICAqIEBwYXJhbSB7aGFuZGxlcjogZnVuY3Rpb259OiBBbnkgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIGV2ZW50IGhhbmRsaW5nLlxuICAqL1xuICBhZGRFdmVudExpc3RlbmVyOiBmdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50XSkge1xuICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0gPSBbXTtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHRoaXNbJ29uJyArIGV2ZW50XSA9IGZ1bmN0aW9uIChldmVudE9iamVjdCkge1xuICAgICAgICBzZWxmLmRpc3BhdGNoRXZlbnQoZXZlbnRPYmplY3QpO1xuICAgICAgfTtcbiAgICB9XG4gICAgdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0ucHVzaChoYW5kbGVyKTtcbiAgfSxcblxuICAvKlxuICAqIFRoaXMgaXMgYSBtb2NrIGZvciBFdmVudFRhcmdldCdzIHJlbW92ZUV2ZW50TGlzdGVuZXIgbWV0aG9kLiBBIGJpdCBuYWl2ZSBhbmRcbiAgKiBkb2Vzbid0IGltcGxlbWVudCB0aGlyZCB1c2VDYXB0dXJlIHBhcmFtZXRlciBidXQgc2hvdWxkIGJlIGVub3VnaCBmb3IgbW9zdFxuICAqIChpZiBub3QgYWxsKSBjYXNlcy5cbiAgKlxuICAqIEBwYXJhbSB7ZXZlbnQ6IHN0cmluZ306IEV2ZW50IG5hbWUuXG4gICogQHBhcmFtIHtoYW5kbGVyOiBmdW5jdGlvbn06IEFueSBjYWxsYmFjayBmdW5jdGlvbiBmb3IgZXZlbnQgaGFuZGxpbmcuIFNob3VsZFxuICAqIGJlIG9uZSBvZiB0aGUgZnVuY3Rpb25zIHVzZWQgaW4gdGhlIHByZXZpb3VzIGNhbGxzIG9mIGFkZEV2ZW50TGlzdGVuZXIgbWV0aG9kLlxuICAqL1xuICByZW1vdmVFdmVudExpc3RlbmVyOiBmdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50XSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgaGFuZGxlcnMgPSB0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50XTtcbiAgICBoYW5kbGVycy5zcGxpY2UoaGFuZGxlcnMuaW5kZXhPZihoYW5kbGVyKSwgMSk7XG4gICAgaWYgKCFoYW5kbGVycy5sZW5ndGgpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50XTtcbiAgICAgIGRlbGV0ZSB0aGlzWydvbicgKyBldmVudF07XG4gICAgfVxuICB9LFxuXG4gIC8qXG4gICogVGhpcyBpcyBhIG1vY2sgZm9yIEV2ZW50VGFyZ2V0J3MgZGlzcGF0Y2hFdmVudCBtZXRob2QuXG4gICpcbiAgKiBAcGFyYW0ge2V2ZW50OiBNZXNzYWdlRXZlbnR9OiBTb21lIGV2ZW50LCBlaXRoZXIgbmF0aXZlIE1lc3NhZ2VFdmVudCBvciBhbiBvYmplY3RcbiAgKiByZXR1cm5lZCBieSByZXF1aXJlKCcuL2hlbHBlcnMvbWVzc2FnZS1ldmVudCcpXG4gICovXG4gIGRpc3BhdGNoRXZlbnQ6IGZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQoZXZlbnQpIHtcbiAgICB2YXIgaGFuZGxlcnMgPSB0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50LnR5cGVdO1xuICAgIGlmICghaGFuZGxlcnMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgaGFuZGxlcnNbaV0uY2FsbCh0aGlzLCBldmVudCk7XG4gICAgfVxuICB9LFxuXG4gIC8qXG4gICogVGhpcyBpcyBhIG1vY2sgZm9yIHRoZSBuYXRpdmUgc2VuZCBmdW5jdGlvbiBmb3VuZCBvbiB0aGUgV2ViU29ja2V0IG9iamVjdC4gSXQgbm90aWZpZXMgdGhlXG4gICogc2VydmljZSB0aGF0IGl0IGhhcyBzZW50IGEgbWVzc2FnZS5cbiAgKlxuICAqIEBwYXJhbSB7ZGF0YTogKn06IEFueSBqYXZhc2NyaXB0IG9iamVjdCB3aGljaCB3aWxsIGJlIGNyYWZ0ZWQgaW50byBhIE1lc3NhZ2VPYmplY3QuXG4gICovXG4gIHNlbmQ6IGZ1bmN0aW9uIHNlbmQoZGF0YSkge1xuICAgICgwLCBfaGVscGVyc0RlbGF5MlsnZGVmYXVsdCddKShmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNlcnZpY2Uuc2VuZE1lc3NhZ2VUb1NlcnZlcigoMCwgX2hlbHBlcnNNZXNzYWdlRXZlbnQyWydkZWZhdWx0J10pKCdtZXNzYWdlJywgZGF0YSwgdGhpcy51cmwpKTtcbiAgICB9LCB0aGlzKTtcbiAgfSxcblxuICAvKlxuICAqIFRoaXMgaXMgYSBtb2NrIGZvciB0aGUgbmF0aXZlIGNsb3NlIGZ1bmN0aW9uIGZvdW5kIG9uIHRoZSBXZWJTb2NrZXQgb2JqZWN0LiBJdCBub3RpZmllcyB0aGVcbiAgKiBzZXJ2aWNlIHRoYXQgaXQgaXMgY2xvc2luZyB0aGUgY29ubmVjdGlvbi5cbiAgKi9cbiAgY2xvc2U6IGZ1bmN0aW9uIGNsb3NlKCkge1xuICAgICgwLCBfaGVscGVyc0RlbGF5MlsnZGVmYXVsdCddKShmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNlcnZpY2UuY2xvc2VDb25uZWN0aW9uRnJvbUNsaWVudCgoMCwgX2hlbHBlcnNNZXNzYWdlRXZlbnQyWydkZWZhdWx0J10pKCdjbG9zZScsIG51bGwsIHRoaXMudXJsKSwgdGhpcyk7XG4gICAgfSwgdGhpcyk7XG4gIH0sXG5cbiAgLypcbiAgKiBUaGlzIGlzIGEgcHJpdmF0ZSBtZXRob2QgdGhhdCBjYW4gYmUgdXNlZCB0byBjaGFuZ2UgdGhlIHJlYWR5U3RhdGUuIFRoaXMgaXMgdXNlZFxuICAqIGxpa2UgdGhpczogdGhpcy5wcm90b2NvbC5zdWJqZWN0Lm9ic2VydmUoJ3VwZGF0ZVJlYWR5U3RhdGUnLCB0aGlzLl91cGRhdGVSZWFkeVN0YXRlLCB0aGlzKTtcbiAgKiBzbyB0aGF0IHRoZSBzZXJ2aWNlIGFuZCB0aGUgc2VydmVyIGNhbiBjaGFuZ2UgdGhlIHJlYWR5U3RhdGUgc2ltcGx5IGJlIG5vdGlmaW5nIGEgbmFtZXNwYWNlLlxuICAqXG4gICogQHBhcmFtIHtuZXdSZWFkeVN0YXRlOiBudW1iZXJ9OiBUaGUgbmV3IHJlYWR5IHN0YXRlLiBNdXN0IGJlIDAtNFxuICAqL1xuICBfdXBkYXRlUmVhZHlTdGF0ZTogZnVuY3Rpb24gX3VwZGF0ZVJlYWR5U3RhdGUobmV3UmVhZHlTdGF0ZSkge1xuICAgIGlmIChuZXdSZWFkeVN0YXRlID49IDAgJiYgbmV3UmVhZHlTdGF0ZSA8PSA0KSB7XG4gICAgICB0aGlzLnJlYWR5U3RhdGUgPSBuZXdSZWFkeVN0YXRlO1xuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gTW9ja1NvY2tldDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9oZWxwZXJzTWVzc2FnZUV2ZW50ID0gcmVxdWlyZSgnLi9oZWxwZXJzL21lc3NhZ2UtZXZlbnQnKTtcblxudmFyIF9oZWxwZXJzTWVzc2FnZUV2ZW50MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hlbHBlcnNNZXNzYWdlRXZlbnQpO1xuXG52YXIgX2hlbHBlcnNHbG9iYWxDb250ZXh0ID0gcmVxdWlyZSgnLi9oZWxwZXJzL2dsb2JhbC1jb250ZXh0Jyk7XG5cbnZhciBfaGVscGVyc0dsb2JhbENvbnRleHQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc0dsb2JhbENvbnRleHQpO1xuXG5mdW5jdGlvbiBTb2NrZXRTZXJ2aWNlKCkge1xuICB0aGlzLmxpc3QgPSB7fTtcbn1cblxuU29ja2V0U2VydmljZS5wcm90b3R5cGUgPSB7XG4gIHNlcnZlcjogbnVsbCxcblxuICAvKlxuICAqIFRoaXMgbm90aWZpZXMgdGhlIG1vY2sgc2VydmVyIHRoYXQgYSBjbGllbnQgaXMgY29ubmVjdGluZyBhbmQgYWxzbyBzZXRzIHVwXG4gICogdGhlIHJlYWR5IHN0YXRlIG9ic2VydmVyLlxuICAqXG4gICogQHBhcmFtIHtjbGllbnQ6IG9iamVjdH0gdGhlIGNvbnRleHQgb2YgdGhlIGNsaWVudFxuICAqIEBwYXJhbSB7cmVhZHlTdGF0ZUZ1bmN0aW9uOiBmdW5jdGlvbn0gdGhlIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBpbnZva2VkIG9uIGEgcmVhZHkgc3RhdGUgY2hhbmdlXG4gICovXG4gIGNsaWVudElzQ29ubmVjdGluZzogZnVuY3Rpb24gY2xpZW50SXNDb25uZWN0aW5nKGNsaWVudCwgcmVhZHlTdGF0ZUZ1bmN0aW9uKSB7XG4gICAgdGhpcy5vYnNlcnZlKCd1cGRhdGVSZWFkeVN0YXRlJywgcmVhZHlTdGF0ZUZ1bmN0aW9uLCBjbGllbnQpO1xuXG4gICAgLy8gaWYgdGhlIHNlcnZlciBoYXMgbm90IGJlZW4gc2V0IHRoZW4gd2Ugbm90aWZ5IHRoZSBvbmNsb3NlIG1ldGhvZCBvZiB0aGlzIGNsaWVudFxuICAgIGlmICghdGhpcy5zZXJ2ZXIpIHtcbiAgICAgIHRoaXMubm90aWZ5T25seUZvcihjbGllbnQsICd1cGRhdGVSZWFkeVN0YXRlJywgX2hlbHBlcnNHbG9iYWxDb250ZXh0MlsnZGVmYXVsdCddLk1vY2tTb2NrZXQuQ0xPU0VEKTtcbiAgICAgIHRoaXMubm90aWZ5T25seUZvcihjbGllbnQsICdjbGllbnRPbkVycm9yJywgKDAsIF9oZWxwZXJzTWVzc2FnZUV2ZW50MlsnZGVmYXVsdCddKSgnZXJyb3InLCBudWxsLCBjbGllbnQudXJsKSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5ub3RpZnlPbmx5Rm9yKGNsaWVudCwgJ3VwZGF0ZVJlYWR5U3RhdGUnLCBfaGVscGVyc0dsb2JhbENvbnRleHQyWydkZWZhdWx0J10uTW9ja1NvY2tldC5PUEVOKTtcbiAgICB0aGlzLm5vdGlmeSgnY2xpZW50SGFzSm9pbmVkJywgdGhpcy5zZXJ2ZXIpO1xuICAgIHRoaXMubm90aWZ5T25seUZvcihjbGllbnQsICdjbGllbnRPbk9wZW4nLCAoMCwgX2hlbHBlcnNNZXNzYWdlRXZlbnQyWydkZWZhdWx0J10pKCdvcGVuJywgbnVsbCwgdGhpcy5zZXJ2ZXIudXJsKSk7XG4gIH0sXG5cbiAgLypcbiAgKiBDbG9zZXMgYSBjb25uZWN0aW9uIGZyb20gdGhlIHNlcnZlcidzIHBlcnNwZWN0aXZlLiBUaGlzIHNob3VsZFxuICAqIGNsb3NlIGFsbCBjbGllbnRzLlxuICAqXG4gICogQHBhcmFtIHttZXNzYWdlRXZlbnQ6IG9iamVjdH0gdGhlIG1vY2sgbWVzc2FnZSBldmVudC5cbiAgKi9cbiAgY2xvc2VDb25uZWN0aW9uRnJvbVNlcnZlcjogZnVuY3Rpb24gY2xvc2VDb25uZWN0aW9uRnJvbVNlcnZlcihtZXNzYWdlRXZlbnQpIHtcbiAgICB0aGlzLm5vdGlmeSgndXBkYXRlUmVhZHlTdGF0ZScsIF9oZWxwZXJzR2xvYmFsQ29udGV4dDJbJ2RlZmF1bHQnXS5Nb2NrU29ja2V0LkNMT1NJTkcpO1xuICAgIHRoaXMubm90aWZ5KCdjbGllbnRPbmNsb3NlJywgbWVzc2FnZUV2ZW50KTtcbiAgICB0aGlzLm5vdGlmeSgndXBkYXRlUmVhZHlTdGF0ZScsIF9oZWxwZXJzR2xvYmFsQ29udGV4dDJbJ2RlZmF1bHQnXS5Nb2NrU29ja2V0LkNMT1NFRCk7XG4gICAgdGhpcy5ub3RpZnkoJ2NsaWVudEhhc0xlZnQnKTtcbiAgfSxcblxuICAvKlxuICAqIENsb3NlcyBhIGNvbm5lY3Rpb24gZnJvbSB0aGUgY2xpZW50cyBwZXJzcGVjdGl2ZS4gVGhpc1xuICAqIHNob3VsZCBvbmx5IGNsb3NlIHRoZSBjbGllbnQgd2hvIGluaXRpYXRlZCB0aGUgY2xvc2UgYW5kIG5vdFxuICAqIGFsbCBvZiB0aGUgb3RoZXIgY2xpZW50cy5cbiAgKlxuICAqIEBwYXJhbSB7bWVzc2FnZUV2ZW50OiBvYmplY3R9IHRoZSBtb2NrIG1lc3NhZ2UgZXZlbnQuXG4gICogQHBhcmFtIHtjbGllbnQ6IG9iamVjdH0gdGhlIGNvbnRleHQgb2YgdGhlIGNsaWVudFxuICAqL1xuICBjbG9zZUNvbm5lY3Rpb25Gcm9tQ2xpZW50OiBmdW5jdGlvbiBjbG9zZUNvbm5lY3Rpb25Gcm9tQ2xpZW50KG1lc3NhZ2VFdmVudCwgY2xpZW50KSB7XG4gICAgaWYgKGNsaWVudC5yZWFkeVN0YXRlID09PSBfaGVscGVyc0dsb2JhbENvbnRleHQyWydkZWZhdWx0J10uTW9ja1NvY2tldC5PUEVOKSB7XG4gICAgICB0aGlzLm5vdGlmeU9ubHlGb3IoY2xpZW50LCAndXBkYXRlUmVhZHlTdGF0ZScsIF9oZWxwZXJzR2xvYmFsQ29udGV4dDJbJ2RlZmF1bHQnXS5Nb2NrU29ja2V0LkNMT1NJTkcpO1xuICAgICAgdGhpcy5ub3RpZnlPbmx5Rm9yKGNsaWVudCwgJ2NsaWVudE9uY2xvc2UnLCBtZXNzYWdlRXZlbnQpO1xuICAgICAgdGhpcy5ub3RpZnlPbmx5Rm9yKGNsaWVudCwgJ3VwZGF0ZVJlYWR5U3RhdGUnLCBfaGVscGVyc0dsb2JhbENvbnRleHQyWydkZWZhdWx0J10uTW9ja1NvY2tldC5DTE9TRUQpO1xuICAgICAgdGhpcy5ub3RpZnkoJ2NsaWVudEhhc0xlZnQnKTtcbiAgICB9XG4gIH0sXG5cbiAgLypcbiAgKiBOb3RpZmllcyB0aGUgbW9jayBzZXJ2ZXIgdGhhdCBhIGNsaWVudCBoYXMgc2VudCBhIG1lc3NhZ2UuXG4gICpcbiAgKiBAcGFyYW0ge21lc3NhZ2VFdmVudDogb2JqZWN0fSB0aGUgbW9jayBtZXNzYWdlIGV2ZW50LlxuICAqL1xuICBzZW5kTWVzc2FnZVRvU2VydmVyOiBmdW5jdGlvbiBzZW5kTWVzc2FnZVRvU2VydmVyKG1lc3NhZ2VFdmVudCkge1xuICAgIHRoaXMubm90aWZ5KCdjbGllbnRIYXNTZW50TWVzc2FnZScsIG1lc3NhZ2VFdmVudC5kYXRhLCBtZXNzYWdlRXZlbnQpO1xuICB9LFxuXG4gIC8qXG4gICogTm90aWZpZXMgYWxsIGNsaWVudHMgdGhhdCB0aGUgc2VydmVyIGhhcyBzZW50IGEgbWVzc2FnZVxuICAqXG4gICogQHBhcmFtIHttZXNzYWdlRXZlbnQ6IG9iamVjdH0gdGhlIG1vY2sgbWVzc2FnZSBldmVudC5cbiAgKi9cbiAgc2VuZE1lc3NhZ2VUb0NsaWVudHM6IGZ1bmN0aW9uIHNlbmRNZXNzYWdlVG9DbGllbnRzKG1lc3NhZ2VFdmVudCkge1xuICAgIHRoaXMubm90aWZ5KCdjbGllbnRPbk1lc3NhZ2UnLCBtZXNzYWdlRXZlbnQpO1xuICB9LFxuXG4gIC8qXG4gICogU2V0dXAgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uIG9ic2VydmVycyBmb3IgYm90aCB0aGUgc2VydmVyIGFuZCBjbGllbnQuXG4gICpcbiAgKiBAcGFyYW0ge29ic2VydmVyS2V5OiBzdHJpbmd9IGVpdGhlcjogY29ubmVjdGlvbiwgbWVzc2FnZSBvciBjbG9zZVxuICAqIEBwYXJhbSB7Y2FsbGJhY2s6IGZ1bmN0aW9ufSB0aGUgY2FsbGJhY2sgdG8gYmUgaW52b2tlZFxuICAqIEBwYXJhbSB7c2VydmVyOiBvYmplY3R9IHRoZSBjb250ZXh0IG9mIHRoZSBzZXJ2ZXJcbiAgKi9cbiAgc2V0Q2FsbGJhY2tPYnNlcnZlcjogZnVuY3Rpb24gc2V0Q2FsbGJhY2tPYnNlcnZlcihvYnNlcnZlcktleSwgY2FsbGJhY2ssIHNlcnZlcikge1xuICAgIHRoaXMub2JzZXJ2ZShvYnNlcnZlcktleSwgY2FsbGJhY2ssIHNlcnZlcik7XG4gIH0sXG5cbiAgLypcbiAgKiBCaW5kcyBhIGNhbGxiYWNrIHRvIGEgbmFtZXNwYWNlLiBJZiBub3RpZnkgaXMgY2FsbGVkIG9uIGEgbmFtZXNwYWNlIGFsbCBcIm9ic2VydmVyc1wiIHdpbGwgYmVcbiAgKiBmaXJlZCB3aXRoIHRoZSBjb250ZXh0IHRoYXQgaXMgcGFzc2VkIGluLlxuICAqXG4gICogQHBhcmFtIHtuYW1lc3BhY2U6IHN0cmluZ31cbiAgKiBAcGFyYW0ge2NhbGxiYWNrOiBmdW5jdGlvbn1cbiAgKiBAcGFyYW0ge2NvbnRleHQ6IG9iamVjdH1cbiAgKi9cbiAgb2JzZXJ2ZTogZnVuY3Rpb24gb2JzZXJ2ZShuYW1lc3BhY2UsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhlIGFyZ3VtZW50cyBhcmUgb2YgdGhlIGNvcnJlY3QgdHlwZVxuICAgIGlmICh0eXBlb2YgbmFtZXNwYWNlICE9PSAnc3RyaW5nJyB8fCB0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicgfHwgY29udGV4dCAmJiB0eXBlb2YgY29udGV4dCAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBJZiBhIG5hbWVzcGFjZSBoYXMgbm90IGJlZW4gY3JlYXRlZCBiZWZvcmUgdGhlbiB3ZSBuZWVkIHRvIFwiaW5pdGlhbGl6ZVwiIHRoZSBuYW1lc3BhY2VcbiAgICBpZiAoIXRoaXMubGlzdFtuYW1lc3BhY2VdKSB7XG4gICAgICB0aGlzLmxpc3RbbmFtZXNwYWNlXSA9IFtdO1xuICAgIH1cblxuICAgIHRoaXMubGlzdFtuYW1lc3BhY2VdLnB1c2goeyBjYWxsYmFjazogY2FsbGJhY2ssIGNvbnRleHQ6IGNvbnRleHQgfSk7XG4gIH0sXG5cbiAgLypcbiAgKiBSZW1vdmUgYWxsIG9ic2VydmVycyBmcm9tIGEgZ2l2ZW4gbmFtZXNwYWNlLlxuICAqXG4gICogQHBhcmFtIHtuYW1lc3BhY2U6IHN0cmluZ30gVGhlIG5hbWVzcGFjZSB0byBjbGVhci5cbiAgKi9cbiAgY2xlYXJBbGw6IGZ1bmN0aW9uIGNsZWFyQWxsKG5hbWVzcGFjZSkge1xuXG4gICAgaWYgKCF0aGlzLnZlcmlmeU5hbWVzcGFjZUFyZyhuYW1lc3BhY2UpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5saXN0W25hbWVzcGFjZV0gPSBbXTtcbiAgfSxcblxuICAvKlxuICAqIE5vdGlmeSBhbGwgY2FsbGJhY2tzIHRoYXQgaGF2ZSBiZWVuIGJvdW5kIHRvIHRoZSBnaXZlbiBuYW1lc3BhY2UuXG4gICpcbiAgKiBAcGFyYW0ge25hbWVzcGFjZTogc3RyaW5nfSBUaGUgbmFtZXNwYWNlIHRvIG5vdGlmeSBvYnNlcnZlcnMgb24uXG4gICogQHBhcmFtIHtuYW1lc3BhY2U6IHVybH0gVGhlIHVybCB0byBub3RpZnkgb2JzZXJ2ZXJzIG9uLlxuICAqL1xuICBub3RpZnk6IGZ1bmN0aW9uIG5vdGlmeShuYW1lc3BhY2UpIHtcblxuICAgIC8vIFRoaXMgc3RyaXBzIHRoZSBuYW1lc3BhY2UgZnJvbSB0aGUgbGlzdCBvZiBhcmdzIGFzIHdlIGRvbnQgd2FudCB0byBwYXNzIHRoYXQgaW50byB0aGUgY2FsbGJhY2suXG4gICAgdmFyIGFyZ3VtZW50c0ZvckNhbGxiYWNrID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICAgIGlmICghdGhpcy52ZXJpZnlOYW1lc3BhY2VBcmcobmFtZXNwYWNlKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIExvb3Agb3ZlciBhbGwgb2YgdGhlIG9ic2VydmVycyBhbmQgZmlyZSB0aGUgY2FsbGJhY2sgZnVuY3Rpb24gd2l0aCB0aGUgY29udGV4dC5cbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy5saXN0W25hbWVzcGFjZV0ubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHRoaXMubGlzdFtuYW1lc3BhY2VdW2ldLmNhbGxiYWNrLmFwcGx5KHRoaXMubGlzdFtuYW1lc3BhY2VdW2ldLmNvbnRleHQsIGFyZ3VtZW50c0ZvckNhbGxiYWNrKTtcbiAgICB9XG4gIH0sXG5cbiAgLypcbiAgKiBOb3RpZnkgb25seSB0aGUgY2FsbGJhY2sgb2YgdGhlIGdpdmVuIGNvbnRleHQgYW5kIG5hbWVzcGFjZS5cbiAgKlxuICAqIEBwYXJhbSB7Y29udGV4dDogb2JqZWN0fSB0aGUgY29udGV4dCB0byBtYXRjaCBhZ2FpbnN0LlxuICAqIEBwYXJhbSB7bmFtZXNwYWNlOiBzdHJpbmd9IFRoZSBuYW1lc3BhY2UgdG8gbm90aWZ5IG9ic2VydmVycyBvbi5cbiAgKi9cbiAgbm90aWZ5T25seUZvcjogZnVuY3Rpb24gbm90aWZ5T25seUZvcihjb250ZXh0LCBuYW1lc3BhY2UpIHtcblxuICAgIC8vIFRoaXMgc3RyaXBzIHRoZSBuYW1lc3BhY2UgZnJvbSB0aGUgbGlzdCBvZiBhcmdzIGFzIHdlIGRvbnQgd2FudCB0byBwYXNzIHRoYXQgaW50byB0aGUgY2FsbGJhY2suXG4gICAgdmFyIGFyZ3VtZW50c0ZvckNhbGxiYWNrID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcblxuICAgIGlmICghdGhpcy52ZXJpZnlOYW1lc3BhY2VBcmcobmFtZXNwYWNlKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIExvb3Agb3ZlciBhbGwgb2YgdGhlIG9ic2VydmVycyBhbmQgZmlyZSB0aGUgY2FsbGJhY2sgZnVuY3Rpb24gd2l0aCB0aGUgY29udGV4dC5cbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy5saXN0W25hbWVzcGFjZV0ubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLmxpc3RbbmFtZXNwYWNlXVtpXS5jb250ZXh0ID09PSBjb250ZXh0KSB7XG4gICAgICAgIHRoaXMubGlzdFtuYW1lc3BhY2VdW2ldLmNhbGxiYWNrLmFwcGx5KHRoaXMubGlzdFtuYW1lc3BhY2VdW2ldLmNvbnRleHQsIGFyZ3VtZW50c0ZvckNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLypcbiAgKiBWZXJpZmllcyB0aGF0IHRoZSBuYW1lc3BhY2UgaXMgdmFsaWQuXG4gICpcbiAgKiBAcGFyYW0ge25hbWVzcGFjZTogc3RyaW5nfSBUaGUgbmFtZXNwYWNlIHRvIHZlcmlmeS5cbiAgKi9cbiAgdmVyaWZ5TmFtZXNwYWNlQXJnOiBmdW5jdGlvbiB2ZXJpZnlOYW1lc3BhY2VBcmcobmFtZXNwYWNlKSB7XG4gICAgaWYgKHR5cGVvZiBuYW1lc3BhY2UgIT09ICdzdHJpbmcnIHx8ICF0aGlzLmxpc3RbbmFtZXNwYWNlXSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBTb2NrZXRTZXJ2aWNlO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107Il19
