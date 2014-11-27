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
        websocket.protocol.subject.observe('clientOnOpen', callback, websocket);
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
    onclose: {
      enumerable: true,
      get: function() { return websocket._onclose; },
      set: function(callback) {
        websocket._onclose = callback;
        websocket.protocol.subject.observe('clientHasLeft', callback, websocket);
      }
    }
  });
};

module.exports = webSocketProperties;
