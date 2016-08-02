import WebSocket from './websocket';
import EventTarget from './event-target';
import networkBridge from './network-bridge';
import CLOSE_CODES from './helpers/close-codes';
import normalize from './helpers/normalize-url';
import { createEvent, createMessageEvent, createCloseEvent } from './event-factory';

function isBrowser() {
  return (typeof window !== 'undefined');
}

function isNode() {
  return (typeof global !== 'undefined');
}

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
    const server = networkBridge.attachServer(this, this.url);

    if (!server) {
      this.dispatchEvent(createEvent({ type: 'error' }));
      throw new Error('A mock server is already listening on this url');
    }

    this.options = Object.assign({
      verifiyClient: null,
    }, options);

    this.start();
  }

  /*
  * Attaches the mock websocket object to the window or global object.
  */
  start() {
    if (isBrowser()) {
      this._originalWebSocket = window.WebSocket;
      window.WebSocket = WebSocket;
    } else if (isNode()) {
      this._originalWebSocket = global.WebSocket;
      global.WebSocket = WebSocket;
    }
  }

  /*
  * Removes the mock websocket object from the window
  */
  stop() {
    if (isBrowser()) {
      window.WebSocket = this._originalWebSocket;
    } else if (isNode()) {
      global.WebSocket = this._originalWebSocket;
    }

    networkBridge.removeServer(this.url);
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

    websockets.forEach(socket => {
      socket.dispatchEvent(
        createMessageEvent({
          type: event,
          data,
          origin: this.url,
          target: socket,
        })
      );
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
    const {
      code,
      reason,
      wasClean,
    } = options;
    const listeners = networkBridge.websocketsLookup(this.url);

    listeners.forEach(socket => {
      socket.readyState = WebSocket.CLOSE;
      socket.dispatchEvent(createCloseEvent({
        type: 'close',
        target: socket,
        code: code || CLOSE_CODES.CLOSE_NORMAL,
        reason: reason || '',
        wasClean,
      }));
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
  to(room, broadcaster) {
    const _this = this;
    const websockets = networkBridge.websocketsLookup(this.url, room, broadcaster);
    return {
      emit(event, data) {
        _this.emit(event, data, { websockets });
      },
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
