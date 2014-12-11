/**
* This defines four methods: onopen, onmessage, onerror, and onclose. This is done this way instead of
* just placing the methods on the prototype because we need to capture the callback when it is defined like so:
*
* mockSocket.onopen = function() { // this is what we need to store };
*
* The only way is to capture the callback via the custom setter below and then place them into the correct
* namespace so they get invoked at the right time.
*
* @param {websocket: object} The websocket object which we want to define these properties onto
*/
function webSocketProperties(websocket) {
  var eventMessageSource = function(callback) {
    return function(event) {
      event.target = websocket;
      callback.apply(websocket, arguments);
    }
  };

  Object.defineProperties(websocket, {
    onopen: {
      enumerable: true,
      get: function() { return websocket._onopen; },
      set: function(callback) {
        websocket._onopen = eventMessageSource(callback);
        websocket.protocol.subject.observe('clientOnOpen', websocket._onopen, websocket);
      }
    },
    onmessage: {
      enumerable: true,
      get: function() { return websocket._onmessage; },
      set: function(callback) {
        websocket._onmessage = eventMessageSource(callback);
        websocket.protocol.subject.observe('clientOnMessage', websocket._onmessage, websocket);
      }
    },
    onclose: {
      enumerable: true,
      get: function() { return websocket._onclose; },
      set: function(callback) {
        websocket._onclose = eventMessageSource(callback);
        websocket.protocol.subject.observe('clientHasLeft', websocket._onclose, websocket);
      }
    },
    onerror: {
      enumerable: true,
      get: function() { return websocket._onerror; },
      set: function(callback) {
        websocket._onerror = eventMessageSource(callback);
        websocket.protocol.subject.observe('clientOnError', websocket._onerror, websocket);
      }
    }
  });
};

module.exports = webSocketProperties;
