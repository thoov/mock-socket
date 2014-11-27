var webSocketMessage = require('./websocket-message');

function webSocketProperties(websocket) {
  /*
  * Defining custom setters for the 4 mocked methods: onopen, onmessage, onerror, and onclose.
  */
  Object.defineProperties(websocket, {
    onopen: {
      enumerable: true,
      get: function() { return websocket._onopen; },
      set: function(callback) {
        websocket._onopen = callback;

        // TODO: look into getting rid of this setTimeout since we are using the one below
        window.setTimeout(function(context) {
          // the readystate might be in the error case if the server is not setup
          // so we need to check that the readystate is open
          if(context.readyState === MockSocks.OPEN) {
            callback.call(context, webSocketMessage(null, context.url));
          }
        }, 0, websocket);
      }
    },
    onmessage: {
      enumerable: true,
      get: function() { return websocket._onmessage; },
      set: function(callback) {
        websocket._onmessage = callback;
        websocket.protocol.subject.observe('clientOnMessage', callback, websocket);
      }
    },
  });
};

module.exports = webSocketProperties;
