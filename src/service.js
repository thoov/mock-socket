var socketMessageEvent = require('./helpers/message-event');
var globalContext      = require('./helpers/global-context');

function SocketService() {
  this.list = {};
}

SocketService.prototype = {
  server: null,

  /*
  * This notifies the mock server that a client is connecting and also sets up
  * the ready state observer.
  *
  * @param {client: object} the context of the client
  * @param {readyStateFunction: function} the function that will be invoked on a ready state change
  */
  clientIsConnecting: function(client, readyStateFunction) {
    this.observe('updateReadyState', readyStateFunction, client);

    // if the server has not been set then we notify the onclose method of this client
    if(!this.server) {
      this.notify(client, 'updateReadyState', globalContext.MockSocket.CLOSED);
      this.notifyOnlyFor(client, 'clientOnError');
      return false;
    }

    this.notifyOnlyFor(client, 'updateReadyState', globalContext.MockSocket.OPEN);
    this.notify('clientHasJoined', this.server);
    this.notifyOnlyFor(client, 'clientOnOpen', socketMessageEvent('open', null, this.server.url));
  },

  /*
  * Closes a connection from the server's perspective. This should
  * close all clients.
  *
  * @param {messageEvent: object} the mock message event.
  */
  closeConnectionFromServer: function(messageEvent) {
    this.notify('updateReadyState', globalContext.MockSocket.CLOSING);
    this.notify('clientOnclose', messageEvent);
    this.notify('updateReadyState', globalContext.MockSocket.CLOSED);
    this.notify('clientHasLeft');
  },

  /*
  * Closes a connection from the clients perspective. This
  * should only close the client who initiated the close and not
  * all of the other clients.
  *
  * @param {messageEvent: object} the mock message event.
  * @param {client: object} the context of the client
  */
  closeConnectionFromClient: function(messageEvent, client) {
    if(client.readyState === globalContext.MockSocket.OPEN) {
      this.notifyOnlyFor(client, 'updateReadyState', globalContext.MockSocket.CLOSING);
      this.notifyOnlyFor(client, 'clientOnclose', messageEvent);
      this.notifyOnlyFor(client, 'updateReadyState', globalContext.MockSocket.CLOSED);
      this.notify('clientHasLeft');
    }
  },


  /*
  * Notifies the mock server that a client has sent a message.
  *
  * @param {messageEvent: object} the mock message event.
  */
  sendMessageToServer: function(messageEvent) {
    this.notify('clientHasSentMessage', messageEvent.data, messageEvent);
  },

  /*
  * Notifies all clients that the server has sent a message
  *
  * @param {messageEvent: object} the mock message event.
  */
  sendMessageToClients: function(messageEvent) {
    this.notify('clientOnMessage', messageEvent);
  },

  /*
  * Setup the callback function observers for both the server and client.
  *
  * @param {observerKey: string} either: connection, message or close
  * @param {callback: function} the callback to be invoked
  * @param {server: object} the context of the server
  */
  setCallbackObserver: function(observerKey, callback, server) {
    this.observe(observerKey, callback, server);
  },

  /*
  * Binds a callback to a namespace. If notify is called on a namespace all "observers" will be
  * fired with the context that is passed in.
  *
  * @param {namespace: string}
  * @param {callback: function}
  * @param {context: object}
  */
  observe: function(namespace, callback, context) {

    // Make sure the arguments are of the correct type
    if( typeof namespace !== 'string' || typeof callback !== 'function' || (context && typeof context !== 'object')) {
      return false;
    }

    // If a namespace has not been created before then we need to "initialize" the namespace
    if(!this.list[namespace]) {
      this.list[namespace] = [];
    }

    this.list[namespace].push({callback: callback, context: context});
  },

  /*
  * Remove all observers from a given namespace.
  *
  * @param {namespace: string} The namespace to clear.
  */
  clearAll: function(namespace) {

    if(!this.verifyNamespaceArg(namespace)) {
      return false;
    }

    this.list[namespace] = [];
  },

  /*
  * Notify all callbacks that have been bound to the given namespace.
  *
  * @param {namespace: string} The namespace to notify observers on.
  * @param {namespace: url} The url to notify observers on.
  */
  notify: function(namespace) {

    // This strips the namespace from the list of args as we dont want to pass that into the callback.
    var argumentsForCallback = Array.prototype.slice.call(arguments, 1);

    if(!this.verifyNamespaceArg(namespace)) {
      return false;
    }

    // Loop over all of the observers and fire the callback function with the context.
    for(var i = 0, len = this.list[namespace].length; i < len; i++) {
      this.list[namespace][i].callback.apply(this.list[namespace][i].context, argumentsForCallback);
    }
  },

  /*
  * Notify only the callback of the given context and namespace.
  *
  * @param {context: object} the context to match against.
  * @param {namespace: string} The namespace to notify observers on.
  */
  notifyOnlyFor: function(context, namespace) {

    // This strips the namespace from the list of args as we dont want to pass that into the callback.
    var argumentsForCallback = Array.prototype.slice.call(arguments, 2);

    if(!this.verifyNamespaceArg(namespace)) {
      return false;
    }

    // Loop over all of the observers and fire the callback function with the context.
    for(var i = 0, len = this.list[namespace].length; i < len; i++) {
      if(this.list[namespace][i].context === context) {
        this.list[namespace][i].callback.apply(this.list[namespace][i].context, argumentsForCallback);
      }
    }
  },

  /*
  * Verifies that the namespace is valid.
  *
  * @param {namespace: string} The namespace to verify.
  */
  verifyNamespaceArg: function(namespace) {
    if(typeof namespace !== 'string' || !this.list[namespace]) {
      return false;
    }

    return true;
  }
};

module.exports = SocketService;
