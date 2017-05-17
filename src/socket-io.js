import delay from './helpers/delay';
import EventTarget from './event-target';
import networkBridge from './network-bridge';
import CLOSE_CODES from './helpers/close-codes';
import normalize from './helpers/normalize-url';
import logger from './helpers/logger';
import { createEvent, createMessageEvent, createCloseEvent } from './event-factory';

/*
* The socket-io class is designed to mimick the real API as closely as possible.
*
* http://socket.io/docs/
*/
class SocketIO extends EventTarget {
  /*
  * @param {string} url
  */
  constructor(url = 'socket.io', protocol = '') {
    super();

    this.binaryType = 'blob';
    this.url = normalize(url);
    this.readyState = SocketIO.CONNECTING;
    this.protocol = '';

    if (typeof protocol === 'string') {
      this.protocol = protocol;
    } else if (Array.isArray(protocol) && protocol.length > 0) {
      this.protocol = protocol[0];
    }

    const server = networkBridge.attachWebSocket(this, this.url);

    /*
    * Delay triggering the connection events so they can be defined in time.
    */
    delay(function delayCallback() {
      if (server) {
        this.readyState = SocketIO.OPEN;
        server.dispatchEvent(createEvent({ type: 'connection' }), server, this);
        server.dispatchEvent(createEvent({ type: 'connect' }), server, this); // alias
        this.dispatchEvent(createEvent({ type: 'connect', target: this }));
      } else {
        this.readyState = SocketIO.CLOSED;
        this.dispatchEvent(createEvent({ type: 'error', target: this }));
        this.dispatchEvent(
          createCloseEvent({
            type: 'close',
            target: this,
            code: CLOSE_CODES.CLOSE_NORMAL
          })
        );

        logger('error', `Socket.io connection to '${this.url}' failed`);
      }
    }, this);

    /**
      Add an aliased event listener for close / disconnect
     */
    this.addEventListener('close', event => {
      this.dispatchEvent(
        createCloseEvent({
          type: 'disconnect',
          target: event.target,
          code: event.code
        })
      );
    });
  }

  /*
  * Closes the SocketIO connection or connection attempt, if any.
  * If the connection is already CLOSED, this method does nothing.
  */
  close() {
    if (this.readyState !== SocketIO.OPEN) {
      return undefined;
    }

    const server = networkBridge.serverLookup(this.url);
    networkBridge.removeWebSocket(this, this.url);

    this.readyState = SocketIO.CLOSED;
    this.dispatchEvent(
      createCloseEvent({
        type: 'close',
        target: this,
        code: CLOSE_CODES.CLOSE_NORMAL
      })
    );

    if (server) {
      server.dispatchEvent(
        createCloseEvent({
          type: 'disconnect',
          target: this,
          code: CLOSE_CODES.CLOSE_NORMAL
        }),
        server
      );
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
  emit(event, ...data) {
    if (this.readyState !== SocketIO.OPEN) {
      throw new Error('SocketIO is already in CLOSING or CLOSED state');
    }

    const messageEvent = createMessageEvent({
      type: event,
      origin: this.url,
      data
    });

    const server = networkBridge.serverLookup(this.url);

    if (server) {
      server.dispatchEvent(messageEvent, ...data);
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
  * For broadcasting events to other connected sockets.
  *
  * e.g. socket.broadcast.emit('hi!');
  * e.g. socket.broadcast.to('my-room').emit('hi!');
  */
  get broadcast() {
    if (this.readyState !== SocketIO.OPEN) {
      throw new Error('SocketIO is already in CLOSING or CLOSED state');
    }

    const self = this;
    const server = networkBridge.serverLookup(this.url);
    if (!server) {
      throw new Error(`SocketIO can not find a server at the specified URL (${this.url})`);
    }

    return {
      emit(event, data) {
        server.emit(event, data, { websockets: networkBridge.websocketsLookup(self.url, null, self) });
      },
      to(room) {
        return server.to(room, self);
      },
      in(room) {
        return server.in(room, self);
      }
    };
  }

  /*
  * For registering events to be received from the server
  */
  on(type, callback) {
    this.addEventListener(type, callback);
  }

  /*
   * Join a room on a server
   *
   * http://socket.io/docs/rooms-and-namespaces/#joining-and-leaving
   */
  join(room) {
    networkBridge.addMembershipToRoom(this, room);
  }

  /*
   * Get the websocket to leave the room
   *
   * http://socket.io/docs/rooms-and-namespaces/#joining-and-leaving
   */
  leave(room) {
    networkBridge.removeMembershipFromRoom(this, room);
  }

  to(room) {
    return this.broadcast.to(room);
  }

  in() {
    return this.to.apply(null, arguments);
  }

  /*
   * Invokes all listener functions that are listening to the given event.type property. Each
   * listener will be passed the event as the first argument.
   *
   * @param {object} event - event object which will be passed to all listeners of the event.type property
   */
  dispatchEvent(event, ...customArguments) {
    const eventName = event.type;
    const listeners = this.listeners[eventName];

    if (!Array.isArray(listeners)) {
      return false;
    }

    listeners.forEach(listener => {
      if (customArguments.length > 0) {
        listener.apply(this, customArguments);
      } else {
        // Regular WebSockets expect a MessageEvent but Socketio.io just wants raw data
        //  payload instanceof MessageEvent works, but you can't isntance of NodeEvent
        //  for now we detect if the output has data defined on it
        listener.call(this, event.data ? event.data : event);
      }
    });
  }
}

SocketIO.CONNECTING = 0;
SocketIO.OPEN = 1;
SocketIO.CLOSING = 2;
SocketIO.CLOSED = 3;

/*
* Static constructor methods for the IO Socket
*/
const IO = function ioConstructor(url) {
  return new SocketIO(url);
};

/*
* Alias the raw IO() constructor
*/
IO.connect = function ioConnect(url) {
  /* eslint-disable new-cap */
  return IO(url);
  /* eslint-enable new-cap */
};

export default IO;
