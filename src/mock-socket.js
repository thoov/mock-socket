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

/*
* Socket.io style connect interface
*/
MockSocket.connect = function(url) {
  return new MockSocket(url);
};

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
  _isSocketIO: null,

  /*
  * Define a callback for a specific event, as required for socket.io
  */
  on: function(eventName, callback) {
    var isSocketIO = this._isSocketIO;

    var callBack = function(event) {
      if (event.type === eventName) {
        event.target = this;
        if (isSocketIO) {
          var data = arguments[0].data;
          callback.apply(this, [data]);
        } else {
          callback.apply(this, arguments);
        }
      }
    };

    this.service.setCallbackObserver('clientOnMessage', callBack, this);
  },

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
  addEventListener: function(event, handler) {
    if(!this._eventHandlers[event]) {
      this._eventHandlers[event] = [];
      var self = this;
      this['on' + event] = function(eventObject) {
        self.dispatchEvent(eventObject);
      }
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
  removeEventListener: function(event, handler) {
    if(!this._eventHandlers[event]) {
      return;
    }
    var handlers = this._eventHandlers[event];
    handlers.splice(handlers.indexOf(handler), 1);
    if(!handlers.length) {
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
  dispatchEvent: function(event) {
    var handlers = this._eventHandlers[event.type];
    if(!handlers) {
      return;
    }
    for(var i = 0; i < handlers.length; i++) {
      handlers[i].call(this, event);
    }
  },

  /*
  * This is a mock for the native send function found on the WebSocket object. It notifies the
  * service that it has sent a message.
  *
  * @param {data: *}: Any javascript object which will be crafted into a MessageObject.
  */
  send: function(data) {
    this.emit('message', data);
  },

  /*
  * This is like the native send message but allows a specified namespace. It's
  * there to support a socket.io interface for working in channels
  *
  * @param {data: *}: Any javascript object which will be crafted into a MessageObject.
  */
  emit: function(namespace, data) {
    delay(function() {
      this.service.sendMessageToServer(socketMessageEvent(namespace, data, this.url));
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
