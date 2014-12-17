var Protocol         = require('./protocol');
var delay            = require('./helpers/delay');
var Subject          = require('./helpers/subject');
var urlTransform     = require('./helpers/url-transform');
var socketMessageEvent = require('./helpers/message-event');

function MockServer(url) {
  var protocol  = new Protocol();
  this.url      = urlTransform(url);

  // TODO: Is there a better way of doing this?
  if(window.hasOwnProperty('MockSocket')) {
    window.MockSocket.protocol[this.url] = protocol;
    this.protocol = protocol;
    protocol.server = this;
  }
}

MockServer.prototype = {
  protocol: null,

  /**
  * This is the main function for the mock server to subscribe to the on events.
  *
  * ie: mockServer.on('connection', function() { console.log('a mock client connected'); });
  *
  * @param {type: string}: The event key to subscribe to. Valid keys are: connection, message, and close.
  * @param {callback: function}: The callback which should be called when a certain event is fired.
  */
  on: function(type, callback) {
    var observerKey;

    if(typeof callback !== 'function') {
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
      this.protocol.setServerOnCallback(observerKey, callback, this);
    }
  },

  /**
  * This send function will notify all mock clients via their onmessage callbacks that the server
  * has a message for them.
  *
  * @param {data: *}: Any javascript object which will be crafted into a MessageObject.
  */
  send: function(data) {
    delay(function() {
      this.protocol.sendMessageToClients(socketMessageEvent('message', data, this.url));
    }, this);
  },

  /**
  * Notifies all mock clients that the server is closing and their onclose callbacks should fire.
  */
  close: function() {
    delay(function() {
      this.protocol.closeConnection(socketMessageEvent('close', null, this.url));
    }, this);
  }
}

module.exports = MockServer;
