(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var server = require('./server.js');
var protocol = require('./protocol.js');
var subject = require('./subject.js');
var websocket = require('./websocket.js');

window.MockSocket = websocket;
window.WebSocketServer = server;
window.Protocol = protocol;
window.Subject = subject;

},{"./protocol.js":5,"./server.js":6,"./subject.js":7,"./websocket.js":8}],2:[function(require,module,exports){
/**
* The native websocket object will transform urls without a pathname to have just a /.
* As an example: ws://localhost:8080 would actually be ws://localhost:8080/. This function
* does this transformation to stay inline with the native websocket implementation.
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

},{}],3:[function(require,module,exports){
function webSocketMessage(data, url) {
  var message = {
    currentTarget: {
      url: url
    },
    data: data
  };

  return message;
};

module.exports = webSocketMessage;

},{}],4:[function(require,module,exports){
function webSocketProperties(websocket) {
  /*
  * Defining custom setters for the 4 mocked methods: onopen, onmessage, onerror, and onclose.
  */
  Object.defineProperties(websocket, {
    onopen: {
      enumerable: true,
      get: function() { return websocket._onopen; },
      set: function(callback) {
        websocket._onopen = callback;
        websocket.protocol.subject.observe('clientOnOpen', callback, websocket);
      }
    },
    onmessage: {
      enumerable: true,
      get: function() { return websocket._onmessage; },
      set: function(callback) {
        websocket._onmessage = callback;
        websocket.protocol.subject.observe('clientOnMessage', callback, websocket);
      }
    },
    onclose: {
      enumerable: true,
      get: function() { return websocket._onclose; },
      set: function(callback) {
        websocket._onclose = callback;
        websocket.protocol.subject.observe('clientHasLeft', callback, websocket);
      }
    },
    onerror: {
      enumerable: true,
      get: function() { return websocket._onerror; },
      set: function(callback) {
        websocket._onerror = callback;
        websocket.protocol.subject.observe('clientOnError', callback, websocket);
      }
    }
  });
};

module.exports = webSocketProperties;

},{}],5:[function(require,module,exports){
var webSocketMessage = require('./helpers/websocket-message');

function Protocol(subject) {
  this.subject = subject;
  this.subject.observe('clientAttemptingToConnect', this.clientAttemptingToConnect, this);
}

Protocol.prototype = {
  server: null,
  clientAttemptingToConnect: function() {
    // If the server is not ready and the client tries to connect this results in a the onerror method
    // being invoked.
    if(!this.server) {
      this.subject.notify('updateReadyState', MockSocket.CLOSED);
      this.subject.notify('clientOnError');
      return false;
    }

    this.subject.notify('updateReadyState', MockSocket.OPEN);
    this.subject.notify('clientHasJoined', this.server);
    this.subject.notify('clientOnOpen', webSocketMessage(null, this.server.url));
  }
};

module.exports = Protocol;

},{"./helpers/websocket-message":3}],6:[function(require,module,exports){
var Subject = require('./subject');
var Protocol = require('./protocol');
var urlTransform = require('./helpers/url-transform');
var webSocketMessage = require('./helpers/websocket-message');

function WebSocketServer(url) {
  this.url = urlTransform(url);

  var subject = new Subject();
  var protocol = new Protocol(subject);

  // TODO: Is there a better way of doing this?
  window.MockSocket.protocol = protocol;
  this.protocol = protocol;
  protocol.server = this;
}

WebSocketServer.prototype = {
  protocol: null,

  on: function(type, callback) {
    var observerKey;

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

    this.protocol.subject.observe(observerKey, callback, this);
  },

  send: function(data) {
    this.protocol.subject.notify('clientOnMessage', webSocketMessage(data, this.url));
  }
}

module.exports = WebSocketServer;

},{"./helpers/url-transform":2,"./helpers/websocket-message":3,"./protocol":5,"./subject":7}],7:[function(require,module,exports){
function Subject() {
  this.list = {};
}

Subject.prototype = {

  /**
  * Binds a callback to a namespace. If notify is called on a namespace all "observers" will be
  * fired with the context that is passed in.
  *
  * @param {namespace: string}
  * @param {namespace: function}
  * @param {namespace: object}
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

  /**
  * TODO: Fix this
  */
  unobserve: function(namespace, obj) {
    for (var i = 0, len = this.list[namespace].length; i < len; i++) {
      if (this.list[namespace][i] === obj) {
        this.list[namespace].splice(i, 1);
        return true;
      }
    }

    return false;
  },

  /**
  * Remove all observers from a given namespace.
  *
  * @param {namespace: string} The namespace to clear.
  */
  clearAll: function(namespace) {

    if(typeof namespace !== 'string') {
      return false;
    }

    this.list[namespace] = [];
  },

  /**
  * Notify all callbacks that have been bound to the given namespace.
  *
  * @param {namespace: string} The namespace to notify observers on.
  */
  notify: function(namespace) {

    // This strips the namespace from the list of args as we dont want to pass that into the callback.
    var argumentsForCallback = Array.prototype.slice.call(arguments, 1);

    if(typeof namespace !== 'string' || !this.list[namespace]) {
      return false;
    }

    // Loop over all of the observers and fire the callback function with the context.
    for(var i = 0, len = this.list[namespace].length; i < len; i++) {
      this.list[namespace][i].callback.apply(this.list[namespace][i].context, argumentsForCallback);
    }
  }
};

module.exports = Subject;

},{}],8:[function(require,module,exports){
var urlTransform = require('./helpers/url-transform');
var webSocketMessage = require('./helpers/websocket-message');
var webSocketProperties = require('./helpers/websocket-properties');

function MockSocket(url) {
  this.binaryType = 'blob';
  this.url        = urlTransform(url);
  this.readyState = MockSocket.CONNECTING;
  this.protocol   = MockSocket.protocol;

  webSocketProperties(this);

  /*
  * Here we let the protocol know that we are both ready to change our ready state and that
  * this client is connecting to the mock server. It is wrapped inside of a settimeout to allow the thread
  * to finish assigning its on* methods before sending the notificiations. This is purely a timing hack.
  * http://geekabyte.blogspot.com/2014/01/javascript-effect-of-setting-settimeout.html
  */
  window.setTimeout(function(context) {
    // create the initial observer for all ready state changes and
    // tell the protocol that the client has been created
    context.protocol.subject.observe('updateReadyState', context._updateReadyState, context);
    context.protocol.subject.notify('clientAttemptingToConnect');
  }, 4, this);
}

MockSocket.CONNECTING = 0;
MockSocket.OPEN = 1;
MockSocket.CLOSING = 2;
MockSocket.LOADING = 3;
MockSocket.CLOSED = 4;

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
  * This holds reference to the protocol object. The protocol object is how we can
  * communicate with the backend via the pub/sub model.
  *
  * The protocol a property called subject which we can use to observe or notifiy with.
  * this.protocol.subject.notify('foo') & this.protocol.subject.observe('foo', callback, context)
  */
  protocol: null,

  /**
  * This is a mock for the native send function found on the WebSocket object. It notifies the
  * protocol that it has sent a message.
  *
  * @param {data: *}: Any javascript object which will be crafted into a MessageObject.
  */
  send: function(data) {
    this.protocol.subject.notify('clientHasSentMessage', webSocketMessage(data, this.url));
  },

  /**
  * This is a mock for the native close function found on the WebSocket object. It notifies the
  * protocol that it is closing the connection.
  */
  close: function() {
    this.protocol.subject.notify('clientHasLeft', webSocketMessage(null, this.url));
  },

  /**
  * This is a private method that can be used to change the readyState. This is used
  * like this: this.protocol.subject.observe('updateReadyState', this._updateReadyState, this);
  * so that the protocol and the server can change the readyState simply be notifing a namespace.
  *
  * @param {newReadyState: number}: The new ready state. Must be 0-4
  */
  _updateReadyState: function(newReadyState) {
    this.readyState = newReadyState;
  }
};

module.exports = MockSocket;

},{"./helpers/url-transform":2,"./helpers/websocket-message":3,"./helpers/websocket-properties":4}]},{},[1]);
