var socketMessageEvent = require('./helpers/message-event');

function Protocol() {
  this.subject = new Subject();
}

Protocol.prototype = {
  server: null,

  /*
  * This notifies the mock server that a client is connecting and also sets up
  * the ready state observer.
  *
  * @param {client: object} the context of the client
  * @param {readyStateFunction: function} the function that will be invoked on a ready state change
  */
  clientIsConnecting: function(client, readyStateFunction) {
    this.subject.observe('updateReadyState', readyStateFunction, client);

    // if the server has not been set then we notify the onclose method of this client
    if(!this.server) {
      this.subject.notify(client, 'updateReadyState', MockSocket.CLOSED);
      this.subject.notifyOnlyFor(client, 'clientOnError');
      return false;
    }

    this.subject.notifyOnlyFor(client, 'updateReadyState', MockSocket.OPEN);
    this.subject.notify('clientHasJoined', this.server);
    this.subject.notifyOnlyFor(client, 'clientOnOpen', socketMessageEvent('open', null, this.server.url));
  },

  /*
  * Closes a connection.
  *
  * TODO: make sure this works with multiple mock clients.
  *
  * @param {messageEvent: object} the mock message event.
  */
  closeConnection: function(messageEvent) {
    this.subject.notify('updateReadyState', MockSocket.CLOSED);
    this.subject.notify('clientHasLeft', messageEvent);
  },

  /*
  * Notifies the mock server that a client has sent a message.
  *
  * @param {messageEvent: object} the mock message event.
  */
  sendMessageToServer: function(messageEvent) {
    this.subject.notify('clientHasSentMessage', messageEvent);
  },

  /*
  * Notifies all clients that the server has sent a message
  *
  * @param {messageEvent: object} the mock message event.
  */
  sendMessageToClients: function(messageEvent) {
    this.subject.notify('clientOnMessage', messageEvent);
  },

  /*
  * Setup the mock server on callback function observers.
  *
  * @param {observerKey: string} either: connection, message or close
  * @param {callback: function} the callback to be invoked
  * @param {server: object} the context of the server
  */
  setServerOnCallback: function(observerKey, callback, server) {
    this.subject.observe(observerKey, callback, server);
  }
};

module.exports = Protocol;
