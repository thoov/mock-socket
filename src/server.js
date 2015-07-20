import EventTarget  from './helpers/event-target';
import urlTransform from './helpers/url-transform';
import networkBridge from './helpers/bridge';
import createEvent from './helpers/event-factory';

/*
*
*/
class Server extends EventTarget {

  constructor(url) {
    super();
    this.url = urlTransform(url);
    networkBridge.attachServer(this, this.url);
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
    var messageEvent = createEvent({
      type: 'message',
      kind: 'MessageEvent',
      data,
      origin: this.url
    });

    networkBridge.broadcast(this.url, messageEvent);
  }

  /*
  * Notifies all mock clients that the server is closing and their onclose callbacks should fire.
  */
  close() {}
}

export default Server;
