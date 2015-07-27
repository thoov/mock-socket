import URI from 'urijs';
import WebSocket from './websocket';
import EventTarget  from './event-target';
import networkBridge from './network-bridge';
import CLOSE_CODES from './helpers/close-codes';
import {
  createEvent,
  createMessageEvent,
  createCloseEvent
} from './factory';

/*
* https://github.com/websockets/ws#server-example
*/
class Server extends EventTarget {
  /*
  * @param {string} url
  */
  constructor(url) {
    super();
    this.url   = URI(url).toString();
    var server = networkBridge.attachServer(this, this.url);

    if (!server) {
      this.dispatchEvent(createEvent({type: 'error'}));
      throw new Error('A mock server is already listening on this url');
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
  send(data, options={}) {
    var {
      websocket
    } = options;

    if (websocket) {
      return websocket.dispatchEvent(
        createMessageEvent({
          type: 'message',
          data,
          origin: this.url,
          target: websocket
        })
      );
    }

    var websockets = networkBridge.websocketsLookup(this.url);

    websockets.forEach(socket => {
      socket.dispatchEvent(
        createMessageEvent({
          type: 'message',
          data,
          origin: this.url,
          target: socket
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
  close(options={}) {
    var {
      code,
      reason,
      wasClean
    } = options;
    var listeners = networkBridge.websocketsLookup(this.url);

    listeners.forEach(socket => {
      socket.readyState = WebSocket.CLOSE;
      socket.dispatchEvent(createCloseEvent({
        type: 'close',
        target: socket,
        code: code || CLOSE_CODES.CLOSE_NORMAL,
        reason: reason || '',
        wasClean
      }));
    });

    this.dispatchEvent(createCloseEvent({type: 'close'}), this);
    networkBridge.removeServer(this.url);
  }

  /*
  * Returns an array of websockets which are listening to this server
  */
  clients() {
    return networkBridge.websocketsLookup(this.url);
  }
}

export default Server;
