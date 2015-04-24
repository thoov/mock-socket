/*
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
      get: function() { return this._onopen; },
      set: function(callback) {
        this._onopen = eventMessageSource(callback);
        // Dispose the previous listeners ('set' overrides)
        this.service.clearAll('clientOnOpen');
        this.service.setCallbackObserver('clientOnOpen', this._onopen, websocket);
      }
    },
    onmessage: {
      enumerable: true,
      get: function() { return this._onmessage; },
      set: function(callback) {
        this._onmessage = eventMessageSource(callback);
        // Dispose the previous listeners ('set' overrides)
        this.service.clearAll('clientOnMessage');
        this.service.setCallbackObserver('clientOnMessage', this._onmessage, websocket);
      }
    },
    onclose: {
      enumerable: true,
      get: function() { return this._onclose; },
      set: function(callback) {
        this._onclose = eventMessageSource(callback);
        // Dispose the previous listeners ('set' overrides)
        this.service.clearAll('clientOnclose');
        this.service.setCallbackObserver('clientOnclose', this._onclose, websocket);
      }
    },
    onerror: {
      enumerable: true,
      get: function() { return this._onerror; },
      set: function(callback) {
        this._onerror = eventMessageSource(callback);
        // Dispose the previous listeners ('set' overrides)
        this.service.clearAll('clientOnError');
        this.service.setCallbackObserver('clientOnError', this._onerror, websocket);
      }
    }
  });
};

module.exports = webSocketProperties;
