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
*
*/
class Server extends EventTarget {
  /*
  * @param {string} url
  */
  constructor(url) {
    super();
    this.url   = URI(url).toString();
    var server = networkBridge.attachServer(this, this.url);

    if(!server) {
      this.dispatchEvent(createEvent({type: 'error'}));
    }
  }

  /*
  * This is the main function for the mock server to subscribe to the on events.
  *
  * ie: mockServer.on('connection', function() { console.log('a mock client connected'); });
  *
  * @param {type: string}: The event key to subscribe to. Valid keys are: connection, message, and close.
  * @param {callback: function}: The callback which should be called when a certain event is fired.
  */
  on(type, callback) {
    this.addEventListener(type, callback);
  }

  /*
  * This send function will notify all mock clients via their onmessage callbacks that the server
  * has a message for them.
  *
  * @param {data: *}: Any javascript object which will be crafted into a MessageObject.
  */
  send(data) {
    var websockets = networkBridge.websocketsLookup(this.url);

    websockets.forEach(socket => {
      var messageEvent = createMessageEvent({
        type: 'message',
        data,
        origin: this.url,
        target: socket
      });

      socket.dispatchEvent(messageEvent);
    });
  }

  /*
  * Notifies all mock clients that the server is closing and their onclose callbacks should fire.
  */
  close() {
    var listeners = networkBridge.websocketsLookup(this.url);

    listeners.forEach(socket => {
      socket.readyState = WebSocket.CLOSE;
      socket.dispatchEvent(createCloseEvent({
        type: 'close',
        target: socket,
        code: CLOSE_CODES.CLOSE_NORMAL
      }));
    });

    this.dispatchEvent(createCloseEvent({type: 'close'}), this);
    networkBridge.removeServer(this.url);
  }
}

export default Server;
