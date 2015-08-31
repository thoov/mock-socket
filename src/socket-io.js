import URI from 'urijs';
import delay from './helpers/delay';
import EventTarget from './event-target';
import networkBridge from './network-bridge';
import CLOSE_CODES from './helpers/close-codes';
import {
  createEvent,
  createMessageEvent,
  createCloseEvent
} from './factory';

/*
* The socket-io class is designed to mimick the real API as closely as possible.
*
* http://socket.io/docs/
*/
class SocketIO extends EventTarget {
  /*
  * @param {string} url
  */
  constructor(url, protocol='') {
    super();

    if (!url) {
      url = 'socket.io';
    }

    this.binaryType = 'blob';
    this.url        = URI(url).toString();
    this.readyState = SocketIO.CONNECTING;
    this.protocol = '';

    if (typeof protocol === 'string') {
      this.protocol = protocol;
    } else if (Array.isArray(protocol) && protocol.length > 0) {
      this.protocol = protocol[0];
    }

    var server = networkBridge.attachWebSocket(this, this.url);

    /*
    * Delay triggering the connection events so they can be defined in time.
    */
    delay(function() {
      if (server) {
        this.readyState = SocketIO.OPEN;
        server.dispatchEvent(createEvent({type: 'connection'}), server, this);
        this.dispatchEvent(createEvent({type: 'connect', target: this}));
      } else {
        this.readyState = SocketIO.CLOSED;
        this.dispatchEvent(createEvent({ type: 'connect_error', target: this }));
        this.dispatchEvent(createCloseEvent({
          type: 'close',
          target: this,
          code: CLOSE_CODES.CLOSE_NORMAL,
        }));

        console.error(`Socket.io connection to '${this.url}' failed`);
      }
    }, this);
  }

  /*
  * Closes the SocketIO connection or connection attempt, if any.
  * If the connection is already CLOSED, this method does nothing.
  */
  close() {
    if (this.readyState !== SocketIO.OPEN) { return undefined; }

    var server = networkBridge.serverLookup(this.url);
    var closeEvent = createCloseEvent({
      type: 'close',
      target: this,
      code: CLOSE_CODES.CLOSE_NORMAL,
    });

    networkBridge.removeWebSocket(this, this.url);

    this.readyState = SocketIO.CLOSED;
    this.dispatchEvent(closeEvent);

    if (server) {
      server.dispatchEvent(closeEvent, server);
    }
  }

  /*
  * Alias for Socket#close
  *
  * https://github.com/socketio/socket.io-client/blob/master/lib/socket.js#L383
  */
  disconnect() {
    this.close();
  }

  /*
  * Submits an event to the server with a payload
  */
  emit(event, data) {
    if (this.readyState !== SocketIO.OPEN) {
      throw 'SocketIO is already in CLOSING or CLOSED state';
    }

    var messageEvent = createMessageEvent({
      type: event,
      origin: this.url,
      data: data,
    });

    var server = networkBridge.serverLookup(this.url);

    if (server) {
      server.dispatchEvent(messageEvent, data);
    }
  }

  /*
  * Submits a 'message' event to the server.
  *
  * Should behave exactly like WebSocket#send
  *
  * https://github.com/socketio/socket.io-client/blob/master/lib/socket.js#L113
  */
  send(data) {
    this.emit('message', data);
  }

  /*
  * For registering events to be received from the server
  *
  * Regular WebSockets expect a MessageEvent but Socketio.io just wants raw data
  */
  on(type, callback) {
    this.addEventListener(type, payload => {
      if (payload instanceof MessageEvent) {
        callback(payload.data);
      } else {
        callback(payload);
      }
    });
  }
}

SocketIO.CONNECTING = 0;
SocketIO.OPEN       = 1;
SocketIO.CLOSING    = 2;
SocketIO.CLOSED     = 3;

/*
* Static constructor methods for the IO Socket
*/
var IO = function(url) {
  return new SocketIO(url);
};

/*
* Alias the raw IO() constructor
*/
IO.connect = function(url) {
  return IO(url);
};

export default IO;
