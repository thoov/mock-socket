import URI from 'urijs';
import delay from './helpers/delay';
import EventTarget from './event-target';
import networkBridge from './network-bridge';
import {
  createEvent,
  createMessageEvent
} from './factory';

/*
*
*/
class WebSocket extends EventTarget {
  /*
  * @param {string} url
  */
  constructor(url) {
    super();

    if (!url) {
      throw new TypeError('Failed to construct \'WebSocket\': 1 argument required, but only 0 present.');
    }

    this.binaryType = 'blob';
    this.url        = URI(url).toString();
    this.readyState = WebSocket.CONNECTING;

    /*
    *
    */
    Object.defineProperties(this, {
      onopen: {
        configurable: true,
        enumerable: true,
        get: function() { return this.listeners.open; },
        set: function(listener) {
          this.addEventListener('open', listener);
        }
      },
      onmessage: {
        configurable: true,
        enumerable: true,
        get: function() { return this.listeners.message; },
        set: function(listener) {
          this.addEventListener('message', listener);
        }
      },
      onclose: {
        configurable: true,
        enumerable: true,
        get: function() { return this.listeners.close; },
        set: function(listener) {
          this.addEventListener('close', listener);
        }
      },
      onerror: {
        configurable: true,
        enumerable: true,
        get: function() { return this.listeners.error; },
        set: function(listener) {
          this.addEventListener('error', listener);
        }
      }
    });

    var server = networkBridge.attachWebSocket(this, this.url);

    /*
    *
    */
    delay(function() {
      debugger;
      if (server) {
        this.readyState = WebSocket.OPEN;
        server.dispatchEvent(createEvent({type: 'connection'}), server);
        this.dispatchEvent(createEvent({type: 'open', target: this}));
      }
      else {
        this.readyState = WebSocket.CLOSED;
        this.dispatchEvent(createEvent({ type: 'error', target: this }));
        this.dispatchEvent(createEvent({ type: 'close', target: this }));

        console.error(`WebSocket connection to '${this.url}' failed`);
      }
    }, this);
  }

  /*
  * This is a mock for the native send function found on the WebSocket object. It notifies the
  * service that it has sent a message.
  *
  * @param {data: *}: Any javascript object which will be crafted into a MessageObject.
  */
  send(data) {
    var messageEvent = createMessageEvent({
      type: 'message',
      origin: this.url,
      data: data
    });

    var server = networkBridge.serverLookup(this.url);

    if (server) {
      server.dispatchEvent(messageEvent, data);
    }
  }

  /*
  * This is a mock for the native close function found on the WebSocket object. It notifies the
  * service that it is closing the connection.
  */
  close() {
    if (this.readyState !== WebSocket.OPEN) { return undefined; }

    var server = networkBridge.serverLookup(this.url);
    var closeEvent = createEvent({type: 'close', target: this});

    this.readyState = WebSocket.CLOSED;
    this.dispatchEvent(closeEvent);

    if (server) {
      server.dispatchEvent(closeEvent, server);
    }

    // TODO: remove server from network-bridge
  }
}

WebSocket.CONNECTING = 0;
WebSocket.OPEN       = 1;
WebSocket.CLOSING    = 2;
WebSocket.CLOSED     = 3;

export default WebSocket;
