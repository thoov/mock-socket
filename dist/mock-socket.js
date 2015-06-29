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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm9jY29saS1mYXN0LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImhlbHBlcnMvZGVsYXkuanMiLCJoZWxwZXJzL2dsb2JhbC1jb250ZXh0LmpzIiwiaGVscGVycy9tZXNzYWdlLWV2ZW50LmpzIiwiaGVscGVycy91cmwtdHJhbnNmb3JtLmpzIiwiaGVscGVycy93ZWJzb2NrZXQtcHJvcGVydGllcy5qcyIsIm1haW4uanMiLCJtb2NrLXNlcnZlci5qcyIsIm1vY2stc29ja2V0LmpzIiwic2VydmljZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfZ2xvYmFsQ29udGV4dCA9IHJlcXVpcmUoJy4vZ2xvYmFsLWNvbnRleHQnKTtcblxudmFyIF9nbG9iYWxDb250ZXh0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2dsb2JhbENvbnRleHQpO1xuXG4vKlxuKiBUaGlzIGRlbGF5IGFsbG93cyB0aGUgdGhyZWFkIHRvIGZpbmlzaCBhc3NpZ25pbmcgaXRzIG9uKiBtZXRob2RzXG4qIGJlZm9yZSBpbnZva2luZyB0aGUgZGVsYXkgY2FsbGJhY2suIFRoaXMgaXMgcHVyZWx5IGEgdGltaW5nIGhhY2suXG4qIGh0dHA6Ly9nZWVrYWJ5dGUuYmxvZ3Nwb3QuY29tLzIwMTQvMDEvamF2YXNjcmlwdC1lZmZlY3Qtb2Ytc2V0dGluZy1zZXR0aW1lb3V0Lmh0bWxcbipcbiogQHBhcmFtIHtjYWxsYmFjazogZnVuY3Rpb259IHRoZSBjYWxsYmFjayB3aGljaCB3aWxsIGJlIGludm9rZWQgYWZ0ZXIgdGhlIHRpbWVvdXRcbiogQHBhcm1hIHtjb250ZXh0OiBvYmplY3R9IHRoZSBjb250ZXh0IGluIHdoaWNoIHRvIGludm9rZSB0aGUgZnVuY3Rpb25cbiovXG5mdW5jdGlvbiBkZWxheShjYWxsYmFjaywgY29udGV4dCkge1xuICBfZ2xvYmFsQ29udGV4dDJbJ2RlZmF1bHQnXS5zZXRUaW1lb3V0KGZ1bmN0aW9uIChjb250ZXh0KSB7XG4gICAgY2FsbGJhY2suY2FsbChjb250ZXh0KTtcbiAgfSwgNCwgY29udGV4dCk7XG59XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGRlbGF5O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiLypcbiogRGV0ZXJtaW5lcyB0aGUgZ2xvYmFsIGNvbnRleHQuIFRoaXMgc2hvdWxkIGJlIGVpdGhlciB3aW5kb3cgKGluIHRoZSlcbiogY2FzZSB3aGVyZSB3ZSBhcmUgaW4gYSBicm93c2VyKSBvciBnbG9iYWwgKGluIHRoZSBjYXNlIHdoZXJlIHdlIGFyZSBpblxuKiBub2RlKVxuKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbnZhciBnbG9iYWxDb250ZXh0O1xuXG5pZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBnbG9iYWxDb250ZXh0ID0gZ2xvYmFsO1xufSBlbHNlIHtcbiAgICBnbG9iYWxDb250ZXh0ID0gd2luZG93O1xufVxuXG5pZiAoIWdsb2JhbENvbnRleHQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBzZXQgdGhlIGdsb2JhbCBjb250ZXh0IHRvIGVpdGhlciB3aW5kb3cgb3IgZ2xvYmFsLicpO1xufVxuXG5leHBvcnRzWydkZWZhdWx0J10gPSBnbG9iYWxDb250ZXh0O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiLypcbiogVGhpcyBpcyBhIG1vY2sgd2Vic29ja2V0IGV2ZW50IG1lc3NhZ2UgdGhhdCBpcyBwYXNzZWQgaW50byB0aGUgb25vcGVuLFxuKiBvcG1lc3NhZ2UsIGV0YyBmdW5jdGlvbnMuXG4qXG4qIEBwYXJhbSB7bmFtZTogc3RyaW5nfSBUaGUgbmFtZSBvZiB0aGUgZXZlbnRcbiogQHBhcmFtIHtkYXRhOiAqfSBUaGUgZGF0YSB0byBzZW5kLlxuKiBAcGFyYW0ge29yaWdpbjogc3RyaW5nfSBUaGUgdXJsIG9mIHRoZSBwbGFjZSB3aGVyZSB0aGUgZXZlbnQgaXMgb3JpZ2luYXRpbmcuXG4qL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcbmZ1bmN0aW9uIHNvY2tldEV2ZW50TWVzc2FnZShuYW1lLCBkYXRhLCBvcmlnaW4pIHtcblx0dmFyIHBvcnRzID0gbnVsbDtcblx0dmFyIHNvdXJjZSA9IG51bGw7XG5cdHZhciBidWJibGVzID0gZmFsc2U7XG5cdHZhciBjYW5jZWxhYmxlID0gZmFsc2U7XG5cdHZhciBsYXN0RXZlbnRJZCA9ICcnO1xuXHR2YXIgdGFyZ2V0UGxhY2Vob2xkID0gbnVsbDtcblx0dmFyIG1lc3NhZ2VFdmVudDtcblxuXHR0cnkge1xuXHRcdG1lc3NhZ2VFdmVudCA9IG5ldyBNZXNzYWdlRXZlbnQobmFtZSk7XG5cdFx0bWVzc2FnZUV2ZW50LmluaXRNZXNzYWdlRXZlbnQobmFtZSwgYnViYmxlcywgY2FuY2VsYWJsZSwgZGF0YSwgb3JpZ2luLCBsYXN0RXZlbnRJZCk7XG5cblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydGllcyhtZXNzYWdlRXZlbnQsIHtcblx0XHRcdHRhcmdldDoge1xuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcblx0XHRcdFx0XHRyZXR1cm4gdGFyZ2V0UGxhY2Vob2xkO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRzZXQ6IGZ1bmN0aW9uIHNldCh2YWx1ZSkge1xuXHRcdFx0XHRcdHRhcmdldFBsYWNlaG9sZCA9IHZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0c3JjRWxlbWVudDoge1xuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy50YXJnZXQ7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRjdXJyZW50VGFyZ2V0OiB7XG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLnRhcmdldDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0Ly8gV2UgYXJlIHVuYWJsZSB0byBjcmVhdGUgYSBNZXNzYWdlRXZlbnQgT2JqZWN0LiBUaGlzIHNob3VsZCBvbmx5IGJlIGhhcHBlbmluZyBpbiBQaGFudG9tSlMuXG5cdFx0bWVzc2FnZUV2ZW50ID0ge1xuXHRcdFx0dHlwZTogbmFtZSxcblx0XHRcdGJ1YmJsZXM6IGJ1YmJsZXMsXG5cdFx0XHRjYW5jZWxhYmxlOiBjYW5jZWxhYmxlLFxuXHRcdFx0ZGF0YTogZGF0YSxcblx0XHRcdG9yaWdpbjogb3JpZ2luLFxuXHRcdFx0bGFzdEV2ZW50SWQ6IGxhc3RFdmVudElkLFxuXHRcdFx0c291cmNlOiBzb3VyY2UsXG5cdFx0XHRwb3J0czogcG9ydHMsXG5cdFx0XHRkZWZhdWx0UHJldmVudGVkOiBmYWxzZSxcblx0XHRcdHJldHVyblZhbHVlOiB0cnVlLFxuXHRcdFx0Y2xpcGJvYXJkRGF0YTogdW5kZWZpbmVkXG5cdFx0fTtcblxuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKG1lc3NhZ2VFdmVudCwge1xuXHRcdFx0dGFyZ2V0OiB7XG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xuXHRcdFx0XHRcdHJldHVybiB0YXJnZXRQbGFjZWhvbGQ7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHNldDogZnVuY3Rpb24gc2V0KHZhbHVlKSB7XG5cdFx0XHRcdFx0dGFyZ2V0UGxhY2Vob2xkID0gdmFsdWU7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRzcmNFbGVtZW50OiB7XG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLnRhcmdldDtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGN1cnJlbnRUYXJnZXQ6IHtcblx0XHRcdFx0Z2V0OiBmdW5jdGlvbiBnZXQoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMudGFyZ2V0O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRyZXR1cm4gbWVzc2FnZUV2ZW50O1xufVxuXG5leHBvcnRzWydkZWZhdWx0J10gPSBzb2NrZXRFdmVudE1lc3NhZ2U7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIvKlxuKiBUaGUgbmF0aXZlIHdlYnNvY2tldCBvYmplY3Qgd2lsbCB0cmFuc2Zvcm0gdXJscyB3aXRob3V0IGEgcGF0aG5hbWUgdG8gaGF2ZSBqdXN0IGEgLy5cbiogQXMgYW4gZXhhbXBsZTogd3M6Ly9sb2NhbGhvc3Q6ODA4MCB3b3VsZCBhY3R1YWxseSBiZSB3czovL2xvY2FsaG9zdDo4MDgwLyBidXQgd3M6Ly9leGFtcGxlLmNvbS9mb28gd291bGQgbm90XG4qIGNoYW5nZS4gVGhpcyBmdW5jdGlvbiBkb2VzIHRoaXMgdHJhbnNmb3JtYXRpb24gdG8gc3RheSBpbmxpbmUgd2l0aCB0aGUgbmF0aXZlIHdlYnNvY2tldCBpbXBsZW1lbnRhdGlvbi5cbipcbiogQHBhcmFtIHt1cmw6IHN0cmluZ30gVGhlIHVybCB0byB0cmFuc2Zvcm0uXG4qL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmZ1bmN0aW9uIHVybFRyYW5zZm9ybSh1cmwpIHtcbiAgdmFyIHVybFBhdGggPSB1cmxQYXJzZSgncGF0aCcsIHVybCk7XG4gIHZhciB1cmxRdWVyeSA9IHVybFBhcnNlKCc/JywgdXJsKTtcblxuICB1cmxRdWVyeSA9IHVybFF1ZXJ5ID8gJz8nICsgdXJsUXVlcnkgOiAnJztcblxuICBpZiAodXJsUGF0aCA9PT0gJycpIHtcbiAgICByZXR1cm4gdXJsLnNwbGl0KCc/JylbMF0gKyAnLycgKyB1cmxRdWVyeTtcbiAgfVxuXG4gIHJldHVybiB1cmw7XG59XG5cbi8qXG4qIFRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zIChpc051bWVyaWMgJiB1cmxQYXJzZSkgd2FzIHRha2VuIGZyb21cbiogaHR0cHM6Ly9naXRodWIuY29tL3dlYnNhbm92YS9qcy11cmwvYmxvYi83NjRlZDhkOTQwMTJhNzliZmE5MTAyNmYyYTYyZmUzMzgzYTVhNDllL3VybC5qc1xuKiB3aGljaCBpcyBzaGFyZWQgdmlhIHRoZSBNSVQgbGljZW5zZSB3aXRoIG1pbmltYWwgbW9kaWZpY2F0aW9ucy5cbiovXG5mdW5jdGlvbiBpc051bWVyaWMoYXJnKSB7XG4gIHJldHVybiAhaXNOYU4ocGFyc2VGbG9hdChhcmcpKSAmJiBpc0Zpbml0ZShhcmcpO1xufVxuXG5mdW5jdGlvbiB1cmxQYXJzZShhcmcsIHVybCkge1xuICB2YXIgX2xzID0gdXJsIHx8IHdpbmRvdy5sb2NhdGlvbi50b1N0cmluZygpO1xuXG4gIGlmICghYXJnKSB7XG4gICAgcmV0dXJuIF9scztcbiAgfSBlbHNlIHtcbiAgICBhcmcgPSBhcmcudG9TdHJpbmcoKTtcbiAgfVxuXG4gIGlmIChfbHMuc3Vic3RyaW5nKDAsIDIpID09PSAnLy8nKSB7XG4gICAgX2xzID0gJ2h0dHA6JyArIF9scztcbiAgfSBlbHNlIGlmIChfbHMuc3BsaXQoJzovLycpLmxlbmd0aCA9PT0gMSkge1xuICAgIF9scyA9ICdodHRwOi8vJyArIF9scztcbiAgfVxuXG4gIHVybCA9IF9scy5zcGxpdCgnLycpO1xuICB2YXIgX2wgPSB7IGF1dGg6ICcnIH0sXG4gICAgICBob3N0ID0gdXJsWzJdLnNwbGl0KCdAJyk7XG5cbiAgaWYgKGhvc3QubGVuZ3RoID09PSAxKSB7XG4gICAgaG9zdCA9IGhvc3RbMF0uc3BsaXQoJzonKTtcbiAgfSBlbHNlIHtcbiAgICBfbC5hdXRoID0gaG9zdFswXTtob3N0ID0gaG9zdFsxXS5zcGxpdCgnOicpO1xuICB9XG5cbiAgX2wucHJvdG9jb2wgPSB1cmxbMF07XG4gIF9sLmhvc3RuYW1lID0gaG9zdFswXTtcbiAgX2wucG9ydCA9IGhvc3RbMV0gfHwgKF9sLnByb3RvY29sLnNwbGl0KCc6JylbMF0udG9Mb3dlckNhc2UoKSA9PT0gJ2h0dHBzJyA/ICc0NDMnIDogJzgwJyk7XG4gIF9sLnBhdGhuYW1lID0gKHVybC5sZW5ndGggPiAzID8gJy8nIDogJycpICsgdXJsLnNsaWNlKDMsIHVybC5sZW5ndGgpLmpvaW4oJy8nKS5zcGxpdCgnPycpWzBdLnNwbGl0KCcjJylbMF07XG4gIHZhciBfcCA9IF9sLnBhdGhuYW1lO1xuXG4gIGlmIChfcC5jaGFyQXQoX3AubGVuZ3RoIC0gMSkgPT09ICcvJykge1xuICAgIF9wID0gX3Auc3Vic3RyaW5nKDAsIF9wLmxlbmd0aCAtIDEpO1xuICB9XG4gIHZhciBfaCA9IF9sLmhvc3RuYW1lLFxuICAgICAgX2hzID0gX2guc3BsaXQoJy4nKSxcbiAgICAgIF9wcyA9IF9wLnNwbGl0KCcvJyk7XG5cbiAgaWYgKGFyZyA9PT0gJ2hvc3RuYW1lJykge1xuICAgIHJldHVybiBfaDtcbiAgfSBlbHNlIGlmIChhcmcgPT09ICdkb21haW4nKSB7XG4gICAgaWYgKC9eKChbMC05XXxbMS05XVswLTldfDFbMC05XXsyfXwyWzAtNF1bMC05XXwyNVswLTVdKVxcLil7M30oWzAtOV18WzEtOV1bMC05XXwxWzAtOV17Mn18MlswLTRdWzAtOV18MjVbMC01XSkkLy50ZXN0KF9oKSkge1xuICAgICAgcmV0dXJuIF9oO1xuICAgIH1cbiAgICByZXR1cm4gX2hzLnNsaWNlKC0yKS5qb2luKCcuJyk7XG4gIH1cbiAgLy9lbHNlIGlmIChhcmcgPT09ICd0bGQnKSB7IHJldHVybiBfaHMuc2xpY2UoLTEpLmpvaW4oJy4nKTsgfVxuICBlbHNlIGlmIChhcmcgPT09ICdzdWInKSB7XG4gICAgcmV0dXJuIF9ocy5zbGljZSgwLCBfaHMubGVuZ3RoIC0gMikuam9pbignLicpO1xuICB9IGVsc2UgaWYgKGFyZyA9PT0gJ3BvcnQnKSB7XG4gICAgcmV0dXJuIF9sLnBvcnQ7XG4gIH0gZWxzZSBpZiAoYXJnID09PSAncHJvdG9jb2wnKSB7XG4gICAgcmV0dXJuIF9sLnByb3RvY29sLnNwbGl0KCc6JylbMF07XG4gIH0gZWxzZSBpZiAoYXJnID09PSAnYXV0aCcpIHtcbiAgICByZXR1cm4gX2wuYXV0aDtcbiAgfSBlbHNlIGlmIChhcmcgPT09ICd1c2VyJykge1xuICAgIHJldHVybiBfbC5hdXRoLnNwbGl0KCc6JylbMF07XG4gIH0gZWxzZSBpZiAoYXJnID09PSAncGFzcycpIHtcbiAgICByZXR1cm4gX2wuYXV0aC5zcGxpdCgnOicpWzFdIHx8ICcnO1xuICB9IGVsc2UgaWYgKGFyZyA9PT0gJ3BhdGgnKSB7XG4gICAgcmV0dXJuIF9sLnBhdGhuYW1lO1xuICB9IGVsc2UgaWYgKGFyZy5jaGFyQXQoMCkgPT09ICcuJykge1xuICAgIGFyZyA9IGFyZy5zdWJzdHJpbmcoMSk7XG4gICAgaWYgKGlzTnVtZXJpYyhhcmcpKSB7XG4gICAgICBhcmcgPSBwYXJzZUludChhcmcsIDEwKTtyZXR1cm4gX2hzW2FyZyA8IDAgPyBfaHMubGVuZ3RoICsgYXJnIDogYXJnIC0gMV0gfHwgJyc7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzTnVtZXJpYyhhcmcpKSB7XG4gICAgYXJnID0gcGFyc2VJbnQoYXJnLCAxMCk7cmV0dXJuIF9wc1thcmcgPCAwID8gX3BzLmxlbmd0aCArIGFyZyA6IGFyZ10gfHwgJyc7XG4gIH0gZWxzZSBpZiAoYXJnID09PSAnZmlsZScpIHtcbiAgICByZXR1cm4gX3BzLnNsaWNlKC0xKVswXTtcbiAgfSBlbHNlIGlmIChhcmcgPT09ICdmaWxlbmFtZScpIHtcbiAgICByZXR1cm4gX3BzLnNsaWNlKC0xKVswXS5zcGxpdCgnLicpWzBdO1xuICB9IGVsc2UgaWYgKGFyZyA9PT0gJ2ZpbGVleHQnKSB7XG4gICAgcmV0dXJuIF9wcy5zbGljZSgtMSlbMF0uc3BsaXQoJy4nKVsxXSB8fCAnJztcbiAgfSBlbHNlIGlmIChhcmcuY2hhckF0KDApID09PSAnPycgfHwgYXJnLmNoYXJBdCgwKSA9PT0gJyMnKSB7XG4gICAgdmFyIHBhcmFtcyA9IF9scyxcbiAgICAgICAgcGFyYW0gPSBudWxsO1xuXG4gICAgaWYgKGFyZy5jaGFyQXQoMCkgPT09ICc/Jykge1xuICAgICAgcGFyYW1zID0gKHBhcmFtcy5zcGxpdCgnPycpWzFdIHx8ICcnKS5zcGxpdCgnIycpWzBdO1xuICAgIH0gZWxzZSBpZiAoYXJnLmNoYXJBdCgwKSA9PT0gJyMnKSB7XG4gICAgICBwYXJhbXMgPSBwYXJhbXMuc3BsaXQoJyMnKVsxXSB8fCAnJztcbiAgICB9XG5cbiAgICBpZiAoIWFyZy5jaGFyQXQoMSkpIHtcbiAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgfVxuXG4gICAgYXJnID0gYXJnLnN1YnN0cmluZygxKTtcbiAgICBwYXJhbXMgPSBwYXJhbXMuc3BsaXQoJyYnKTtcblxuICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IHBhcmFtcy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICBwYXJhbSA9IHBhcmFtc1tpXS5zcGxpdCgnPScpO1xuICAgICAgaWYgKHBhcmFtWzBdID09PSBhcmcpIHtcbiAgICAgICAgcmV0dXJuIHBhcmFtWzFdIHx8ICcnO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuICcnO1xufVxuXG5leHBvcnRzWydkZWZhdWx0J10gPSB1cmxUcmFuc2Zvcm07XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIvKlxuKiBUaGlzIGRlZmluZXMgZm91ciBtZXRob2RzOiBvbm9wZW4sIG9ubWVzc2FnZSwgb25lcnJvciwgYW5kIG9uY2xvc2UuIFRoaXMgaXMgZG9uZSB0aGlzIHdheSBpbnN0ZWFkIG9mXG4qIGp1c3QgcGxhY2luZyB0aGUgbWV0aG9kcyBvbiB0aGUgcHJvdG90eXBlIGJlY2F1c2Ugd2UgbmVlZCB0byBjYXB0dXJlIHRoZSBjYWxsYmFjayB3aGVuIGl0IGlzIGRlZmluZWQgbGlrZSBzbzpcbipcbiogbW9ja1NvY2tldC5vbm9wZW4gPSBmdW5jdGlvbigpIHsgLy8gdGhpcyBpcyB3aGF0IHdlIG5lZWQgdG8gc3RvcmUgfTtcbipcbiogVGhlIG9ubHkgd2F5IGlzIHRvIGNhcHR1cmUgdGhlIGNhbGxiYWNrIHZpYSB0aGUgY3VzdG9tIHNldHRlciBiZWxvdyBhbmQgdGhlbiBwbGFjZSB0aGVtIGludG8gdGhlIGNvcnJlY3RcbiogbmFtZXNwYWNlIHNvIHRoZXkgZ2V0IGludm9rZWQgYXQgdGhlIHJpZ2h0IHRpbWUuXG4qXG4qIEBwYXJhbSB7d2Vic29ja2V0OiBvYmplY3R9IFRoZSB3ZWJzb2NrZXQgb2JqZWN0IHdoaWNoIHdlIHdhbnQgdG8gZGVmaW5lIHRoZXNlIHByb3BlcnRpZXMgb250b1xuKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5mdW5jdGlvbiB3ZWJTb2NrZXRQcm9wZXJ0aWVzKHdlYnNvY2tldCkge1xuICB2YXIgZXZlbnRNZXNzYWdlU291cmNlID0gZnVuY3Rpb24gZXZlbnRNZXNzYWdlU291cmNlKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgZXZlbnQudGFyZ2V0ID0gd2Vic29ja2V0O1xuICAgICAgY2FsbGJhY2suYXBwbHkod2Vic29ja2V0LCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH07XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMod2Vic29ja2V0LCB7XG4gICAgb25vcGVuOiB7XG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vbm9wZW47XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbiBzZXQoY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5fb25vcGVuID0gZXZlbnRNZXNzYWdlU291cmNlKGNhbGxiYWNrKTtcbiAgICAgICAgdGhpcy5zZXJ2aWNlLnNldENhbGxiYWNrT2JzZXJ2ZXIoJ2NsaWVudE9uT3BlbicsIHRoaXMuX29ub3Blbiwgd2Vic29ja2V0KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG9ubWVzc2FnZToge1xuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fb25tZXNzYWdlO1xuICAgICAgfSxcbiAgICAgIHNldDogZnVuY3Rpb24gc2V0KGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuX29ubWVzc2FnZSA9IGV2ZW50TWVzc2FnZVNvdXJjZShjYWxsYmFjayk7XG4gICAgICAgIHRoaXMuc2VydmljZS5zZXRDYWxsYmFja09ic2VydmVyKCdjbGllbnRPbk1lc3NhZ2UnLCB0aGlzLl9vbm1lc3NhZ2UsIHdlYnNvY2tldCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBvbmNsb3NlOiB7XG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vbmNsb3NlO1xuICAgICAgfSxcbiAgICAgIHNldDogZnVuY3Rpb24gc2V0KGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuX29uY2xvc2UgPSBldmVudE1lc3NhZ2VTb3VyY2UoY2FsbGJhY2spO1xuICAgICAgICB0aGlzLnNlcnZpY2Uuc2V0Q2FsbGJhY2tPYnNlcnZlcignY2xpZW50T25jbG9zZScsIHRoaXMuX29uY2xvc2UsIHdlYnNvY2tldCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBvbmVycm9yOiB7XG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vbmVycm9yO1xuICAgICAgfSxcbiAgICAgIHNldDogZnVuY3Rpb24gc2V0KGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuX29uZXJyb3IgPSBldmVudE1lc3NhZ2VTb3VyY2UoY2FsbGJhY2spO1xuICAgICAgICB0aGlzLnNlcnZpY2Uuc2V0Q2FsbGJhY2tPYnNlcnZlcignY2xpZW50T25FcnJvcicsIHRoaXMuX29uZXJyb3IsIHdlYnNvY2tldCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuZXhwb3J0c1snZGVmYXVsdCddID0gd2ViU29ja2V0UHJvcGVydGllcztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX3NlcnZpY2UgPSByZXF1aXJlKCcuL3NlcnZpY2UnKTtcblxudmFyIF9zZXJ2aWNlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NlcnZpY2UpO1xuXG52YXIgX21vY2tTZXJ2ZXIgPSByZXF1aXJlKCcuL21vY2stc2VydmVyJyk7XG5cbnZhciBfbW9ja1NlcnZlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tb2NrU2VydmVyKTtcblxudmFyIF9tb2NrU29ja2V0ID0gcmVxdWlyZSgnLi9tb2NrLXNvY2tldCcpO1xuXG52YXIgX21vY2tTb2NrZXQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbW9ja1NvY2tldCk7XG5cbnZhciBfaGVscGVyc0dsb2JhbENvbnRleHQgPSByZXF1aXJlKCcuL2hlbHBlcnMvZ2xvYmFsLWNvbnRleHQnKTtcblxudmFyIF9oZWxwZXJzR2xvYmFsQ29udGV4dDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWxwZXJzR2xvYmFsQ29udGV4dCk7XG5cbl9oZWxwZXJzR2xvYmFsQ29udGV4dDJbJ2RlZmF1bHQnXS5Tb2NrZXRTZXJ2aWNlID0gX3NlcnZpY2UyWydkZWZhdWx0J107XG5faGVscGVyc0dsb2JhbENvbnRleHQyWydkZWZhdWx0J10uTW9ja1NvY2tldCA9IF9tb2NrU29ja2V0MlsnZGVmYXVsdCddO1xuX2hlbHBlcnNHbG9iYWxDb250ZXh0MlsnZGVmYXVsdCddLk1vY2tTZXJ2ZXIgPSBfbW9ja1NlcnZlcjJbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfc2VydmljZSA9IHJlcXVpcmUoJy4vc2VydmljZScpO1xuXG52YXIgX3NlcnZpY2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc2VydmljZSk7XG5cbnZhciBfaGVscGVyc0RlbGF5ID0gcmVxdWlyZSgnLi9oZWxwZXJzL2RlbGF5Jyk7XG5cbnZhciBfaGVscGVyc0RlbGF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hlbHBlcnNEZWxheSk7XG5cbnZhciBfaGVscGVyc1VybFRyYW5zZm9ybSA9IHJlcXVpcmUoJy4vaGVscGVycy91cmwtdHJhbnNmb3JtJyk7XG5cbnZhciBfaGVscGVyc1VybFRyYW5zZm9ybTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWxwZXJzVXJsVHJhbnNmb3JtKTtcblxudmFyIF9oZWxwZXJzTWVzc2FnZUV2ZW50ID0gcmVxdWlyZSgnLi9oZWxwZXJzL21lc3NhZ2UtZXZlbnQnKTtcblxudmFyIF9oZWxwZXJzTWVzc2FnZUV2ZW50MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hlbHBlcnNNZXNzYWdlRXZlbnQpO1xuXG52YXIgX2hlbHBlcnNHbG9iYWxDb250ZXh0ID0gcmVxdWlyZSgnLi9oZWxwZXJzL2dsb2JhbC1jb250ZXh0Jyk7XG5cbnZhciBfaGVscGVyc0dsb2JhbENvbnRleHQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc0dsb2JhbENvbnRleHQpO1xuXG5mdW5jdGlvbiBNb2NrU2VydmVyKHVybCkge1xuICB2YXIgc2VydmljZSA9IG5ldyBfc2VydmljZTJbJ2RlZmF1bHQnXSgpO1xuICB0aGlzLnVybCA9ICgwLCBfaGVscGVyc1VybFRyYW5zZm9ybTJbJ2RlZmF1bHQnXSkodXJsKTtcblxuICBfaGVscGVyc0dsb2JhbENvbnRleHQyWydkZWZhdWx0J10uTW9ja1NvY2tldC5zZXJ2aWNlc1t0aGlzLnVybF0gPSBzZXJ2aWNlO1xuXG4gIHRoaXMuc2VydmljZSA9IHNlcnZpY2U7XG4gIC8vIGlnbm9yZSBwb3NzaWJsZSBxdWVyeSBwYXJhbWV0ZXJzXG4gIGlmICh1cmwuaW5kZXhPZihNb2NrU2VydmVyLnVucmVzb2x2YWJsZVVSTCkgPT09IC0xKSB7XG4gICAgc2VydmljZS5zZXJ2ZXIgPSB0aGlzO1xuICB9XG59XG5cbi8qXG4qIFRoaXMgVVJMIGNhbiBiZSB1c2VkIHRvIGVtdWxhdGUgc2VydmVyIHRoYXQgZG9lcyBub3QgZXN0YWJsaXNoIGNvbm5lY3Rpb25cbiovXG5Nb2NrU2VydmVyLnVucmVzb2x2YWJsZVVSTCA9ICd3czovL3VucmVzb2x2YWJsZV91cmwnO1xuXG5Nb2NrU2VydmVyLnByb3RvdHlwZSA9IHtcbiAgc2VydmljZTogbnVsbCxcblxuICAvKlxuICAqIFRoaXMgaXMgdGhlIG1haW4gZnVuY3Rpb24gZm9yIHRoZSBtb2NrIHNlcnZlciB0byBzdWJzY3JpYmUgdG8gdGhlIG9uIGV2ZW50cy5cbiAgKlxuICAqIGllOiBtb2NrU2VydmVyLm9uKCdjb25uZWN0aW9uJywgZnVuY3Rpb24oKSB7IGNvbnNvbGUubG9nKCdhIG1vY2sgY2xpZW50IGNvbm5lY3RlZCcpOyB9KTtcbiAgKlxuICAqIEBwYXJhbSB7dHlwZTogc3RyaW5nfTogVGhlIGV2ZW50IGtleSB0byBzdWJzY3JpYmUgdG8uIFZhbGlkIGtleXMgYXJlOiBjb25uZWN0aW9uLCBtZXNzYWdlLCBhbmQgY2xvc2UuXG4gICogQHBhcmFtIHtjYWxsYmFjazogZnVuY3Rpb259OiBUaGUgY2FsbGJhY2sgd2hpY2ggc2hvdWxkIGJlIGNhbGxlZCB3aGVuIGEgY2VydGFpbiBldmVudCBpcyBmaXJlZC5cbiAgKi9cbiAgb246IGZ1bmN0aW9uIG9uKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgdmFyIG9ic2VydmVyS2V5O1xuXG4gICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgdHlwZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgJ2Nvbm5lY3Rpb24nOlxuICAgICAgICBvYnNlcnZlcktleSA9ICdjbGllbnRIYXNKb2luZWQnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ21lc3NhZ2UnOlxuICAgICAgICBvYnNlcnZlcktleSA9ICdjbGllbnRIYXNTZW50TWVzc2FnZSc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY2xvc2UnOlxuICAgICAgICBvYnNlcnZlcktleSA9ICdjbGllbnRIYXNMZWZ0JztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gTWFrZSBzdXJlIHRoYXQgdGhlIG9ic2VydmVyS2V5IGlzIHZhbGlkIGJlZm9yZSBvYnNlcnZpbmcgb24gaXQuXG4gICAgaWYgKHR5cGVvZiBvYnNlcnZlcktleSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRoaXMuc2VydmljZS5jbGVhckFsbChvYnNlcnZlcktleSk7XG4gICAgICB0aGlzLnNlcnZpY2Uuc2V0Q2FsbGJhY2tPYnNlcnZlcihvYnNlcnZlcktleSwgY2FsbGJhY2ssIHRoaXMpO1xuICAgIH1cbiAgfSxcblxuICAvKlxuICAqIFRoaXMgc2VuZCBmdW5jdGlvbiB3aWxsIG5vdGlmeSBhbGwgbW9jayBjbGllbnRzIHZpYSB0aGVpciBvbm1lc3NhZ2UgY2FsbGJhY2tzIHRoYXQgdGhlIHNlcnZlclxuICAqIGhhcyBhIG1lc3NhZ2UgZm9yIHRoZW0uXG4gICpcbiAgKiBAcGFyYW0ge2RhdGE6ICp9OiBBbnkgamF2YXNjcmlwdCBvYmplY3Qgd2hpY2ggd2lsbCBiZSBjcmFmdGVkIGludG8gYSBNZXNzYWdlT2JqZWN0LlxuICAqL1xuICBzZW5kOiBmdW5jdGlvbiBzZW5kKGRhdGEpIHtcbiAgICAoMCwgX2hlbHBlcnNEZWxheTJbJ2RlZmF1bHQnXSkoZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXJ2aWNlLnNlbmRNZXNzYWdlVG9DbGllbnRzKCgwLCBfaGVscGVyc01lc3NhZ2VFdmVudDJbJ2RlZmF1bHQnXSkoJ21lc3NhZ2UnLCBkYXRhLCB0aGlzLnVybCkpO1xuICAgIH0sIHRoaXMpO1xuICB9LFxuXG4gIC8qXG4gICogTm90aWZpZXMgYWxsIG1vY2sgY2xpZW50cyB0aGF0IHRoZSBzZXJ2ZXIgaXMgY2xvc2luZyBhbmQgdGhlaXIgb25jbG9zZSBjYWxsYmFja3Mgc2hvdWxkIGZpcmUuXG4gICovXG4gIGNsb3NlOiBmdW5jdGlvbiBjbG9zZSgpIHtcbiAgICAoMCwgX2hlbHBlcnNEZWxheTJbJ2RlZmF1bHQnXSkoZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXJ2aWNlLmNsb3NlQ29ubmVjdGlvbkZyb21TZXJ2ZXIoKDAsIF9oZWxwZXJzTWVzc2FnZUV2ZW50MlsnZGVmYXVsdCddKSgnY2xvc2UnLCBudWxsLCB0aGlzLnVybCkpO1xuICAgIH0sIHRoaXMpO1xuICB9XG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBNb2NrU2VydmVyO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX2hlbHBlcnNEZWxheSA9IHJlcXVpcmUoJy4vaGVscGVycy9kZWxheScpO1xuXG52YXIgX2hlbHBlcnNEZWxheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWxwZXJzRGVsYXkpO1xuXG52YXIgX2hlbHBlcnNVcmxUcmFuc2Zvcm0gPSByZXF1aXJlKCcuL2hlbHBlcnMvdXJsLXRyYW5zZm9ybScpO1xuXG52YXIgX2hlbHBlcnNVcmxUcmFuc2Zvcm0yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc1VybFRyYW5zZm9ybSk7XG5cbnZhciBfaGVscGVyc01lc3NhZ2VFdmVudCA9IHJlcXVpcmUoJy4vaGVscGVycy9tZXNzYWdlLWV2ZW50Jyk7XG5cbnZhciBfaGVscGVyc01lc3NhZ2VFdmVudDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWxwZXJzTWVzc2FnZUV2ZW50KTtcblxudmFyIF9oZWxwZXJzR2xvYmFsQ29udGV4dCA9IHJlcXVpcmUoJy4vaGVscGVycy9nbG9iYWwtY29udGV4dCcpO1xuXG52YXIgX2hlbHBlcnNHbG9iYWxDb250ZXh0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hlbHBlcnNHbG9iYWxDb250ZXh0KTtcblxudmFyIF9oZWxwZXJzV2Vic29ja2V0UHJvcGVydGllcyA9IHJlcXVpcmUoJy4vaGVscGVycy93ZWJzb2NrZXQtcHJvcGVydGllcycpO1xuXG52YXIgX2hlbHBlcnNXZWJzb2NrZXRQcm9wZXJ0aWVzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hlbHBlcnNXZWJzb2NrZXRQcm9wZXJ0aWVzKTtcblxuZnVuY3Rpb24gTW9ja1NvY2tldCh1cmwpIHtcbiAgdGhpcy5iaW5hcnlUeXBlID0gJ2Jsb2InO1xuICB0aGlzLnVybCA9ICgwLCBfaGVscGVyc1VybFRyYW5zZm9ybTJbJ2RlZmF1bHQnXSkodXJsKTtcbiAgdGhpcy5yZWFkeVN0YXRlID0gX2hlbHBlcnNHbG9iYWxDb250ZXh0MlsnZGVmYXVsdCddLk1vY2tTb2NrZXQuQ09OTkVDVElORztcbiAgdGhpcy5zZXJ2aWNlID0gX2hlbHBlcnNHbG9iYWxDb250ZXh0MlsnZGVmYXVsdCddLk1vY2tTb2NrZXQuc2VydmljZXNbdGhpcy51cmxdO1xuXG4gIHRoaXMuX2V2ZW50SGFuZGxlcnMgPSB7fTtcblxuICAoMCwgX2hlbHBlcnNXZWJzb2NrZXRQcm9wZXJ0aWVzMlsnZGVmYXVsdCddKSh0aGlzKTtcblxuICAoMCwgX2hlbHBlcnNEZWxheTJbJ2RlZmF1bHQnXSkoZnVuY3Rpb24gKCkge1xuICAgIC8vIExldCB0aGUgc2VydmljZSBrbm93IHRoYXQgd2UgYXJlIGJvdGggcmVhZHkgdG8gY2hhbmdlIG91ciByZWFkeSBzdGF0ZSBhbmQgdGhhdFxuICAgIC8vIHRoaXMgY2xpZW50IGlzIGNvbm5lY3RpbmcgdG8gdGhlIG1vY2sgc2VydmVyLlxuICAgIHRoaXMuc2VydmljZS5jbGllbnRJc0Nvbm5lY3RpbmcodGhpcywgdGhpcy5fdXBkYXRlUmVhZHlTdGF0ZSk7XG4gIH0sIHRoaXMpO1xufVxuXG5Nb2NrU29ja2V0LkNPTk5FQ1RJTkcgPSAwO1xuTW9ja1NvY2tldC5PUEVOID0gMTtcbk1vY2tTb2NrZXQuQ0xPU0lORyA9IDI7XG5Nb2NrU29ja2V0LkNMT1NFRCA9IDM7XG5Nb2NrU29ja2V0LnNlcnZpY2VzID0ge307XG5cbk1vY2tTb2NrZXQucHJvdG90eXBlID0ge1xuXG4gIC8qXG4gICogSG9sZHMgdGhlIG9uKioqIGNhbGxiYWNrIGZ1bmN0aW9ucy4gVGhlc2UgYXJlIHJlYWxseSBqdXN0IGZvciB0aGUgY3VzdG9tXG4gICogZ2V0dGVycyB0aGF0IGFyZSBkZWZpbmVkIGluIHRoZSBoZWxwZXJzL3dlYnNvY2tldC1wcm9wZXJ0aWVzLiBBY2Nlc3NpbmcgdGhlc2UgcHJvcGVydGllcyBpcyBub3QgYWR2aXNlZC5cbiAgKi9cbiAgX29ub3BlbjogbnVsbCxcbiAgX29ubWVzc2FnZTogbnVsbCxcbiAgX29uZXJyb3I6IG51bGwsXG4gIF9vbmNsb3NlOiBudWxsLFxuXG4gIC8qXG4gICogVGhpcyBob2xkcyByZWZlcmVuY2UgdG8gdGhlIHNlcnZpY2Ugb2JqZWN0LiBUaGUgc2VydmljZSBvYmplY3QgaXMgaG93IHdlIGNhblxuICAqIGNvbW11bmljYXRlIHdpdGggdGhlIGJhY2tlbmQgdmlhIHRoZSBwdWIvc3ViIG1vZGVsLlxuICAqXG4gICogVGhlIHNlcnZpY2UgaGFzIHByb3BlcnRpZXMgd2hpY2ggd2UgY2FuIHVzZSB0byBvYnNlcnZlIG9yIG5vdGlmaXkgd2l0aC5cbiAgKiB0aGlzLnNlcnZpY2Uubm90aWZ5KCdmb28nKSAmIHRoaXMuc2VydmljZS5vYnNlcnZlKCdmb28nLCBjYWxsYmFjaywgY29udGV4dClcbiAgKi9cbiAgc2VydmljZTogbnVsbCxcblxuICAvKlxuICAqIEludGVybmFsIHN0b3JhZ2UgZm9yIGV2ZW50IGhhbmRsZXJzLiBCYXNpY2FsbHksIHRoZXJlIGNvdWxkIGJlIG1vcmUgdGhhbiBvbmVcbiAgKiBoYW5kbGVyIHBlciBldmVudCBzbyB3ZSBzdG9yZSB0aGVtIGFsbCBpbiBhcnJheS5cbiAgKi9cbiAgX2V2ZW50SGFuZGxlcnM6IHt9LFxuXG4gIC8qXG4gICogVGhpcyBpcyBhIG1vY2sgZm9yIEV2ZW50VGFyZ2V0J3MgYWRkRXZlbnRMaXN0ZW5lciBtZXRob2QuIEEgYml0IG5haXZlIGFuZFxuICAqIGRvZXNuJ3QgaW1wbGVtZW50IHRoaXJkIHVzZUNhcHR1cmUgcGFyYW1ldGVyIGJ1dCBzaG91bGQgYmUgZW5vdWdoIGZvciBtb3N0XG4gICogKGlmIG5vdCBhbGwpIGNhc2VzLlxuICAqXG4gICogQHBhcmFtIHtldmVudDogc3RyaW5nfTogRXZlbnQgbmFtZS5cbiAgKiBAcGFyYW0ge2hhbmRsZXI6IGZ1bmN0aW9ufTogQW55IGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBldmVudCBoYW5kbGluZy5cbiAgKi9cbiAgYWRkRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlcikge1xuICAgIGlmICghdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0pIHtcbiAgICAgIHRoaXMuX2V2ZW50SGFuZGxlcnNbZXZlbnRdID0gW107XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB0aGlzWydvbicgKyBldmVudF0gPSBmdW5jdGlvbiAoZXZlbnRPYmplY3QpIHtcbiAgICAgICAgc2VsZi5kaXNwYXRjaEV2ZW50KGV2ZW50T2JqZWN0KTtcbiAgICAgIH07XG4gICAgfVxuICAgIHRoaXMuX2V2ZW50SGFuZGxlcnNbZXZlbnRdLnB1c2goaGFuZGxlcik7XG4gIH0sXG5cbiAgLypcbiAgKiBUaGlzIGlzIGEgbW9jayBmb3IgRXZlbnRUYXJnZXQncyByZW1vdmVFdmVudExpc3RlbmVyIG1ldGhvZC4gQSBiaXQgbmFpdmUgYW5kXG4gICogZG9lc24ndCBpbXBsZW1lbnQgdGhpcmQgdXNlQ2FwdHVyZSBwYXJhbWV0ZXIgYnV0IHNob3VsZCBiZSBlbm91Z2ggZm9yIG1vc3RcbiAgKiAoaWYgbm90IGFsbCkgY2FzZXMuXG4gICpcbiAgKiBAcGFyYW0ge2V2ZW50OiBzdHJpbmd9OiBFdmVudCBuYW1lLlxuICAqIEBwYXJhbSB7aGFuZGxlcjogZnVuY3Rpb259OiBBbnkgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIGV2ZW50IGhhbmRsaW5nLiBTaG91bGRcbiAgKiBiZSBvbmUgb2YgdGhlIGZ1bmN0aW9ucyB1c2VkIGluIHRoZSBwcmV2aW91cyBjYWxscyBvZiBhZGRFdmVudExpc3RlbmVyIG1ldGhvZC5cbiAgKi9cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24gcmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlcikge1xuICAgIGlmICghdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGhhbmRsZXJzID0gdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF07XG4gICAgaGFuZGxlcnMuc3BsaWNlKGhhbmRsZXJzLmluZGV4T2YoaGFuZGxlciksIDEpO1xuICAgIGlmICghaGFuZGxlcnMubGVuZ3RoKSB7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF07XG4gICAgICBkZWxldGUgdGhpc1snb24nICsgZXZlbnRdO1xuICAgIH1cbiAgfSxcblxuICAvKlxuICAqIFRoaXMgaXMgYSBtb2NrIGZvciBFdmVudFRhcmdldCdzIGRpc3BhdGNoRXZlbnQgbWV0aG9kLlxuICAqXG4gICogQHBhcmFtIHtldmVudDogTWVzc2FnZUV2ZW50fTogU29tZSBldmVudCwgZWl0aGVyIG5hdGl2ZSBNZXNzYWdlRXZlbnQgb3IgYW4gb2JqZWN0XG4gICogcmV0dXJuZWQgYnkgcmVxdWlyZSgnLi9oZWxwZXJzL21lc3NhZ2UtZXZlbnQnKVxuICAqL1xuICBkaXNwYXRjaEV2ZW50OiBmdW5jdGlvbiBkaXNwYXRjaEV2ZW50KGV2ZW50KSB7XG4gICAgdmFyIGhhbmRsZXJzID0gdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudC50eXBlXTtcbiAgICBpZiAoIWhhbmRsZXJzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGhhbmRsZXJzW2ldLmNhbGwodGhpcywgZXZlbnQpO1xuICAgIH1cbiAgfSxcblxuICAvKlxuICAqIFRoaXMgaXMgYSBtb2NrIGZvciB0aGUgbmF0aXZlIHNlbmQgZnVuY3Rpb24gZm91bmQgb24gdGhlIFdlYlNvY2tldCBvYmplY3QuIEl0IG5vdGlmaWVzIHRoZVxuICAqIHNlcnZpY2UgdGhhdCBpdCBoYXMgc2VudCBhIG1lc3NhZ2UuXG4gICpcbiAgKiBAcGFyYW0ge2RhdGE6ICp9OiBBbnkgamF2YXNjcmlwdCBvYmplY3Qgd2hpY2ggd2lsbCBiZSBjcmFmdGVkIGludG8gYSBNZXNzYWdlT2JqZWN0LlxuICAqL1xuICBzZW5kOiBmdW5jdGlvbiBzZW5kKGRhdGEpIHtcbiAgICAoMCwgX2hlbHBlcnNEZWxheTJbJ2RlZmF1bHQnXSkoZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXJ2aWNlLnNlbmRNZXNzYWdlVG9TZXJ2ZXIoKDAsIF9oZWxwZXJzTWVzc2FnZUV2ZW50MlsnZGVmYXVsdCddKSgnbWVzc2FnZScsIGRhdGEsIHRoaXMudXJsKSk7XG4gICAgfSwgdGhpcyk7XG4gIH0sXG5cbiAgLypcbiAgKiBUaGlzIGlzIGEgbW9jayBmb3IgdGhlIG5hdGl2ZSBjbG9zZSBmdW5jdGlvbiBmb3VuZCBvbiB0aGUgV2ViU29ja2V0IG9iamVjdC4gSXQgbm90aWZpZXMgdGhlXG4gICogc2VydmljZSB0aGF0IGl0IGlzIGNsb3NpbmcgdGhlIGNvbm5lY3Rpb24uXG4gICovXG4gIGNsb3NlOiBmdW5jdGlvbiBjbG9zZSgpIHtcbiAgICAoMCwgX2hlbHBlcnNEZWxheTJbJ2RlZmF1bHQnXSkoZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXJ2aWNlLmNsb3NlQ29ubmVjdGlvbkZyb21DbGllbnQoKDAsIF9oZWxwZXJzTWVzc2FnZUV2ZW50MlsnZGVmYXVsdCddKSgnY2xvc2UnLCBudWxsLCB0aGlzLnVybCksIHRoaXMpO1xuICAgIH0sIHRoaXMpO1xuICB9LFxuXG4gIC8qXG4gICogVGhpcyBpcyBhIHByaXZhdGUgbWV0aG9kIHRoYXQgY2FuIGJlIHVzZWQgdG8gY2hhbmdlIHRoZSByZWFkeVN0YXRlLiBUaGlzIGlzIHVzZWRcbiAgKiBsaWtlIHRoaXM6IHRoaXMucHJvdG9jb2wuc3ViamVjdC5vYnNlcnZlKCd1cGRhdGVSZWFkeVN0YXRlJywgdGhpcy5fdXBkYXRlUmVhZHlTdGF0ZSwgdGhpcyk7XG4gICogc28gdGhhdCB0aGUgc2VydmljZSBhbmQgdGhlIHNlcnZlciBjYW4gY2hhbmdlIHRoZSByZWFkeVN0YXRlIHNpbXBseSBiZSBub3RpZmluZyBhIG5hbWVzcGFjZS5cbiAgKlxuICAqIEBwYXJhbSB7bmV3UmVhZHlTdGF0ZTogbnVtYmVyfTogVGhlIG5ldyByZWFkeSBzdGF0ZS4gTXVzdCBiZSAwLTRcbiAgKi9cbiAgX3VwZGF0ZVJlYWR5U3RhdGU6IGZ1bmN0aW9uIF91cGRhdGVSZWFkeVN0YXRlKG5ld1JlYWR5U3RhdGUpIHtcbiAgICBpZiAobmV3UmVhZHlTdGF0ZSA+PSAwICYmIG5ld1JlYWR5U3RhdGUgPD0gNCkge1xuICAgICAgdGhpcy5yZWFkeVN0YXRlID0gbmV3UmVhZHlTdGF0ZTtcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IE1vY2tTb2NrZXQ7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfaGVscGVyc01lc3NhZ2VFdmVudCA9IHJlcXVpcmUoJy4vaGVscGVycy9tZXNzYWdlLWV2ZW50Jyk7XG5cbnZhciBfaGVscGVyc01lc3NhZ2VFdmVudDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWxwZXJzTWVzc2FnZUV2ZW50KTtcblxudmFyIF9oZWxwZXJzR2xvYmFsQ29udGV4dCA9IHJlcXVpcmUoJy4vaGVscGVycy9nbG9iYWwtY29udGV4dCcpO1xuXG52YXIgX2hlbHBlcnNHbG9iYWxDb250ZXh0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hlbHBlcnNHbG9iYWxDb250ZXh0KTtcblxuZnVuY3Rpb24gU29ja2V0U2VydmljZSgpIHtcbiAgdGhpcy5saXN0ID0ge307XG59XG5cblNvY2tldFNlcnZpY2UucHJvdG90eXBlID0ge1xuICBzZXJ2ZXI6IG51bGwsXG5cbiAgLypcbiAgKiBUaGlzIG5vdGlmaWVzIHRoZSBtb2NrIHNlcnZlciB0aGF0IGEgY2xpZW50IGlzIGNvbm5lY3RpbmcgYW5kIGFsc28gc2V0cyB1cFxuICAqIHRoZSByZWFkeSBzdGF0ZSBvYnNlcnZlci5cbiAgKlxuICAqIEBwYXJhbSB7Y2xpZW50OiBvYmplY3R9IHRoZSBjb250ZXh0IG9mIHRoZSBjbGllbnRcbiAgKiBAcGFyYW0ge3JlYWR5U3RhdGVGdW5jdGlvbjogZnVuY3Rpb259IHRoZSBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgaW52b2tlZCBvbiBhIHJlYWR5IHN0YXRlIGNoYW5nZVxuICAqL1xuICBjbGllbnRJc0Nvbm5lY3Rpbmc6IGZ1bmN0aW9uIGNsaWVudElzQ29ubmVjdGluZyhjbGllbnQsIHJlYWR5U3RhdGVGdW5jdGlvbikge1xuICAgIHRoaXMub2JzZXJ2ZSgndXBkYXRlUmVhZHlTdGF0ZScsIHJlYWR5U3RhdGVGdW5jdGlvbiwgY2xpZW50KTtcblxuICAgIC8vIGlmIHRoZSBzZXJ2ZXIgaGFzIG5vdCBiZWVuIHNldCB0aGVuIHdlIG5vdGlmeSB0aGUgb25jbG9zZSBtZXRob2Qgb2YgdGhpcyBjbGllbnRcbiAgICBpZiAoIXRoaXMuc2VydmVyKSB7XG4gICAgICB0aGlzLm5vdGlmeU9ubHlGb3IoY2xpZW50LCAndXBkYXRlUmVhZHlTdGF0ZScsIF9oZWxwZXJzR2xvYmFsQ29udGV4dDJbJ2RlZmF1bHQnXS5Nb2NrU29ja2V0LkNMT1NFRCk7XG4gICAgICB0aGlzLm5vdGlmeU9ubHlGb3IoY2xpZW50LCAnY2xpZW50T25FcnJvcicsICgwLCBfaGVscGVyc01lc3NhZ2VFdmVudDJbJ2RlZmF1bHQnXSkoJ2Vycm9yJywgbnVsbCwgY2xpZW50LnVybCkpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMubm90aWZ5T25seUZvcihjbGllbnQsICd1cGRhdGVSZWFkeVN0YXRlJywgX2hlbHBlcnNHbG9iYWxDb250ZXh0MlsnZGVmYXVsdCddLk1vY2tTb2NrZXQuT1BFTik7XG4gICAgdGhpcy5ub3RpZnkoJ2NsaWVudEhhc0pvaW5lZCcsIHRoaXMuc2VydmVyKTtcbiAgICB0aGlzLm5vdGlmeU9ubHlGb3IoY2xpZW50LCAnY2xpZW50T25PcGVuJywgKDAsIF9oZWxwZXJzTWVzc2FnZUV2ZW50MlsnZGVmYXVsdCddKSgnb3BlbicsIG51bGwsIHRoaXMuc2VydmVyLnVybCkpO1xuICB9LFxuXG4gIC8qXG4gICogQ2xvc2VzIGEgY29ubmVjdGlvbiBmcm9tIHRoZSBzZXJ2ZXIncyBwZXJzcGVjdGl2ZS4gVGhpcyBzaG91bGRcbiAgKiBjbG9zZSBhbGwgY2xpZW50cy5cbiAgKlxuICAqIEBwYXJhbSB7bWVzc2FnZUV2ZW50OiBvYmplY3R9IHRoZSBtb2NrIG1lc3NhZ2UgZXZlbnQuXG4gICovXG4gIGNsb3NlQ29ubmVjdGlvbkZyb21TZXJ2ZXI6IGZ1bmN0aW9uIGNsb3NlQ29ubmVjdGlvbkZyb21TZXJ2ZXIobWVzc2FnZUV2ZW50KSB7XG4gICAgdGhpcy5ub3RpZnkoJ3VwZGF0ZVJlYWR5U3RhdGUnLCBfaGVscGVyc0dsb2JhbENvbnRleHQyWydkZWZhdWx0J10uTW9ja1NvY2tldC5DTE9TSU5HKTtcbiAgICB0aGlzLm5vdGlmeSgnY2xpZW50T25jbG9zZScsIG1lc3NhZ2VFdmVudCk7XG4gICAgdGhpcy5ub3RpZnkoJ3VwZGF0ZVJlYWR5U3RhdGUnLCBfaGVscGVyc0dsb2JhbENvbnRleHQyWydkZWZhdWx0J10uTW9ja1NvY2tldC5DTE9TRUQpO1xuICAgIHRoaXMubm90aWZ5KCdjbGllbnRIYXNMZWZ0Jyk7XG4gIH0sXG5cbiAgLypcbiAgKiBDbG9zZXMgYSBjb25uZWN0aW9uIGZyb20gdGhlIGNsaWVudHMgcGVyc3BlY3RpdmUuIFRoaXNcbiAgKiBzaG91bGQgb25seSBjbG9zZSB0aGUgY2xpZW50IHdobyBpbml0aWF0ZWQgdGhlIGNsb3NlIGFuZCBub3RcbiAgKiBhbGwgb2YgdGhlIG90aGVyIGNsaWVudHMuXG4gICpcbiAgKiBAcGFyYW0ge21lc3NhZ2VFdmVudDogb2JqZWN0fSB0aGUgbW9jayBtZXNzYWdlIGV2ZW50LlxuICAqIEBwYXJhbSB7Y2xpZW50OiBvYmplY3R9IHRoZSBjb250ZXh0IG9mIHRoZSBjbGllbnRcbiAgKi9cbiAgY2xvc2VDb25uZWN0aW9uRnJvbUNsaWVudDogZnVuY3Rpb24gY2xvc2VDb25uZWN0aW9uRnJvbUNsaWVudChtZXNzYWdlRXZlbnQsIGNsaWVudCkge1xuICAgIGlmIChjbGllbnQucmVhZHlTdGF0ZSA9PT0gX2hlbHBlcnNHbG9iYWxDb250ZXh0MlsnZGVmYXVsdCddLk1vY2tTb2NrZXQuT1BFTikge1xuICAgICAgdGhpcy5ub3RpZnlPbmx5Rm9yKGNsaWVudCwgJ3VwZGF0ZVJlYWR5U3RhdGUnLCBfaGVscGVyc0dsb2JhbENvbnRleHQyWydkZWZhdWx0J10uTW9ja1NvY2tldC5DTE9TSU5HKTtcbiAgICAgIHRoaXMubm90aWZ5T25seUZvcihjbGllbnQsICdjbGllbnRPbmNsb3NlJywgbWVzc2FnZUV2ZW50KTtcbiAgICAgIHRoaXMubm90aWZ5T25seUZvcihjbGllbnQsICd1cGRhdGVSZWFkeVN0YXRlJywgX2hlbHBlcnNHbG9iYWxDb250ZXh0MlsnZGVmYXVsdCddLk1vY2tTb2NrZXQuQ0xPU0VEKTtcbiAgICAgIHRoaXMubm90aWZ5KCdjbGllbnRIYXNMZWZ0Jyk7XG4gICAgfVxuICB9LFxuXG4gIC8qXG4gICogTm90aWZpZXMgdGhlIG1vY2sgc2VydmVyIHRoYXQgYSBjbGllbnQgaGFzIHNlbnQgYSBtZXNzYWdlLlxuICAqXG4gICogQHBhcmFtIHttZXNzYWdlRXZlbnQ6IG9iamVjdH0gdGhlIG1vY2sgbWVzc2FnZSBldmVudC5cbiAgKi9cbiAgc2VuZE1lc3NhZ2VUb1NlcnZlcjogZnVuY3Rpb24gc2VuZE1lc3NhZ2VUb1NlcnZlcihtZXNzYWdlRXZlbnQpIHtcbiAgICB0aGlzLm5vdGlmeSgnY2xpZW50SGFzU2VudE1lc3NhZ2UnLCBtZXNzYWdlRXZlbnQuZGF0YSwgbWVzc2FnZUV2ZW50KTtcbiAgfSxcblxuICAvKlxuICAqIE5vdGlmaWVzIGFsbCBjbGllbnRzIHRoYXQgdGhlIHNlcnZlciBoYXMgc2VudCBhIG1lc3NhZ2VcbiAgKlxuICAqIEBwYXJhbSB7bWVzc2FnZUV2ZW50OiBvYmplY3R9IHRoZSBtb2NrIG1lc3NhZ2UgZXZlbnQuXG4gICovXG4gIHNlbmRNZXNzYWdlVG9DbGllbnRzOiBmdW5jdGlvbiBzZW5kTWVzc2FnZVRvQ2xpZW50cyhtZXNzYWdlRXZlbnQpIHtcbiAgICB0aGlzLm5vdGlmeSgnY2xpZW50T25NZXNzYWdlJywgbWVzc2FnZUV2ZW50KTtcbiAgfSxcblxuICAvKlxuICAqIFNldHVwIHRoZSBjYWxsYmFjayBmdW5jdGlvbiBvYnNlcnZlcnMgZm9yIGJvdGggdGhlIHNlcnZlciBhbmQgY2xpZW50LlxuICAqXG4gICogQHBhcmFtIHtvYnNlcnZlcktleTogc3RyaW5nfSBlaXRoZXI6IGNvbm5lY3Rpb24sIG1lc3NhZ2Ugb3IgY2xvc2VcbiAgKiBAcGFyYW0ge2NhbGxiYWNrOiBmdW5jdGlvbn0gdGhlIGNhbGxiYWNrIHRvIGJlIGludm9rZWRcbiAgKiBAcGFyYW0ge3NlcnZlcjogb2JqZWN0fSB0aGUgY29udGV4dCBvZiB0aGUgc2VydmVyXG4gICovXG4gIHNldENhbGxiYWNrT2JzZXJ2ZXI6IGZ1bmN0aW9uIHNldENhbGxiYWNrT2JzZXJ2ZXIob2JzZXJ2ZXJLZXksIGNhbGxiYWNrLCBzZXJ2ZXIpIHtcbiAgICB0aGlzLm9ic2VydmUob2JzZXJ2ZXJLZXksIGNhbGxiYWNrLCBzZXJ2ZXIpO1xuICB9LFxuXG4gIC8qXG4gICogQmluZHMgYSBjYWxsYmFjayB0byBhIG5hbWVzcGFjZS4gSWYgbm90aWZ5IGlzIGNhbGxlZCBvbiBhIG5hbWVzcGFjZSBhbGwgXCJvYnNlcnZlcnNcIiB3aWxsIGJlXG4gICogZmlyZWQgd2l0aCB0aGUgY29udGV4dCB0aGF0IGlzIHBhc3NlZCBpbi5cbiAgKlxuICAqIEBwYXJhbSB7bmFtZXNwYWNlOiBzdHJpbmd9XG4gICogQHBhcmFtIHtjYWxsYmFjazogZnVuY3Rpb259XG4gICogQHBhcmFtIHtjb250ZXh0OiBvYmplY3R9XG4gICovXG4gIG9ic2VydmU6IGZ1bmN0aW9uIG9ic2VydmUobmFtZXNwYWNlLCBjYWxsYmFjaywgY29udGV4dCkge1xuXG4gICAgLy8gTWFrZSBzdXJlIHRoZSBhcmd1bWVudHMgYXJlIG9mIHRoZSBjb3JyZWN0IHR5cGVcbiAgICBpZiAodHlwZW9mIG5hbWVzcGFjZSAhPT0gJ3N0cmluZycgfHwgdHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nIHx8IGNvbnRleHQgJiYgdHlwZW9mIGNvbnRleHQgIT09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gSWYgYSBuYW1lc3BhY2UgaGFzIG5vdCBiZWVuIGNyZWF0ZWQgYmVmb3JlIHRoZW4gd2UgbmVlZCB0byBcImluaXRpYWxpemVcIiB0aGUgbmFtZXNwYWNlXG4gICAgaWYgKCF0aGlzLmxpc3RbbmFtZXNwYWNlXSkge1xuICAgICAgdGhpcy5saXN0W25hbWVzcGFjZV0gPSBbXTtcbiAgICB9XG5cbiAgICB0aGlzLmxpc3RbbmFtZXNwYWNlXS5wdXNoKHsgY2FsbGJhY2s6IGNhbGxiYWNrLCBjb250ZXh0OiBjb250ZXh0IH0pO1xuICB9LFxuXG4gIC8qXG4gICogUmVtb3ZlIGFsbCBvYnNlcnZlcnMgZnJvbSBhIGdpdmVuIG5hbWVzcGFjZS5cbiAgKlxuICAqIEBwYXJhbSB7bmFtZXNwYWNlOiBzdHJpbmd9IFRoZSBuYW1lc3BhY2UgdG8gY2xlYXIuXG4gICovXG4gIGNsZWFyQWxsOiBmdW5jdGlvbiBjbGVhckFsbChuYW1lc3BhY2UpIHtcblxuICAgIGlmICghdGhpcy52ZXJpZnlOYW1lc3BhY2VBcmcobmFtZXNwYWNlKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMubGlzdFtuYW1lc3BhY2VdID0gW107XG4gIH0sXG5cbiAgLypcbiAgKiBOb3RpZnkgYWxsIGNhbGxiYWNrcyB0aGF0IGhhdmUgYmVlbiBib3VuZCB0byB0aGUgZ2l2ZW4gbmFtZXNwYWNlLlxuICAqXG4gICogQHBhcmFtIHtuYW1lc3BhY2U6IHN0cmluZ30gVGhlIG5hbWVzcGFjZSB0byBub3RpZnkgb2JzZXJ2ZXJzIG9uLlxuICAqIEBwYXJhbSB7bmFtZXNwYWNlOiB1cmx9IFRoZSB1cmwgdG8gbm90aWZ5IG9ic2VydmVycyBvbi5cbiAgKi9cbiAgbm90aWZ5OiBmdW5jdGlvbiBub3RpZnkobmFtZXNwYWNlKSB7XG5cbiAgICAvLyBUaGlzIHN0cmlwcyB0aGUgbmFtZXNwYWNlIGZyb20gdGhlIGxpc3Qgb2YgYXJncyBhcyB3ZSBkb250IHdhbnQgdG8gcGFzcyB0aGF0IGludG8gdGhlIGNhbGxiYWNrLlxuICAgIHZhciBhcmd1bWVudHNGb3JDYWxsYmFjayA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cbiAgICBpZiAoIXRoaXMudmVyaWZ5TmFtZXNwYWNlQXJnKG5hbWVzcGFjZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBMb29wIG92ZXIgYWxsIG9mIHRoZSBvYnNlcnZlcnMgYW5kIGZpcmUgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHdpdGggdGhlIGNvbnRleHQuXG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMubGlzdFtuYW1lc3BhY2VdLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB0aGlzLmxpc3RbbmFtZXNwYWNlXVtpXS5jYWxsYmFjay5hcHBseSh0aGlzLmxpc3RbbmFtZXNwYWNlXVtpXS5jb250ZXh0LCBhcmd1bWVudHNGb3JDYWxsYmFjayk7XG4gICAgfVxuICB9LFxuXG4gIC8qXG4gICogTm90aWZ5IG9ubHkgdGhlIGNhbGxiYWNrIG9mIHRoZSBnaXZlbiBjb250ZXh0IGFuZCBuYW1lc3BhY2UuXG4gICpcbiAgKiBAcGFyYW0ge2NvbnRleHQ6IG9iamVjdH0gdGhlIGNvbnRleHQgdG8gbWF0Y2ggYWdhaW5zdC5cbiAgKiBAcGFyYW0ge25hbWVzcGFjZTogc3RyaW5nfSBUaGUgbmFtZXNwYWNlIHRvIG5vdGlmeSBvYnNlcnZlcnMgb24uXG4gICovXG4gIG5vdGlmeU9ubHlGb3I6IGZ1bmN0aW9uIG5vdGlmeU9ubHlGb3IoY29udGV4dCwgbmFtZXNwYWNlKSB7XG5cbiAgICAvLyBUaGlzIHN0cmlwcyB0aGUgbmFtZXNwYWNlIGZyb20gdGhlIGxpc3Qgb2YgYXJncyBhcyB3ZSBkb250IHdhbnQgdG8gcGFzcyB0aGF0IGludG8gdGhlIGNhbGxiYWNrLlxuICAgIHZhciBhcmd1bWVudHNGb3JDYWxsYmFjayA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG5cbiAgICBpZiAoIXRoaXMudmVyaWZ5TmFtZXNwYWNlQXJnKG5hbWVzcGFjZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBMb29wIG92ZXIgYWxsIG9mIHRoZSBvYnNlcnZlcnMgYW5kIGZpcmUgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHdpdGggdGhlIGNvbnRleHQuXG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMubGlzdFtuYW1lc3BhY2VdLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpZiAodGhpcy5saXN0W25hbWVzcGFjZV1baV0uY29udGV4dCA9PT0gY29udGV4dCkge1xuICAgICAgICB0aGlzLmxpc3RbbmFtZXNwYWNlXVtpXS5jYWxsYmFjay5hcHBseSh0aGlzLmxpc3RbbmFtZXNwYWNlXVtpXS5jb250ZXh0LCBhcmd1bWVudHNGb3JDYWxsYmFjayk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qXG4gICogVmVyaWZpZXMgdGhhdCB0aGUgbmFtZXNwYWNlIGlzIHZhbGlkLlxuICAqXG4gICogQHBhcmFtIHtuYW1lc3BhY2U6IHN0cmluZ30gVGhlIG5hbWVzcGFjZSB0byB2ZXJpZnkuXG4gICovXG4gIHZlcmlmeU5hbWVzcGFjZUFyZzogZnVuY3Rpb24gdmVyaWZ5TmFtZXNwYWNlQXJnKG5hbWVzcGFjZSkge1xuICAgIGlmICh0eXBlb2YgbmFtZXNwYWNlICE9PSAnc3RyaW5nJyB8fCAhdGhpcy5saXN0W25hbWVzcGFjZV0pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gU29ja2V0U2VydmljZTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyJdfQ==
