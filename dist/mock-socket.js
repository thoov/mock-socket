(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Starting point for browserify and throws important objects into the window object
var Service       = require('./service');
var MockServer    = require('./mock-server');
var MockSocket    = require('./mock-socket');
var globalContext = require('./helpers/global-context');

globalContext.SocketService = Service;
globalContext.MockSocket    = MockSocket;
globalContext.MockServer    = MockServer;

},{"./helpers/global-context":3,"./mock-server":7,"./mock-socket":8,"./service":9}],2:[function(require,module,exports){
var globalContext = require('./global-context');

/**
* This delay allows the thread to finish assigning its on* methods
* before invoking the delay callback. This is purely a timing hack.
* http://geekabyte.blogspot.com/2014/01/javascript-effect-of-setting-settimeout.html
*
* @param {callback: function} the callback which will be invoked after the timeout
* @parma {context: object} the context in which to invoke the function
*/
function delay(callback, context) {
  globalContext.setTimeout(function(context) {
    callback.call(context);
  }, 4, context);
}

module.exports = delay;

},{"./global-context":3}],3:[function(require,module,exports){
(function (global){
/*
* Determines the global context. This should be either window (in the)
* case where we are in a browser) or global (in the case where we are in
* node)
*/
var globalContext;

if(typeof window === 'undefined') {
    globalContext = global;
}
else {
    globalContext = window;
}

if (!globalContext) {
  throw new Error('Unable to set the global context to either window or global.');
}

module.exports = globalContext;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
/*
* This is a mock websocket event message that is passed into the onopen,
* opmessage, etc functions.
*
* @param {name: string} The name of the event
* @param {data: *} The data to send.
* @param {origin: string} The url of the place where the event is originating.
*/
function socketEventMessage(name, data, origin) {
	var bubbles         = false;
	var cancelable      = false;
	var lastEventId     = '';
	var source          = null;
	var ports           = null;
	var targetPlacehold = null;

	try {
		var messageEvent = new MessageEvent(name);
		messageEvent.initMessageEvent(name, bubbles, cancelable, data, origin, lastEventId);

		Object.defineProperties(messageEvent, {
			target:  {
				get: function() { return targetPlacehold; },
				set: function(value) { targetPlacehold = value; }
			},
			srcElement: {
				get: function() { return this.target; }
			},
			currentTarget: {
				get: function() { return this.target; }
			}
		});
	}
	catch (e) {
		// We are unable to create a MessageEvent Object. This should only be happening in PhantomJS.
		var messageEvent = {
			type             : name,
			bubbles          : bubbles,
			cancelable       : cancelable,
			data             : data,
			origin           : origin,
			lastEventId      : lastEventId,
			source           : source,
			ports            : ports,
			defaultPrevented : false,
			returnValue      : true,
			clipboardData    : undefined
		};

		Object.defineProperties(messageEvent, {
			target:  {
				get: function() { return targetPlacehold; },
				set: function(value) { targetPlacehold = value; }
			},
			srcElement: {
				get: function() { return this.target; }
			},
			currentTarget: {
				get: function() { return this.target; }
			}
		});
	}

	return messageEvent;
}

module.exports = socketEventMessage;

},{}],5:[function(require,module,exports){
/**
* The native websocket object will transform urls without a pathname to have just a /.
* As an example: ws://localhost:8080 would actually be ws://localhost:8080/ but ws://example.com/foo would not
* change. This function does this transformation to stay inline with the native websocket implementation.
*
* @param {url: string} The url to transform.
*/
function urlTransform(url) {
  var a = document.createElement('a');
  a.href = url;

  // Note: that the a.pathname === '' is for phantomJS
  if((a.pathname === '/' || a.pathname === '') && url.slice(-1) !== '/') {
    url += '/';
  }

  return url;
}

module.exports = urlTransform;

},{}],6:[function(require,module,exports){
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
function webSocketProperties(websocket) {
  var eventMessageSource = function(callback) {
    return function(event) {
      event.target = websocket;
      callback.apply(websocket, arguments);
    }
  };

  Object.defineProperties(websocket, {
    onopen: {
      enumerable: true,
      get: function() { return this._onopen; },
      set: function(callback) {
        this._onopen = eventMessageSource(callback);
        this.service.setCallbackObserver('clientOnOpen', this._onopen, websocket);
      }
    },
    onmessage: {
      enumerable: true,
      get: function() { return this._onmessage; },
      set: function(callback) {
        this._onmessage = eventMessageSource(callback);
        this.service.setCallbackObserver('clientOnMessage', this._onmessage, websocket);
      }
    },
    onclose: {
      enumerable: true,
      get: function() { return this._onclose; },
      set: function(callback) {
        this._onclose = eventMessageSource(callback);
        this.service.setCallbackObserver('clientOnclose', this._onclose, websocket);
      }
    },
    onerror: {
      enumerable: true,
      get: function() { return this._onerror; },
      set: function(callback) {
        this._onerror = eventMessageSource(callback);
        this.service.setCallbackObserver('clientOnError', this._onerror, websocket);
      }
    }
  });
};

module.exports = webSocketProperties;

},{}],7:[function(require,module,exports){
var Service            = require('./service');
var delay              = require('./helpers/delay');
var urlTransform       = require('./helpers/url-transform');
var socketMessageEvent = require('./helpers/message-event');
var globalContext      = require('./helpers/global-context');

function MockServer(url) {
  var service = new Service();
  this.url    = urlTransform(url);

  globalContext.MockSocket.services[this.url] = service;

  this.service   = service;
  service.server = this;
}

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
  on: function(type, callback) {
    var observerKey;

    if(typeof callback !== 'function' || typeof type !== 'string') {
      return false;
    }

    switch(type) {
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
    if(typeof observerKey === 'string') {
      this.service.setCallbackObserver(observerKey, callback, this);
    }
  },

  /*
  * This send function will notify all mock clients via their onmessage callbacks that the server
  * has a message for them.
  *
  * @param {data: *}: Any javascript object which will be crafted into a MessageObject.
  */
  send: function(data) {
    delay(function() {
      this.service.sendMessageToClients(socketMessageEvent('message', data, this.url));
    }, this);
  },

  /*
  * Notifies all mock clients that the server is closing and their onclose callbacks should fire.
  */
  close: function() {
    delay(function() {
      this.service.closeConnectionFromServer(socketMessageEvent('close', null, this.url));
    }, this);
  }
};

module.exports = MockServer;

},{"./helpers/delay":2,"./helpers/global-context":3,"./helpers/message-event":4,"./helpers/url-transform":5,"./service":9}],8:[function(require,module,exports){
var delay               = require('./helpers/delay');
var urlTransform        = require('./helpers/url-transform');
var socketMessageEvent  = require('./helpers/message-event');
var globalContext       = require('./helpers/global-context');
var webSocketProperties = require('./helpers/websocket-properties');

function MockSocket(url) {
  this.binaryType = 'blob';
  this.url        = urlTransform(url);
  this.readyState = globalContext.MockSocket.CONNECTING;
  this.service    = globalContext.MockSocket.services[this.url];

  webSocketProperties(this);

  delay(function() {
    // Let the service know that we are both ready to change our ready state and that
    // this client is connecting to the mock server.
    this.service.clientIsConnecting(this, this._updateReadyState);
  }, this);
}

MockSocket.CONNECTING = 0;
MockSocket.OPEN       = 1;
MockSocket.CLOSING    = 2;
MockSocket.LOADING    = 3;
MockSocket.CLOSED     = 4;
MockSocket.services   = {};

MockSocket.prototype = {

  /*
  * Holds the on*** callback functions. These are really just for the custom
  * getters that are defined in the helpers/websocket-properties. Accessing these properties is not advised.
  */
  _onopen    : null,
  _onmessage : null,
  _onerror   : null,
  _onclose   : null,

  /*
  * This holds reference to the service object. The service object is how we can
  * communicate with the backend via the pub/sub model.
  *
  * The service has properties which we can use to observe or notifiy with.
  * this.service.notify('foo') & this.service.observe('foo', callback, context)
  */
  service: null,

  /*
  * This is a mock for the native send function found on the WebSocket object. It notifies the
  * service that it has sent a message.
  *
  * @param {data: *}: Any javascript object which will be crafted into a MessageObject.
  */
  send: function(data) {
    delay(function() {
      this.service.sendMessageToServer(socketMessageEvent('message', data, this.url));
    }, this);
  },

  /*
  * This is a mock for the native close function found on the WebSocket object. It notifies the
  * service that it is closing the connection.
  */
  close: function() {
    delay(function() {
      this.service.closeConnectionFromClient(socketMessageEvent('close', null, this.url), this);
    }, this);
  },

  /*
  * This is a private method that can be used to change the readyState. This is used
  * like this: this.protocol.subject.observe('updateReadyState', this._updateReadyState, this);
  * so that the service and the server can change the readyState simply be notifing a namespace.
  *
  * @param {newReadyState: number}: The new ready state. Must be 0-4
  */
  _updateReadyState: function(newReadyState) {
    if(newReadyState >= 0 && newReadyState <= 4) {
      this.readyState = newReadyState;
    }
  }
};

module.exports = MockSocket;

},{"./helpers/delay":2,"./helpers/global-context":3,"./helpers/message-event":4,"./helpers/url-transform":5,"./helpers/websocket-properties":6}],9:[function(require,module,exports){
var socketMessageEvent = require('./helpers/message-event');
var globalContext      = require('./helpers/global-context');

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
  clientIsConnecting: function(client, readyStateFunction) {
    this.observe('updateReadyState', readyStateFunction, client);

    // if the server has not been set then we notify the onclose method of this client
    if(!this.server) {
      this.notify(client, 'updateReadyState', globalContext.MockSocket.CLOSED);
      this.notifyOnlyFor(client, 'clientOnError');
      return false;
    }

    this.notifyOnlyFor(client, 'updateReadyState', globalContext.MockSocket.OPEN);
    this.notify('clientHasJoined', this.server);
    this.notifyOnlyFor(client, 'clientOnOpen', socketMessageEvent('open', null, this.server.url));
  },

  /*
  * Closes a connection from the server's perspective. This should
  * close all clients.
  *
  * @param {messageEvent: object} the mock message event.
  */
  closeConnectionFromServer: function(messageEvent) {
    this.notify('updateReadyState', globalContext.MockSocket.CLOSING);
    this.notify('clientOnclose', messageEvent);
    this.notify('updateReadyState', globalContext.MockSocket.CLOSED);
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
  closeConnectionFromClient: function(messageEvent, client) {
    this.notifyOnlyFor(client, 'updateReadyState', globalContext.MockSocket.CLOSING);
    this.notifyOnlyFor(client, 'clientOnclose', messageEvent);
    this.notifyOnlyFor(client, 'updateReadyState', globalContext.MockSocket.CLOSED);
    this.notify('clientHasLeft');
  },


  /*
  * Notifies the mock server that a client has sent a message.
  *
  * @param {messageEvent: object} the mock message event.
  */
  sendMessageToServer: function(messageEvent) {
    this.notify('clientHasSentMessage', messageEvent);
  },

  /*
  * Notifies all clients that the server has sent a message
  *
  * @param {messageEvent: object} the mock message event.
  */
  sendMessageToClients: function(messageEvent) {
    this.notify('clientOnMessage', messageEvent);
  },

  /*
  * Setup the callback function observers for both the server and client.
  *
  * @param {observerKey: string} either: connection, message or close
  * @param {callback: function} the callback to be invoked
  * @param {server: object} the context of the server
  */
  setCallbackObserver: function(observerKey, callback, server) {
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
  observe: function(namespace, callback, context) {

    // Make sure the arguments are of the correct type
    if( typeof namespace !== 'string' || typeof callback !== 'function' || (context && typeof context !== 'object')) {
      return false;
    }

    // If a namespace has not been created before then we need to "initialize" the namespace
    if(!this.list[namespace]) {
      this.list[namespace] = [];
    }

    this.list[namespace].push({callback: callback, context: context});
  },

  /*
  * Remove all observers from a given namespace.
  *
  * @param {namespace: string} The namespace to clear.
  */
  clearAll: function(namespace) {

    if(!this.verifyNamespaceArg(namespace)) {
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
  notify: function(namespace) {

    // This strips the namespace from the list of args as we dont want to pass that into the callback.
    var argumentsForCallback = Array.prototype.slice.call(arguments, 1);

    if(!this.verifyNamespaceArg(namespace)) {
      return false;
    }

    // Loop over all of the observers and fire the callback function with the context.
    for(var i = 0, len = this.list[namespace].length; i < len; i++) {
      this.list[namespace][i].callback.apply(this.list[namespace][i].context, argumentsForCallback);
    }
  },

  /*
  * Notify only the callback of the given context and namespace.
  *
  * @param {context: object} the context to match against.
  * @param {namespace: string} The namespace to notify observers on.
  */
  notifyOnlyFor: function(context, namespace) {

    // This strips the namespace from the list of args as we dont want to pass that into the callback.
    var argumentsForCallback = Array.prototype.slice.call(arguments, 2);

    if(!this.verifyNamespaceArg(namespace)) {
      return false;
    }

    // Loop over all of the observers and fire the callback function with the context.
    for(var i = 0, len = this.list[namespace].length; i < len; i++) {
      if(this.list[namespace][i].context === context) {
        this.list[namespace][i].callback.apply(this.list[namespace][i].context, argumentsForCallback);
      }
    }
  },

  /*
  * Verifies that the namespace is valid.
  *
  * @param {namespace: string} The namespace to verify.
  */
  verifyNamespaceArg: function(namespace) {
    if(typeof namespace !== 'string' || !this.list[namespace]) {
      return false;
    }

    return true;
  }
};

module.exports = SocketService;

},{"./helpers/global-context":3,"./helpers/message-event":4}]},{},[1]);
