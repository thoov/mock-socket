var Protocol         = require('./protocol');
var delay            = require('./helpers/delay');
var Subject          = require('./helpers/subject');
var urlTransform     = require('./helpers/url-transform');
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
    delay(function() {
      this.protocol.subject.notify('clientOnMessage', webSocketMessage(data, this.url));
    }, this);
  },

  close: function() {
    delay(function() {
      this.protocol.closeConnection(this);
    }, this);
  }
}

module.exports = WebSocketServer;
