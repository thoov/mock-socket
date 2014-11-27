var webSocketMessage = require('./helpers/websocket-message');
var webSocketProperties = require('./helpers/websocket-properties');

function MockSocks(url) {
  this.binaryType = 'blob';
  this.url = url + '/'; // TODO: need a better solution for this.
  this.readyState = MockSocks.CONNECTING;
  this.protocol = MockSocks.protocol;

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

MockSocks.PROTOCOL = null;
MockSocks.CONNECTING = 0;
MockSocks.OPEN = 1;
MockSocks.CLOSING = 2;
MockSocks.LOADING = 3;
MockSocks.CLOSED = 4;

MockSocks.prototype = {

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
    this.protocol.subject.notify('clientHasLeft');
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

module.exports = MockSocks;
