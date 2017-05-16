import WebSocket from './websocket';
import EventTarget from './event-target';
import networkBridge from './network-bridge';
import CLOSE_CODES from './helpers/close-codes';
import normalize from './helpers/normalize-url';
import globalObject from './helpers/global-object';
import dedupe from './helpers/dedupe';
import { createEvent, createMessageEvent, createCloseEvent } from './event-factory';

/*
* https://github.com/websockets/ws#server-example
*/
class Server extends EventTarget {
  /*
  * @param {string} url
  */
  constructor(url, options = {}) {
    super();
    this.url = normalize(url);
    this.originalWebSocket = null;
    const server = networkBridge.attachServer(this, this.url);

    if (!server) {
      this.dispatchEvent(createEvent({ type: 'error' }));
      throw new Error('A mock server is already listening on this url');
    }

    if (typeof options.verifiyClient === 'undefined') {
      options.verifiyClient = null;
    }

    this.options = options;

    this.start();
  }

  /*
  * Attaches the mock websocket object to the global object
  */
  start() {
    const globalObj = globalObject();

    if (globalObj.WebSocket) {
      this.originalWebSocket = globalObj.WebSocket;
    }

    globalObj.WebSocket = WebSocket;
  }

  /*
  * Removes the mock websocket object from the global object
  */
  stop(callback = () => {}) {
    const globalObj = globalObject();

    if (this.originalWebSocket) {
      globalObj.WebSocket = this.originalWebSocket;
    } else {
      delete globalObj.WebSocket;
    }

    this.originalWebSocket = null;

    networkBridge.removeServer(this.url);

    if (typeof callback === 'function') {
      callback();
    }
  }

  /*
  * This is the main function for the mock server to subscribe to the on events.
  *
  * ie: mockServer.on('connection', function() { console.log('a mock client connected'); });
  *
  * @param {string} type - The event key to subscribe to. Valid keys are: connection, message, and close.
  * @param {function} callback - The callback which should be called when a certain event is fired.
  */
  on(type, callback) {
    this.addEventListener(type, callback);
  }

  /*
  * This send function will notify all mock clients via their onmessage callbacks that the server
  * has a message for them.
  *
  * @param {*} data - Any javascript object which will be crafted into a MessageObject.
  */
  send(data, options = {}) {
    this.emit('message', data, options);
  }

  /*
  * Sends a generic message event to all mock clients.
  */
  emit(event, data, options = {}) {
    let { websockets } = options;

    if (!websockets) {
      websockets = networkBridge.websocketsLookup(this.url);
    }

    if (typeof options !== 'object' || arguments.length > 3) {
      data = Array.prototype.slice.call(arguments, 1, arguments.length);
    }

    websockets.forEach(socket => {
      if (Array.isArray(data)) {
        socket.dispatchEvent(
          createMessageEvent({
            type: event,
            data,
            origin: this.url,
            target: socket
          }),
          ...data
        );
      } else {
        socket.dispatchEvent(
          createMessageEvent({
            type: event,
            data,
            origin: this.url,
            target: socket
          })
        );
      }
    });
  }

  /*
  * Closes the connection and triggers the onclose method of all listening
  * websockets. After that it removes itself from the urlMap so another server
  * could add itself to the url.
  *
  * @param {object} options
  */
  close(options = {}) {
    const { code, reason, wasClean } = options;
    const listeners = networkBridge.websocketsLookup(this.url);

    listeners.forEach(socket => {
      socket.readyState = WebSocket.CLOSE;
      socket.dispatchEvent(
        createCloseEvent({
          type: 'close',
          target: socket,
          code: code || CLOSE_CODES.CLOSE_NORMAL,
          reason: reason || '',
          wasClean
        })
      );
    });

    this.dispatchEvent(createCloseEvent({ type: 'close' }), this);
    networkBridge.removeServer(this.url);
  }

  /*
  * Returns an array of websockets which are listening to this server
  */
  clients() {
    return networkBridge.websocketsLookup(this.url);
  }

  /*
  * Prepares a method to submit an event to members of the room
  *
  * e.g. server.to('my-room').emit('hi!');
  */
  to(room, broadcaster, broadcastList = []) {
    const self = this;
    const websockets = dedupe(broadcastList.concat(networkBridge.websocketsLookup(this.url, room, broadcaster)));

    return {
      to: (chainedRoom, chainedBroadcaster) => this.to.call(this, chainedRoom, chainedBroadcaster, websockets),
      emit(event, data) {
        self.emit(event, data, { websockets });
      }
    };
  }

  /*
   * Alias for Server.to
   */
  in(...args) {
    return this.to.apply(null, args);
  }
}

/*
 * Alternative constructor to support namespaces in socket.io
 *
 * http://socket.io/docs/rooms-and-namespaces/#custom-namespaces
 */
Server.of = function of(url) {
  return new Server(url);
};

export default Server;
