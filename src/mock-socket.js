import delay               from './helpers/delay';
import urlTransform        from './helpers/url-transform';
import socketMessageEvent  from './helpers/message-event';
import globalContext       from './helpers/global-context';
import webSocketProperties from './helpers/websocket-properties';

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
MockSocket.CLOSED     = 3;
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

export default MockSocket;
