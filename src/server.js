
function WebSocketServer(url, protocol) {
  this.url = url;
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
    }

    this.protocol.subject.observe(observerKey, callback, this);
  },

  send: function(data) {
    this.protocol.subject.notify('clientOnMessage', data);
  }
}

module.exports = WebSocketServer;
