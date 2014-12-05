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
  },

  close: function() {
    window.setTimeout(function(context) {
      context.protocol.closeConnection(context);
    }, 4, this);
  }
}

module.exports = WebSocketServer;
