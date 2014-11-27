(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var server = require('./server.js');
var protocol = require('./protocol.js');
var subject = require('./subject.js');
var websocket = require('./websocket.js');

window.MockSocket = websocket;
window.WebSocketServer = server;
window.Protocol = protocol;
window.Subject = subject;

},{"./protocol.js":4,"./server.js":5,"./subject.js":6,"./websocket.js":7}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
var webSocketMessage = require('./websocket-message');

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
    }
  });
};

module.exports = webSocketProperties;

},{"./websocket-message":2}],4:[function(require,module,exports){
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

},{"./helpers/websocket-message":2}],5:[function(require,module,exports){
var webSocketMessage = require('./helpers/websocket-message');
var Subject = require('./subject');
var Protocol = require('./protocol');

function WebSocketServer(url) {
  this.url = url;

  var subject = new Subject();
  var protocol = new Protocol(subject);

  window.MockSocket.protocol = protocol; // TODO: Is there a better way of doing this?
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

},{"./helpers/websocket-message":2,"./protocol":4,"./subject":6}],6:[function(require,module,exports){
function Subject() {
  this._list = {};
}

Subject.prototype = {
  observe: function(namespace, callback, context) {
    if(!this._list[namespace]) {
      this._list[namespace] = [];
    }

    if(typeof callback !== 'function') {
      console.log('The callback which is trying to observe namespace: ' + namespace + ' is not a function.');
      return false;
    }

    this._list[namespace].push({callback: callback, context: context});
  },

  unobserve: function(namespace, obj) {
    for (var i = 0, len = this._list[namespace].length; i < len; i++) {
      if (this._list[namespace][i] === obj) {
        this._list[namespace].splice(i, 1);
        return true;
      }
    }

    return false;
  },

  clearAll: function(namespace) {

    if(typeof namespace !== 'string') {
      console.log('A valid namespace must be passed into clearAll.');
      return false;
    }

    this._list[namespace] = [];
  },

  notify: function(namespace) {
    var args = Array.prototype.slice.call(arguments, 1); // This strips the namespace from the list of args

    if(!this._list[namespace]) {
      console.log('Trying to notify on namespace: ' + namespace + ' but an observer has never been added to it.');
      return false;
    }

    for (var i = 0, len = this._list[namespace].length; i < len; i++) {

      if(typeof this._list[namespace][i].callback !== 'function') {
        console.log('An observer for the namespace: ' + namespace + ' is not a function.');
        continue;
      }

      this._list[namespace][i].callback.apply(this._list[namespace][i].context, args);
    }
  }
};

module.exports = Subject;

},{}],7:[function(require,module,exports){
var webSocketMessage = require('./helpers/websocket-message');
var webSocketProperties = require('./helpers/websocket-properties');

function MockSocket(url) {
  this.binaryType = 'blob';
  this.url = url; //+ '/'; // TODO: need a better solution for this.
  this.readyState = MockSocket.CONNECTING;
  this.protocol = MockSocket.protocol;

  webSocketProperties(this);

  /*
  * Here we let the protocol know that we are both ready to change our ready state and that
  * this client is connecting to the mock server. It is wrapped inside of a settimeout to allow the invoking
  * thread finish assigning its on* methods before sending the notificiations. This is purely a timing hack.
  */
  window.setTimeout(function(context) {
    // create the initial observer for all ready state changes and
    // tell the protocol that the client has been created
    context.protocol.subject.observe('updateReadyState', context._updateReadyState, context);
    context.protocol.subject.notify('clientAttemptingToConnect');
  }, 0, this);
}

MockSocket.PROTOCOL = null;
MockSocket.CONNECTING = 0;
MockSocket.OPEN = 1;
MockSocket.CLOSING = 2;
MockSocket.LOADING = 3;
MockSocket.CLOSED = 4;

MockSocket.prototype = {

  /*
  * Holds the on*** callback functions. These are really just for the custom
  * getters that are defined above. Accessing these properties are not advised.
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

},{"./helpers/websocket-message":2,"./helpers/websocket-properties":3}]},{},[1]);
