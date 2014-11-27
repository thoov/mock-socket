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
