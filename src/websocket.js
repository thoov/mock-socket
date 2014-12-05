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
    window.setTimeout(function(context) {
      context.protocol.closeConnection(context);
    }, 4, this);
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
