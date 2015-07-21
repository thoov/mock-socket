import delay from './helpers/delay';
import networkBridge from './network-bridge';
import createEvent from './event-factory';
import EventTarget from './event-target';
import URI from 'urijs';

class WebSocket extends EventTarget {

  /*
  * 
  */
  constructor(url) {
    super();

    /*
    *
    */
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
        set: function(callback) {
          this.addEventListener('open', callback);
        }
      },
      onmessage: {
        configurable: true,
        enumerable: true,
        get: function() { return this.listeners.message; },
        set: function(callback) {
          this.addEventListener('message', callback);
        }
      },
      onclose: {
        configurable: true,
        enumerable: true,
        get: function() { return this.listeners.close; },
        set: function(callback) {
          this.addEventListener('close', callback);
        }
      },
      onerror: {
        configurable: true,
        enumerable: true,
        get: function() { return this.listeners.error; },
        set: function(callback) {
          this.addEventListener('error', callback);
        }
      }
    });

    /*
    *
    */
    delay(function() {
      var server = networkBridge.connect(this, this.url);
      var openEvent = createEvent({
        type: 'open',
        target: this
      });

      var openServerEvent = createEvent({
        type: 'connection'
      });

      if(server) {
        server.dispatchEvent(openServerEvent, server);
        this.dispatchEvent(openEvent);
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
    var messageEvent = createEvent({
      type: 'message',
      kind: 'MessageEvent',
      origin: this.url,
      data: data
    });

    var server = networkBridge.connect(this, this.url);
    server.dispatchEvent(messageEvent, data);
  }

  /*
  * This is a mock for the native close function found on the WebSocket object. It notifies the
  * service that it is closing the connection.
  */
  close() {
    var closeEvent = createEvent({
      type: 'close',
      target: this
    });

    var server = networkBridge.connect(this, this.url);
    this.readyState = WebSocket.CLOSED;
    this.dispatchEvent(closeEvent);
    server.dispatchEvent(closeEvent, server);
  }
}

WebSocket.CONNECTING = 0;
WebSocket.OPEN       = 1;
WebSocket.CLOSING    = 2;
WebSocket.CLOSED     = 3;

export default WebSocket;
