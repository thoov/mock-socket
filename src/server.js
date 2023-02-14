import URL from 'url-parse';
import WebSocket from './websocket';
import { SocketIO } from './socket-io';
import dedupe from './helpers/dedupe';
import EventTarget from './event/target';
import { CLOSE_CODES } from './constants';
import networkBridge from './network-bridge';
import globalObject from './helpers/global-object';
import normalizeSendData from './helpers/normalize-send';
import { createEvent, createMessageEvent, createCloseEvent } from './event/factory';

const defaultOptions = {
  mock: true,
  verifyClient: null,
  selectProtocol: null
};

class Server extends EventTarget {
  constructor(url, options = defaultOptions) {
    super();
    const urlRecord = new URL(url);

    if (!urlRecord.pathname) {
      urlRecord.pathname = '/';
    }

    this.url = urlRecord.toString();

    this.originalWebSocket = null;
    const server = networkBridge.attachServer(this, this.url);

    if (!server) {
      this.dispatchEvent(createEvent({ type: 'error' }));
      throw new Error('A mock server is already listening on this url');
    }

    this.options = Object.assign({}, defaultOptions, options);

    if (this.options.mock) {
      this.mockWebsocket();
    }
  }

  /*
   * Attaches the mock websocket object to the global object
   */
  mockWebsocket() {
    const globalObj = globalObject();

    this.originalWebSocket = globalObj.WebSocket;
    globalObj.WebSocket = WebSocket;
  }

  /*
   * Removes the mock websocket object from the global object
   */
  restoreWebsocket() {
    const globalObj = globalObject();

    if (this.originalWebSocket !== null) {
      globalObj.WebSocket = this.originalWebSocket;
    }

    this.originalWebSocket = null;
  }

  /**
   * Removes itself from the urlMap so another server could add itself to the url.
   * @param {function} callback - The callback is called when the server is stopped
   */
  stop(callback = () => {}) {
    if (this.options.mock) {
      this.restoreWebsocket();
    }

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
   * Remove event listener
   */
  off(type, callback) {
    this.removeEventListener(type, callback);
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

    // Remove server before notifications to prevent immediate reconnects from
    // socket onclose handlers
    networkBridge.removeServer(this.url);

    listeners.forEach(socket => {
      socket.readyState = WebSocket.CLOSED;
      socket.dispatchEvent(
        createCloseEvent({
          type: 'close',
          target: socket.target,
          code: code || CLOSE_CODES.CLOSE_NORMAL,
          reason: reason || '',
          wasClean
        })
      );
    });

    this.dispatchEvent(createCloseEvent({ type: 'close' }), this);
  }

  /*
   * Sends a generic message event to all mock clients.
   */
  emit(event, data, options = {}) {
    let { websockets } = options;

    if (!websockets) {
      websockets = networkBridge.websocketsLookup(this.url);
    }

    let normalizedData;
    if (typeof options !== 'object' || arguments.length > 3) {
      data = Array.prototype.slice.call(arguments, 1, arguments.length);
      normalizedData = data.map(item => normalizeSendData(item));
    } else {
      normalizedData = normalizeSendData(data);
    }

    websockets.forEach(socket => {
      const messageData = socket instanceof SocketIO ? data : normalizedData;
      if (Array.isArray(messageData)) {
        socket.dispatchEvent(
          createMessageEvent({
            type: event,
            data: messageData,
            origin: this.url,
            target: socket.target
          }),
          ...messageData
        );
      } else {
        socket.dispatchEvent(
          createMessageEvent({
            type: event,
            data: messageData,
            origin: this.url,
            target: socket.target
          })
        );
      }
    });
  }

  /*
   * Returns an array of websockets which are listening to this server
   * TOOD: this should return a set and not be a method
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

  /*
   * Simulate an event from the server to the clients. Useful for
   * simulating errors.
   */
  simulate(event) {
    const listeners = networkBridge.websocketsLookup(this.url);

    if (event === 'error') {
      listeners.forEach(socket => {
        socket.readyState = WebSocket.CLOSED;
        socket.dispatchEvent(createEvent({ type: 'error', target: socket.target }));
      });
    }
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
