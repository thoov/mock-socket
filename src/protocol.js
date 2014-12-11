var socketMessageEvent = require('./helpers/message-event');

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
    this.subject.notify('clientOnOpen', socketMessageEvent('open', null, this.server.url));
  },

  closeConnection: function(initiator) {
    this.subject.notify('updateReadyState', MockSocket.CLOSED);
    this.subject.notify('clientHasLeft', socketMessageEvent('close', null, initiator.url));
  }
};

module.exports = Protocol;
