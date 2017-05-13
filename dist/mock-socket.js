(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.Mock = global.Mock || {})));
}(this, (function (exports) { 'use strict';

/*
* This delay allows the thread to finish assigning its on* methods
* before invoking the delay callback. This is purely a timing hack.
* http://geekabyte.blogspot.com/2014/01/javascript-effect-of-setting-settimeout.html
*
* @param {callback: function} the callback which will be invoked after the timeout
* @parma {context: object} the context in which to invoke the function
*/
function delay(callback, context) {
  setTimeout(function (timeoutContext) { return callback.call(timeoutContext); }, 4, context);
}

function reject(array, callback) {
  var results = [];
  array.forEach(function (itemInArray) {
    if (!callback(itemInArray)) {
      results.push(itemInArray);
    }
  });

  return results;
}

function filter(array, callback) {
  var results = [];
  array.forEach(function (itemInArray) {
    if (callback(itemInArray)) {
      results.push(itemInArray);
    }
  });

  return results;
}

/*
* EventTarget is an interface implemented by objects that can
* receive events and may have listeners for them.
*
* https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
*/
var EventTarget = function EventTarget() {
  this.listeners = {};
};

/*
* Ties a listener function to an event type which can later be invoked via the
* dispatchEvent method.
*
* @param {string} type - the type of event (ie: 'open', 'message', etc.)
* @param {function} listener - the callback function to invoke whenever an event is dispatched matching the given type
* @param {boolean} useCapture - N/A TODO: implement useCapture functionality
*/
EventTarget.prototype.addEventListener = function addEventListener (type, listener /* , useCapture */) {
  if (typeof listener === 'function') {
    if (!Array.isArray(this.listeners[type])) {
      this.listeners[type] = [];
    }

    // Only add the same function once
    if (filter(this.listeners[type], function (item) { return item === listener; }).length === 0) {
      this.listeners[type].push(listener);
    }
  }
};

/*
* Removes the listener so it will no longer be invoked via the dispatchEvent method.
*
* @param {string} type - the type of event (ie: 'open', 'message', etc.)
* @param {function} listener - the callback function to invoke whenever an event is dispatched matching the given type
* @param {boolean} useCapture - N/A TODO: implement useCapture functionality
*/
EventTarget.prototype.removeEventListener = function removeEventListener (type, removingListener /* , useCapture */) {
  var arrayOfListeners = this.listeners[type];
  this.listeners[type] = reject(arrayOfListeners, function (listener) { return listener === removingListener; });
};

/*
* Invokes all listener functions that are listening to the given event.type property. Each
* listener will be passed the event as the first argument.
*
* @param {object} event - event object which will be passed to all listeners of the event.type property
*/
EventTarget.prototype.dispatchEvent = function dispatchEvent (event) {
    var this$1 = this;
    var customArguments = [], len = arguments.length - 1;
    while ( len-- > 0 ) customArguments[ len ] = arguments[ len + 1 ];

  var eventName = event.type;
  var listeners = this.listeners[eventName];

  if (!Array.isArray(listeners)) {
    return false;
  }

  listeners.forEach(function (listener) {
    if (customArguments.length > 0) {
      listener.apply(this$1, customArguments);
    } else {
      listener.call(this$1, event);
    }
  });

  return true;
};

/*
* The network bridge is a way for the mock websocket object to 'communicate' with
* all available servers. This is a singleton object so it is important that you
* clean up urlMap whenever you are finished.
*/
var NetworkBridge = function NetworkBridge() {
  this.urlMap = {};
};

/*
* Attaches a websocket object to the urlMap hash so that it can find the server
* it is connected to and the server in turn can find it.
*
* @param {object} websocket - websocket object to add to the urlMap hash
* @param {string} url
*/
NetworkBridge.prototype.attachWebSocket = function attachWebSocket (websocket, url) {
  var connectionLookup = this.urlMap[url];

  if (connectionLookup &&
      connectionLookup.server &&
      connectionLookup.websockets.indexOf(websocket) === -1) {
    connectionLookup.websockets.push(websocket);
    return connectionLookup.server;
  }
};

/*
* Attaches a websocket to a room
*/
NetworkBridge.prototype.addMembershipToRoom = function addMembershipToRoom (websocket, room) {
  var connectionLookup = this.urlMap[websocket.url];

  if (connectionLookup &&
      connectionLookup.server &&
      connectionLookup.websockets.indexOf(websocket) !== -1) {
    if (!connectionLookup.roomMemberships[room]) {
      connectionLookup.roomMemberships[room] = [];
    }

    connectionLookup.roomMemberships[room].push(websocket);
  }
};

/*
* Attaches a server object to the urlMap hash so that it can find a websockets
* which are connected to it and so that websockets can in turn can find it.
*
* @param {object} server - server object to add to the urlMap hash
* @param {string} url
*/
NetworkBridge.prototype.attachServer = function attachServer (server, url) {
  var connectionLookup = this.urlMap[url];

  if (!connectionLookup) {
    this.urlMap[url] = {
      server: server,
      websockets: [],
      roomMemberships: {}
    };

    return server;
  }
};

/*
* Finds the server which is 'running' on the given url.
*
* @param {string} url - the url to use to find which server is running on it
*/
NetworkBridge.prototype.serverLookup = function serverLookup (url) {
  var connectionLookup = this.urlMap[url];

  if (connectionLookup) {
    return connectionLookup.server;
  }
};

/*
* Finds all websockets which is 'listening' on the given url.
*
* @param {string} url - the url to use to find all websockets which are associated with it
* @param {string} room - if a room is provided, will only return sockets in this room
* @param {class} broadcaster - socket that is broadcasting and is to be excluded from the lookup
*/
NetworkBridge.prototype.websocketsLookup = function websocketsLookup (url, room, broadcaster) {
  var websockets;
  var connectionLookup = this.urlMap[url];

  websockets = connectionLookup ? connectionLookup.websockets : [];

  if (room) {
    var members = connectionLookup.roomMemberships[room];
    websockets = members || [];
  }

  return broadcaster ? websockets.filter(function (websocket) { return websocket !== broadcaster; }) : websockets;
};

/*
* Removes the entry associated with the url.
*
* @param {string} url
*/
NetworkBridge.prototype.removeServer = function removeServer (url) {
  delete this.urlMap[url];
};

/*
* Removes the individual websocket from the map of associated websockets.
*
* @param {object} websocket - websocket object to remove from the url map
* @param {string} url
*/
NetworkBridge.prototype.removeWebSocket = function removeWebSocket (websocket, url) {
  var connectionLookup = this.urlMap[url];

  if (connectionLookup) {
    connectionLookup.websockets = reject(connectionLookup.websockets, function (socket) { return socket === websocket; });
  }
};

/*
* Removes a websocket from a room
*/
NetworkBridge.prototype.removeMembershipFromRoom = function removeMembershipFromRoom (websocket, room) {
  var connectionLookup = this.urlMap[websocket.url];
  var memberships = connectionLookup.roomMemberships[room];

  if (connectionLookup && memberships !== null) {
    connectionLookup.roomMemberships[room] = reject(memberships, function (socket) { return socket === websocket; });
  }
};

var networkBridge = new NetworkBridge(); // Note: this is a singleton

/*
* https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
*/
var codes = {
  CLOSE_NORMAL: 1000,
  CLOSE_GOING_AWAY: 1001,
  CLOSE_PROTOCOL_ERROR: 1002,
  CLOSE_UNSUPPORTED: 1003,
  CLOSE_NO_STATUS: 1005,
  CLOSE_ABNORMAL: 1006,
  CLOSE_TOO_LARGE: 1009
};

function normalizeUrl(url) {
  var parts = url.split('://');
  return (parts[1] && parts[1].indexOf('/') === -1) ? (url + "/") : url;
}

function log(method, message) {
  /* eslint-disable no-console */
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
    console[method].call(null, message);
  }
  /* eslint-enable no-console */
}

var EventPrototype = function EventPrototype () {};

EventPrototype.prototype.stopPropagation = function stopPropagation () {};
EventPrototype.prototype.stopImmediatePropagation = function stopImmediatePropagation () {};

// if no arguments are passed then the type is set to "undefined" on
// chrome and safari.
EventPrototype.prototype.initEvent = function initEvent (type, bubbles, cancelable) {
    if ( type === void 0 ) type = 'undefined';
    if ( bubbles === void 0 ) bubbles = false;
    if ( cancelable === void 0 ) cancelable = false;

  this.type = String(type);
  this.bubbles = Boolean(bubbles);
  this.cancelable = Boolean(cancelable);
};

var Event = (function (EventPrototype$$1) {
  function Event(type, eventInitConfig) {
    if ( eventInitConfig === void 0 ) eventInitConfig = {};

    EventPrototype$$1.call(this);

    if (!type) {
      throw new TypeError('Failed to construct \'Event\': 1 argument required, but only 0 present.');
    }

    if (typeof eventInitConfig !== 'object') {
      throw new TypeError('Failed to construct \'Event\': parameter 2 (\'eventInitDict\') is not an object');
    }

    var bubbles = eventInitConfig.bubbles;
    var cancelable = eventInitConfig.cancelable;

    this.type = String(type);
    this.timeStamp = Date.now();
    this.target = null;
    this.srcElement = null;
    this.returnValue = true;
    this.isTrusted = false;
    this.eventPhase = 0;
    this.defaultPrevented = false;
    this.currentTarget = null;
    this.cancelable = cancelable ? Boolean(cancelable) : false;
    this.canncelBubble = false;
    this.bubbles = bubbles ? Boolean(bubbles) : false;
  }

  if ( EventPrototype$$1 ) Event.__proto__ = EventPrototype$$1;
  Event.prototype = Object.create( EventPrototype$$1 && EventPrototype$$1.prototype );
  Event.prototype.constructor = Event;

  return Event;
}(EventPrototype));

var MessageEvent = (function (EventPrototype$$1) {
  function MessageEvent(type, eventInitConfig) {
    if ( eventInitConfig === void 0 ) eventInitConfig = {};

    EventPrototype$$1.call(this);

    if (!type) {
      throw new TypeError('Failed to construct \'MessageEvent\': 1 argument required, but only 0 present.');
    }

    if (typeof eventInitConfig !== 'object') {
      throw new TypeError('Failed to construct \'MessageEvent\': parameter 2 (\'eventInitDict\') is not an object');
    }

    var bubbles = eventInitConfig.bubbles;
    var cancelable = eventInitConfig.cancelable;
    var data = eventInitConfig.data;
    var origin = eventInitConfig.origin;
    var lastEventId = eventInitConfig.lastEventId;
    var ports = eventInitConfig.ports;

    this.type = String(type);
    this.timeStamp = Date.now();
    this.target = null;
    this.srcElement = null;
    this.returnValue = true;
    this.isTrusted = false;
    this.eventPhase = 0;
    this.defaultPrevented = false;
    this.currentTarget = null;
    this.cancelable = cancelable ? Boolean(cancelable) : false;
    this.canncelBubble = false;
    this.bubbles = bubbles ? Boolean(bubbles) : false;
    this.origin = origin ? String(origin) : '';
    this.ports = typeof ports === 'undefined' ? null : ports;
    this.data = typeof data === 'undefined' ? null : data;
    this.lastEventId = lastEventId ? String(lastEventId) : '';
  }

  if ( EventPrototype$$1 ) MessageEvent.__proto__ = EventPrototype$$1;
  MessageEvent.prototype = Object.create( EventPrototype$$1 && EventPrototype$$1.prototype );
  MessageEvent.prototype.constructor = MessageEvent;

  return MessageEvent;
}(EventPrototype));

var CloseEvent = (function (EventPrototype$$1) {
  function CloseEvent(type, eventInitConfig) {
    if ( eventInitConfig === void 0 ) eventInitConfig = {};

    EventPrototype$$1.call(this);

    if (!type) {
      throw new TypeError('Failed to construct \'CloseEvent\': 1 argument required, but only 0 present.');
    }

    if (typeof eventInitConfig !== 'object') {
      throw new TypeError('Failed to construct \'CloseEvent\': parameter 2 (\'eventInitDict\') is not an object');
    }

    var bubbles = eventInitConfig.bubbles;
    var cancelable = eventInitConfig.cancelable;
    var code = eventInitConfig.code;
    var reason = eventInitConfig.reason;
    var wasClean = eventInitConfig.wasClean;

    this.type = String(type);
    this.timeStamp = Date.now();
    this.target = null;
    this.srcElement = null;
    this.returnValue = true;
    this.isTrusted = false;
    this.eventPhase = 0;
    this.defaultPrevented = false;
    this.currentTarget = null;
    this.cancelable = cancelable ? Boolean(cancelable) : false;
    this.canncelBubble = false;
    this.bubbles = bubbles ? Boolean(bubbles) : false;
    this.code = typeof code === 'number' ? Number(code) : 0;
    this.reason = reason ? String(reason) : '';
    this.wasClean = wasClean ? Boolean(wasClean) : false;
  }

  if ( EventPrototype$$1 ) CloseEvent.__proto__ = EventPrototype$$1;
  CloseEvent.prototype = Object.create( EventPrototype$$1 && EventPrototype$$1.prototype );
  CloseEvent.prototype.constructor = CloseEvent;

  return CloseEvent;
}(EventPrototype));

/*
* Creates an Event object and extends it to allow full modification of
* its properties.
*
* @param {object} config - within config you will need to pass type and optionally target
*/
function createEvent(config) {
  var type = config.type;
  var target = config.target;
  var eventObject = new Event(type);

  if (target) {
    eventObject.target = target;
    eventObject.srcElement = target;
    eventObject.currentTarget = target;
  }

  return eventObject;
}

/*
* Creates a MessageEvent object and extends it to allow full modification of
* its properties.
*
* @param {object} config - within config: type, origin, data and optionally target
*/
function createMessageEvent(config) {
  var type = config.type;
  var origin = config.origin;
  var data = config.data;
  var target = config.target;
  var messageEvent = new MessageEvent(type, {
    data: data,
    origin: origin
  });

  if (target) {
    messageEvent.target = target;
    messageEvent.srcElement = target;
    messageEvent.currentTarget = target;
  }

  return messageEvent;
}

/*
* Creates a CloseEvent object and extends it to allow full modification of
* its properties.
*
* @param {object} config - within config: type and optionally target, code, and reason
*/
function createCloseEvent(config) {
  var code = config.code;
  var reason = config.reason;
  var type = config.type;
  var target = config.target;
  var wasClean = config.wasClean;

  if (!wasClean) {
    wasClean = (code === 1000);
  }

  var closeEvent = new CloseEvent(type, {
    code: code,
    reason: reason,
    wasClean: wasClean
  });

  if (target) {
    closeEvent.target = target;
    closeEvent.srcElement = target;
    closeEvent.currentTarget = target;
  }

  return closeEvent;
}

/*
* The main websocket class which is designed to mimick the native WebSocket class as close
* as possible.
*
* https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
*/
var WebSocket$1 = (function (EventTarget$$1) {
  function WebSocket(url, protocol) {
    if ( protocol === void 0 ) protocol = '';

    EventTarget$$1.call(this);

    if (!url) {
      throw new TypeError('Failed to construct \'WebSocket\': 1 argument required, but only 0 present.');
    }

    this.binaryType = 'blob';
    this.url = normalizeUrl(url);
    this.readyState = WebSocket.CONNECTING;
    this.protocol = '';

    if (typeof protocol === 'string') {
      this.protocol = protocol;
    } else if (Array.isArray(protocol) && protocol.length > 0) {
      this.protocol = protocol[0];
    }

    /*
    * In order to capture the callback function we need to define custom setters.
    * To illustrate:
    *   mySocket.onopen = function() { alert(true) };
    *
    * The only way to capture that function and hold onto it for later is with the
    * below code:
    */
    Object.defineProperties(this, {
      onopen: {
        configurable: true,
        enumerable: true,
        get: function get() { return this.listeners.open; },
        set: function set(listener) {
          this.addEventListener('open', listener);
        }
      },
      onmessage: {
        configurable: true,
        enumerable: true,
        get: function get() { return this.listeners.message; },
        set: function set(listener) {
          this.addEventListener('message', listener);
        }
      },
      onclose: {
        configurable: true,
        enumerable: true,
        get: function get() { return this.listeners.close; },
        set: function set(listener) {
          this.addEventListener('close', listener);
        }
      },
      onerror: {
        configurable: true,
        enumerable: true,
        get: function get() { return this.listeners.error; },
        set: function set(listener) {
          this.addEventListener('error', listener);
        }
      }
    });

    var server = networkBridge.attachWebSocket(this, this.url);

    /*
    * This delay is needed so that we dont trigger an event before the callbacks have been
    * setup. For example:
    *
    * var socket = new WebSocket('ws://localhost');
    *
    * // If we dont have the delay then the event would be triggered right here and this is
    * // before the onopen had a chance to register itself.
    *
    * socket.onopen = () => { // this would never be called };
    *
    * // and with the delay the event gets triggered here after all of the callbacks have been
    * // registered :-)
    */
    delay(function delayCallback() {
      if (server) {
        if (server.options.verifyClient
          && typeof server.options.verifyClient === 'function'
          && !server.options.verifyClient()) {
          this.readyState = WebSocket.CLOSED;

          log(
            'error',
            ("WebSocket connection to '" + (this.url) + "' failed: HTTP Authentication failed; no valid credentials available")
          );

          networkBridge.removeWebSocket(this, this.url);
          this.dispatchEvent(createEvent({ type: 'error', target: this }));
          this.dispatchEvent(createCloseEvent({ type: 'close', target: this, code: codes.CLOSE_NORMAL }));
        } else {
          this.readyState = WebSocket.OPEN;
          server.dispatchEvent(createEvent({ type: 'connection' }), server, this);
          this.dispatchEvent(createEvent({ type: 'open', target: this }));
        }
      } else {
        this.readyState = WebSocket.CLOSED;
        this.dispatchEvent(createEvent({ type: 'error', target: this }));
        this.dispatchEvent(createCloseEvent({ type: 'close', target: this, code: codes.CLOSE_NORMAL }));

        log('error', ("WebSocket connection to '" + (this.url) + "' failed"));
      }
    }, this);
  }

  if ( EventTarget$$1 ) WebSocket.__proto__ = EventTarget$$1;
  WebSocket.prototype = Object.create( EventTarget$$1 && EventTarget$$1.prototype );
  WebSocket.prototype.constructor = WebSocket;

  /*
  * Transmits data to the server over the WebSocket connection.
  *
  * https://developer.mozilla.org/en-US/docs/Web/API/WebSocket#send()
  */
  WebSocket.prototype.send = function send (data) {
    if (this.readyState === WebSocket.CLOSING || this.readyState === WebSocket.CLOSED) {
      throw new Error('WebSocket is already in CLOSING or CLOSED state');
    }

    var messageEvent = createMessageEvent({
      type: 'message',
      origin: this.url,
      data: data
    });

    var server = networkBridge.serverLookup(this.url);

    if (server) {
      server.dispatchEvent(messageEvent, data);
    }
  };

  /*
  * Closes the WebSocket connection or connection attempt, if any.
  * If the connection is already CLOSED, this method does nothing.
  *
  * https://developer.mozilla.org/en-US/docs/Web/API/WebSocket#close()
  */
  WebSocket.prototype.close = function close () {
    if (this.readyState !== WebSocket.OPEN) { return undefined; }

    var server = networkBridge.serverLookup(this.url);
    var closeEvent = createCloseEvent({
      type: 'close',
      target: this,
      code: codes.CLOSE_NORMAL
    });

    networkBridge.removeWebSocket(this, this.url);

    this.readyState = WebSocket.CLOSED;
    this.dispatchEvent(closeEvent);

    if (server) {
      server.dispatchEvent(closeEvent, server);
    }
  };

  return WebSocket;
}(EventTarget));

WebSocket$1.CONNECTING = 0;
WebSocket$1.OPEN = 1;
WebSocket$1.CLOSING = 2;
WebSocket$1.CLOSED = 3;

function retrieveGlobalObject() {
  if (typeof window !== 'undefined') {
    return window;
  }

  return (typeof process === 'object' &&
      typeof require === 'function' &&
      typeof global === 'object') ? global : this;
}

var dedupe = function (arr) {
  return arr.reduce(function(deduped, b){
  	if (deduped.indexOf(b) > -1) { return deduped; }
    return deduped.concat(b);
  }, []);
};

/*
* https://github.com/websockets/ws#server-example
*/
var Server$1 = (function (EventTarget$$1) {
  function Server(url, options) {
    if ( options === void 0 ) options = {};

    EventTarget$$1.call(this);
    this.url = normalizeUrl(url);
    this.originalWebSocket = null;
    var server = networkBridge.attachServer(this, this.url);

    if (!server) {
      this.dispatchEvent(createEvent({ type: 'error' }));
      throw new Error('A mock server is already listening on this url');
    }

    if (typeof options.verifiyClient === 'undefined') {
      options.verifiyClient = null;
    }

    this.options = options;

    this.start();
  }

  if ( EventTarget$$1 ) Server.__proto__ = EventTarget$$1;
  Server.prototype = Object.create( EventTarget$$1 && EventTarget$$1.prototype );
  Server.prototype.constructor = Server;

  /*
  * Attaches the mock websocket object to the global object
  */
  Server.prototype.start = function start () {
    var globalObj = retrieveGlobalObject();

    if (globalObj.WebSocket) {
      this.originalWebSocket = globalObj.WebSocket;
    }

    globalObj.WebSocket = WebSocket$1;
  };

  /*
  * Removes the mock websocket object from the global object
  */
  Server.prototype.stop = function stop (callback) {
    if ( callback === void 0 ) callback = function () {};

    var globalObj = retrieveGlobalObject();

    if (this.originalWebSocket) {
      globalObj.WebSocket = this.originalWebSocket;
    } else {
      delete globalObj.WebSocket;
    }

    this.originalWebSocket = null;

    networkBridge.removeServer(this.url);

    if (typeof callback === 'function') {
      callback();
    }
  };

  /*
  * This is the main function for the mock server to subscribe to the on events.
  *
  * ie: mockServer.on('connection', function() { console.log('a mock client connected'); });
  *
  * @param {string} type - The event key to subscribe to. Valid keys are: connection, message, and close.
  * @param {function} callback - The callback which should be called when a certain event is fired.
  */
  Server.prototype.on = function on (type, callback) {
    this.addEventListener(type, callback);
  };

  /*
  * This send function will notify all mock clients via their onmessage callbacks that the server
  * has a message for them.
  *
  * @param {*} data - Any javascript object which will be crafted into a MessageObject.
  */
  Server.prototype.send = function send (data, options) {
    if ( options === void 0 ) options = {};

    this.emit('message', data, options);
  };

  /*
  * Sends a generic message event to all mock clients.
  */
  Server.prototype.emit = function emit (event, data, options) {
    var this$1 = this;
    if ( options === void 0 ) options = {};

    var websockets = options.websockets;

    if (!websockets) {
      websockets = networkBridge.websocketsLookup(this.url);
    }

    if (typeof options !== 'object' || arguments.length > 3) {
      data = Array.prototype.slice.call(arguments, 1, arguments.length);
    }

    websockets.forEach(function (socket) {
      if (Array.isArray(data)) {
        socket.dispatchEvent.apply(socket, [ createMessageEvent({
          type: event,
          data: data,
          origin: this$1.url,
          target: socket
        }) ].concat( data ));
      } else {
        socket.dispatchEvent(createMessageEvent({
          type: event,
          data: data,
          origin: this$1.url,
          target: socket
        }));
      }
    });
  };

  /*
  * Closes the connection and triggers the onclose method of all listening
  * websockets. After that it removes itself from the urlMap so another server
  * could add itself to the url.
  *
  * @param {object} options
  */
  Server.prototype.close = function close (options) {
    if ( options === void 0 ) options = {};

    var code = options.code;
    var reason = options.reason;
    var wasClean = options.wasClean;
    var listeners = networkBridge.websocketsLookup(this.url);

    listeners.forEach(function (socket) {
      socket.readyState = WebSocket$1.CLOSE;
      socket.dispatchEvent(createCloseEvent({
        type: 'close',
        target: socket,
        code: code || codes.CLOSE_NORMAL,
        reason: reason || '',
        wasClean: wasClean
      }));
    });

    this.dispatchEvent(createCloseEvent({ type: 'close' }), this);
    networkBridge.removeServer(this.url);
  };

  /*
  * Returns an array of websockets which are listening to this server
  */
  Server.prototype.clients = function clients () {
    return networkBridge.websocketsLookup(this.url);
  };

  /*
  * Prepares a method to submit an event to members of the room
  *
  * e.g. server.to('my-room').emit('hi!');
  */
  Server.prototype.to = function to (room, broadcaster, broadcastList) {
    var this$1 = this;
    if ( broadcastList === void 0 ) broadcastList = [];

    var self = this;
    var websockets = dedupe(broadcastList.concat(
      networkBridge.websocketsLookup(this.url, room, broadcaster)
    ));

    return {
      to: function (chainedRoom, chainedBroadcaster) { return this$1.to.call(this$1, chainedRoom, chainedBroadcaster, websockets); },
      emit: function emit(event, data) {
        self.emit(event, data, { websockets: websockets });
      }
    };
  };

  /*
   * Alias for Server.to
   */
  Server.prototype.in = function in$1 () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return this.to.apply(null, args);
  };

  return Server;
}(EventTarget));

/*
 * Alternative constructor to support namespaces in socket.io
 *
 * http://socket.io/docs/rooms-and-namespaces/#custom-namespaces
 */
Server$1.of = function of(url) {
  return new Server$1(url);
};

/*
* The socket-io class is designed to mimick the real API as closely as possible.
*
* http://socket.io/docs/
*/
var SocketIO$1 = (function (EventTarget$$1) {
  function SocketIO(url, protocol) {
    var this$1 = this;
    if ( url === void 0 ) url = 'socket.io';
    if ( protocol === void 0 ) protocol = '';

    EventTarget$$1.call(this);

    this.binaryType = 'blob';
    this.url = normalizeUrl(url);
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
    delay(function delayCallback() {
      if (server) {
        this.readyState = SocketIO.OPEN;
        server.dispatchEvent(createEvent({ type: 'connection' }), server, this);
        server.dispatchEvent(createEvent({ type: 'connect' }), server, this); // alias
        this.dispatchEvent(createEvent({ type: 'connect', target: this }));
      } else {
        this.readyState = SocketIO.CLOSED;
        this.dispatchEvent(createEvent({ type: 'error', target: this }));
        this.dispatchEvent(createCloseEvent({
          type: 'close',
          target: this,
          code: codes.CLOSE_NORMAL
        }));

        log('error', ("Socket.io connection to '" + (this.url) + "' failed"));
      }
    }, this);

    /**
      Add an aliased event listener for close / disconnect
     */
    this.addEventListener('close', function (event) {
      this$1.dispatchEvent(createCloseEvent({
        type: 'disconnect',
        target: event.target,
        code: event.code
      }));
    });
  }

  if ( EventTarget$$1 ) SocketIO.__proto__ = EventTarget$$1;
  SocketIO.prototype = Object.create( EventTarget$$1 && EventTarget$$1.prototype );
  SocketIO.prototype.constructor = SocketIO;

  var prototypeAccessors = { broadcast: {} };

  /*
  * Closes the SocketIO connection or connection attempt, if any.
  * If the connection is already CLOSED, this method does nothing.
  */
  SocketIO.prototype.close = function close () {
    if (this.readyState !== SocketIO.OPEN) { return undefined; }

    var server = networkBridge.serverLookup(this.url);
    networkBridge.removeWebSocket(this, this.url);

    this.readyState = SocketIO.CLOSED;
    this.dispatchEvent(createCloseEvent({
      type: 'close',
      target: this,
      code: codes.CLOSE_NORMAL
    }));

    if (server) {
      server.dispatchEvent(createCloseEvent({
        type: 'disconnect',
        target: this,
        code: codes.CLOSE_NORMAL
      }), server);
    }
  };

  /*
  * Alias for Socket#close
  *
  * https://github.com/socketio/socket.io-client/blob/master/lib/socket.js#L383
  */
  SocketIO.prototype.disconnect = function disconnect () {
    this.close();
  };

  /*
  * Submits an event to the server with a payload
  */
  SocketIO.prototype.emit = function emit (event) {
    var data = [], len = arguments.length - 1;
    while ( len-- > 0 ) data[ len ] = arguments[ len + 1 ];

    if (this.readyState !== SocketIO.OPEN) {
      throw new Error('SocketIO is already in CLOSING or CLOSED state');
    }

    var messageEvent = createMessageEvent({
      type: event,
      origin: this.url,
      data: data
    });

    var server = networkBridge.serverLookup(this.url);

    if (server) {
      server.dispatchEvent.apply(server, [ messageEvent ].concat( data ));
    }
  };

  /*
  * Submits a 'message' event to the server.
  *
  * Should behave exactly like WebSocket#send
  *
  * https://github.com/socketio/socket.io-client/blob/master/lib/socket.js#L113
  */
  SocketIO.prototype.send = function send (data) {
    this.emit('message', data);
  };

  /*
  * For broadcasting events to other connected sockets.
  *
  * e.g. socket.broadcast.emit('hi!');
  * e.g. socket.broadcast.to('my-room').emit('hi!');
  */
  prototypeAccessors.broadcast.get = function () {
    if (this.readyState !== SocketIO.OPEN) {
      throw new Error('SocketIO is already in CLOSING or CLOSED state');
    }

    var self = this;
    var server = networkBridge.serverLookup(this.url);
    if (!server) {
      throw new Error(("SocketIO can not find a server at the specified URL (" + (this.url) + ")"));
    }

    return {
      emit: function emit(event, data) {
        server.emit(event, data, { websockets: networkBridge.websocketsLookup(self.url, null, self) });
      },
      to: function to(room) {
        return server.to(room, self);
      },
      in: function in$1(room) {
        return server.in(room, self);
      }
    };
  };

  /*
  * For registering events to be received from the server
  */
  SocketIO.prototype.on = function on (type, callback) {
    this.addEventListener(type, callback);
  };

  /*
   * Join a room on a server
   *
   * http://socket.io/docs/rooms-and-namespaces/#joining-and-leaving
   */
  SocketIO.prototype.join = function join (room) {
    networkBridge.addMembershipToRoom(this, room);
  };

  /*
   * Get the websocket to leave the room
   *
   * http://socket.io/docs/rooms-and-namespaces/#joining-and-leaving
   */
  SocketIO.prototype.leave = function leave (room) {
    networkBridge.removeMembershipFromRoom(this, room);
  };

  SocketIO.prototype.to = function to (room) {
    return this.broadcast.to(room);
  };

  SocketIO.prototype.in = function in$1 () {
    return this.to.apply(null, args);
  };

  /*
   * Invokes all listener functions that are listening to the given event.type property. Each
   * listener will be passed the event as the first argument.
   *
   * @param {object} event - event object which will be passed to all listeners of the event.type property
   */
  SocketIO.prototype.dispatchEvent = function dispatchEvent (event) {
    var this$1 = this;
    var customArguments = [], len = arguments.length - 1;
    while ( len-- > 0 ) customArguments[ len ] = arguments[ len + 1 ];

    var eventName = event.type;
    var listeners = this.listeners[eventName];

    if (!Array.isArray(listeners)) {
      return false;
    }

    listeners.forEach(function (listener) {
      if (customArguments.length > 0) {
        listener.apply(this$1, customArguments);
      } else {
        // Regular WebSockets expect a MessageEvent but Socketio.io just wants raw data
        //  payload instanceof MessageEvent works, but you can't isntance of NodeEvent
        //  for now we detect if the output has data defined on it
        listener.call(this$1, event.data ? event.data : event);
      }
    });
  };

  Object.defineProperties( SocketIO.prototype, prototypeAccessors );

  return SocketIO;
}(EventTarget));

SocketIO$1.CONNECTING = 0;
SocketIO$1.OPEN = 1;
SocketIO$1.CLOSING = 2;
SocketIO$1.CLOSED = 3;

/*
* Static constructor methods for the IO Socket
*/
var IO = function ioConstructor(url) {
  return new SocketIO$1(url);
};

/*
* Alias the raw IO() constructor
*/
IO.connect = function ioConnect(url) {
  /* eslint-disable new-cap */
  return IO(url);
  /* eslint-enable new-cap */
};

var Server = Server$1;
var WebSocket = WebSocket$1;
var SocketIO = IO;

exports.Server = Server;
exports.WebSocket = WebSocket;
exports.SocketIO = SocketIO;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9jay1zb2NrZXQuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9oZWxwZXJzL2RlbGF5LmpzIiwiLi4vc3JjL2hlbHBlcnMvYXJyYXktaGVscGVycy5qcyIsIi4uL3NyYy9ldmVudC10YXJnZXQuanMiLCIuLi9zcmMvbmV0d29yay1icmlkZ2UuanMiLCIuLi9zcmMvaGVscGVycy9jbG9zZS1jb2Rlcy5qcyIsIi4uL3NyYy9oZWxwZXJzL25vcm1hbGl6ZS11cmwuanMiLCIuLi9zcmMvaGVscGVycy9sb2dnZXIuanMiLCIuLi9zcmMvaGVscGVycy9ldmVudC1wcm90b3R5cGUuanMiLCIuLi9zcmMvaGVscGVycy9ldmVudC5qcyIsIi4uL3NyYy9oZWxwZXJzL21lc3NhZ2UtZXZlbnQuanMiLCIuLi9zcmMvaGVscGVycy9jbG9zZS1ldmVudC5qcyIsIi4uL3NyYy9ldmVudC1mYWN0b3J5LmpzIiwiLi4vc3JjL3dlYnNvY2tldC5qcyIsIi4uL3NyYy9oZWxwZXJzL2dsb2JhbC1vYmplY3QuanMiLCIuLi9zcmMvaGVscGVycy9kZWR1cGUuanMiLCIuLi9zcmMvc2VydmVyLmpzIiwiLi4vc3JjL3NvY2tldC1pby5qcyIsIi4uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuKiBUaGlzIGRlbGF5IGFsbG93cyB0aGUgdGhyZWFkIHRvIGZpbmlzaCBhc3NpZ25pbmcgaXRzIG9uKiBtZXRob2RzXG4qIGJlZm9yZSBpbnZva2luZyB0aGUgZGVsYXkgY2FsbGJhY2suIFRoaXMgaXMgcHVyZWx5IGEgdGltaW5nIGhhY2suXG4qIGh0dHA6Ly9nZWVrYWJ5dGUuYmxvZ3Nwb3QuY29tLzIwMTQvMDEvamF2YXNjcmlwdC1lZmZlY3Qtb2Ytc2V0dGluZy1zZXR0aW1lb3V0Lmh0bWxcbipcbiogQHBhcmFtIHtjYWxsYmFjazogZnVuY3Rpb259IHRoZSBjYWxsYmFjayB3aGljaCB3aWxsIGJlIGludm9rZWQgYWZ0ZXIgdGhlIHRpbWVvdXRcbiogQHBhcm1hIHtjb250ZXh0OiBvYmplY3R9IHRoZSBjb250ZXh0IGluIHdoaWNoIHRvIGludm9rZSB0aGUgZnVuY3Rpb25cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZWxheShjYWxsYmFjaywgY29udGV4dCkge1xuICBzZXRUaW1lb3V0KHRpbWVvdXRDb250ZXh0ID0+IGNhbGxiYWNrLmNhbGwodGltZW91dENvbnRleHQpLCA0LCBjb250ZXh0KTtcbn1cbiIsImV4cG9ydCBmdW5jdGlvbiByZWplY3QoYXJyYXksIGNhbGxiYWNrKSB7XG4gIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgYXJyYXkuZm9yRWFjaCgoaXRlbUluQXJyYXkpID0+IHtcbiAgICBpZiAoIWNhbGxiYWNrKGl0ZW1JbkFycmF5KSkge1xuICAgICAgcmVzdWx0cy5wdXNoKGl0ZW1JbkFycmF5KTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiByZXN1bHRzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyKGFycmF5LCBjYWxsYmFjaykge1xuICBjb25zdCByZXN1bHRzID0gW107XG4gIGFycmF5LmZvckVhY2goKGl0ZW1JbkFycmF5KSA9PiB7XG4gICAgaWYgKGNhbGxiYWNrKGl0ZW1JbkFycmF5KSkge1xuICAgICAgcmVzdWx0cy5wdXNoKGl0ZW1JbkFycmF5KTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiByZXN1bHRzO1xufVxuIiwiaW1wb3J0IHsgcmVqZWN0LCBmaWx0ZXIgfSBmcm9tICcuL2hlbHBlcnMvYXJyYXktaGVscGVycyc7XG5cbi8qXG4qIEV2ZW50VGFyZ2V0IGlzIGFuIGludGVyZmFjZSBpbXBsZW1lbnRlZCBieSBvYmplY3RzIHRoYXQgY2FuXG4qIHJlY2VpdmUgZXZlbnRzIGFuZCBtYXkgaGF2ZSBsaXN0ZW5lcnMgZm9yIHRoZW0uXG4qXG4qIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9FdmVudFRhcmdldFxuKi9cbmNsYXNzIEV2ZW50VGFyZ2V0IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmxpc3RlbmVycyA9IHt9O1xuICB9XG5cbiAgLypcbiAgKiBUaWVzIGEgbGlzdGVuZXIgZnVuY3Rpb24gdG8gYW4gZXZlbnQgdHlwZSB3aGljaCBjYW4gbGF0ZXIgYmUgaW52b2tlZCB2aWEgdGhlXG4gICogZGlzcGF0Y2hFdmVudCBtZXRob2QuXG4gICpcbiAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIHRoZSB0eXBlIG9mIGV2ZW50IChpZTogJ29wZW4nLCAnbWVzc2FnZScsIGV0Yy4pXG4gICogQHBhcmFtIHtmdW5jdGlvbn0gbGlzdGVuZXIgLSB0aGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIHdoZW5ldmVyIGFuIGV2ZW50IGlzIGRpc3BhdGNoZWQgbWF0Y2hpbmcgdGhlIGdpdmVuIHR5cGVcbiAgKiBAcGFyYW0ge2Jvb2xlYW59IHVzZUNhcHR1cmUgLSBOL0EgVE9ETzogaW1wbGVtZW50IHVzZUNhcHR1cmUgZnVuY3Rpb25hbGl0eVxuICAqL1xuICBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyIC8qICwgdXNlQ2FwdHVyZSAqLykge1xuICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheSh0aGlzLmxpc3RlbmVyc1t0eXBlXSkpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbdHlwZV0gPSBbXTtcbiAgICAgIH1cblxuICAgICAgLy8gT25seSBhZGQgdGhlIHNhbWUgZnVuY3Rpb24gb25jZVxuICAgICAgaWYgKGZpbHRlcih0aGlzLmxpc3RlbmVyc1t0eXBlXSwgaXRlbSA9PiBpdGVtID09PSBsaXN0ZW5lcikubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qXG4gICogUmVtb3ZlcyB0aGUgbGlzdGVuZXIgc28gaXQgd2lsbCBubyBsb25nZXIgYmUgaW52b2tlZCB2aWEgdGhlIGRpc3BhdGNoRXZlbnQgbWV0aG9kLlxuICAqXG4gICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSB0aGUgdHlwZSBvZiBldmVudCAoaWU6ICdvcGVuJywgJ21lc3NhZ2UnLCBldGMuKVxuICAqIEBwYXJhbSB7ZnVuY3Rpb259IGxpc3RlbmVyIC0gdGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSB3aGVuZXZlciBhbiBldmVudCBpcyBkaXNwYXRjaGVkIG1hdGNoaW5nIHRoZSBnaXZlbiB0eXBlXG4gICogQHBhcmFtIHtib29sZWFufSB1c2VDYXB0dXJlIC0gTi9BIFRPRE86IGltcGxlbWVudCB1c2VDYXB0dXJlIGZ1bmN0aW9uYWxpdHlcbiAgKi9cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCByZW1vdmluZ0xpc3RlbmVyIC8qICwgdXNlQ2FwdHVyZSAqLykge1xuICAgIGNvbnN0IGFycmF5T2ZMaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVyc1t0eXBlXTtcbiAgICB0aGlzLmxpc3RlbmVyc1t0eXBlXSA9IHJlamVjdChhcnJheU9mTGlzdGVuZXJzLCBsaXN0ZW5lciA9PiBsaXN0ZW5lciA9PT0gcmVtb3ZpbmdMaXN0ZW5lcik7XG4gIH1cblxuICAvKlxuICAqIEludm9rZXMgYWxsIGxpc3RlbmVyIGZ1bmN0aW9ucyB0aGF0IGFyZSBsaXN0ZW5pbmcgdG8gdGhlIGdpdmVuIGV2ZW50LnR5cGUgcHJvcGVydHkuIEVhY2hcbiAgKiBsaXN0ZW5lciB3aWxsIGJlIHBhc3NlZCB0aGUgZXZlbnQgYXMgdGhlIGZpcnN0IGFyZ3VtZW50LlxuICAqXG4gICogQHBhcmFtIHtvYmplY3R9IGV2ZW50IC0gZXZlbnQgb2JqZWN0IHdoaWNoIHdpbGwgYmUgcGFzc2VkIHRvIGFsbCBsaXN0ZW5lcnMgb2YgdGhlIGV2ZW50LnR5cGUgcHJvcGVydHlcbiAgKi9cbiAgZGlzcGF0Y2hFdmVudChldmVudCwgLi4uY3VzdG9tQXJndW1lbnRzKSB7XG4gICAgY29uc3QgZXZlbnROYW1lID0gZXZlbnQudHlwZTtcbiAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVyc1tldmVudE5hbWVdO1xuXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGxpc3RlbmVycykpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBsaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgIGlmIChjdXN0b21Bcmd1bWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBjdXN0b21Bcmd1bWVudHMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGlzdGVuZXIuY2FsbCh0aGlzLCBldmVudCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBFdmVudFRhcmdldDtcbiIsImltcG9ydCB7IHJlamVjdCB9IGZyb20gJy4vaGVscGVycy9hcnJheS1oZWxwZXJzJztcblxuLypcbiogVGhlIG5ldHdvcmsgYnJpZGdlIGlzIGEgd2F5IGZvciB0aGUgbW9jayB3ZWJzb2NrZXQgb2JqZWN0IHRvICdjb21tdW5pY2F0ZScgd2l0aFxuKiBhbGwgYXZhaWxhYmxlIHNlcnZlcnMuIFRoaXMgaXMgYSBzaW5nbGV0b24gb2JqZWN0IHNvIGl0IGlzIGltcG9ydGFudCB0aGF0IHlvdVxuKiBjbGVhbiB1cCB1cmxNYXAgd2hlbmV2ZXIgeW91IGFyZSBmaW5pc2hlZC5cbiovXG5jbGFzcyBOZXR3b3JrQnJpZGdlIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy51cmxNYXAgPSB7fTtcbiAgfVxuXG4gIC8qXG4gICogQXR0YWNoZXMgYSB3ZWJzb2NrZXQgb2JqZWN0IHRvIHRoZSB1cmxNYXAgaGFzaCBzbyB0aGF0IGl0IGNhbiBmaW5kIHRoZSBzZXJ2ZXJcbiAgKiBpdCBpcyBjb25uZWN0ZWQgdG8gYW5kIHRoZSBzZXJ2ZXIgaW4gdHVybiBjYW4gZmluZCBpdC5cbiAgKlxuICAqIEBwYXJhbSB7b2JqZWN0fSB3ZWJzb2NrZXQgLSB3ZWJzb2NrZXQgb2JqZWN0IHRvIGFkZCB0byB0aGUgdXJsTWFwIGhhc2hcbiAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICovXG4gIGF0dGFjaFdlYlNvY2tldCh3ZWJzb2NrZXQsIHVybCkge1xuICAgIGNvbnN0IGNvbm5lY3Rpb25Mb29rdXAgPSB0aGlzLnVybE1hcFt1cmxdO1xuXG4gICAgaWYgKGNvbm5lY3Rpb25Mb29rdXAgJiZcbiAgICAgICAgY29ubmVjdGlvbkxvb2t1cC5zZXJ2ZXIgJiZcbiAgICAgICAgY29ubmVjdGlvbkxvb2t1cC53ZWJzb2NrZXRzLmluZGV4T2Yod2Vic29ja2V0KSA9PT0gLTEpIHtcbiAgICAgIGNvbm5lY3Rpb25Mb29rdXAud2Vic29ja2V0cy5wdXNoKHdlYnNvY2tldCk7XG4gICAgICByZXR1cm4gY29ubmVjdGlvbkxvb2t1cC5zZXJ2ZXI7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgKiBBdHRhY2hlcyBhIHdlYnNvY2tldCB0byBhIHJvb21cbiAgKi9cbiAgYWRkTWVtYmVyc2hpcFRvUm9vbSh3ZWJzb2NrZXQsIHJvb20pIHtcbiAgICBjb25zdCBjb25uZWN0aW9uTG9va3VwID0gdGhpcy51cmxNYXBbd2Vic29ja2V0LnVybF07XG5cbiAgICBpZiAoY29ubmVjdGlvbkxvb2t1cCAmJlxuICAgICAgICBjb25uZWN0aW9uTG9va3VwLnNlcnZlciAmJlxuICAgICAgICBjb25uZWN0aW9uTG9va3VwLndlYnNvY2tldHMuaW5kZXhPZih3ZWJzb2NrZXQpICE9PSAtMSkge1xuICAgICAgaWYgKCFjb25uZWN0aW9uTG9va3VwLnJvb21NZW1iZXJzaGlwc1tyb29tXSkge1xuICAgICAgICBjb25uZWN0aW9uTG9va3VwLnJvb21NZW1iZXJzaGlwc1tyb29tXSA9IFtdO1xuICAgICAgfVxuXG4gICAgICBjb25uZWN0aW9uTG9va3VwLnJvb21NZW1iZXJzaGlwc1tyb29tXS5wdXNoKHdlYnNvY2tldCk7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgKiBBdHRhY2hlcyBhIHNlcnZlciBvYmplY3QgdG8gdGhlIHVybE1hcCBoYXNoIHNvIHRoYXQgaXQgY2FuIGZpbmQgYSB3ZWJzb2NrZXRzXG4gICogd2hpY2ggYXJlIGNvbm5lY3RlZCB0byBpdCBhbmQgc28gdGhhdCB3ZWJzb2NrZXRzIGNhbiBpbiB0dXJuIGNhbiBmaW5kIGl0LlxuICAqXG4gICogQHBhcmFtIHtvYmplY3R9IHNlcnZlciAtIHNlcnZlciBvYmplY3QgdG8gYWRkIHRvIHRoZSB1cmxNYXAgaGFzaFxuICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgKi9cbiAgYXR0YWNoU2VydmVyKHNlcnZlciwgdXJsKSB7XG4gICAgY29uc3QgY29ubmVjdGlvbkxvb2t1cCA9IHRoaXMudXJsTWFwW3VybF07XG5cbiAgICBpZiAoIWNvbm5lY3Rpb25Mb29rdXApIHtcbiAgICAgIHRoaXMudXJsTWFwW3VybF0gPSB7XG4gICAgICAgIHNlcnZlcixcbiAgICAgICAgd2Vic29ja2V0czogW10sXG4gICAgICAgIHJvb21NZW1iZXJzaGlwczoge31cbiAgICAgIH07XG5cbiAgICAgIHJldHVybiBzZXJ2ZXI7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgKiBGaW5kcyB0aGUgc2VydmVyIHdoaWNoIGlzICdydW5uaW5nJyBvbiB0aGUgZ2l2ZW4gdXJsLlxuICAqXG4gICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIHRoZSB1cmwgdG8gdXNlIHRvIGZpbmQgd2hpY2ggc2VydmVyIGlzIHJ1bm5pbmcgb24gaXRcbiAgKi9cbiAgc2VydmVyTG9va3VwKHVybCkge1xuICAgIGNvbnN0IGNvbm5lY3Rpb25Mb29rdXAgPSB0aGlzLnVybE1hcFt1cmxdO1xuXG4gICAgaWYgKGNvbm5lY3Rpb25Mb29rdXApIHtcbiAgICAgIHJldHVybiBjb25uZWN0aW9uTG9va3VwLnNlcnZlcjtcbiAgICB9XG4gIH1cblxuICAvKlxuICAqIEZpbmRzIGFsbCB3ZWJzb2NrZXRzIHdoaWNoIGlzICdsaXN0ZW5pbmcnIG9uIHRoZSBnaXZlbiB1cmwuXG4gICpcbiAgKiBAcGFyYW0ge3N0cmluZ30gdXJsIC0gdGhlIHVybCB0byB1c2UgdG8gZmluZCBhbGwgd2Vic29ja2V0cyB3aGljaCBhcmUgYXNzb2NpYXRlZCB3aXRoIGl0XG4gICogQHBhcmFtIHtzdHJpbmd9IHJvb20gLSBpZiBhIHJvb20gaXMgcHJvdmlkZWQsIHdpbGwgb25seSByZXR1cm4gc29ja2V0cyBpbiB0aGlzIHJvb21cbiAgKiBAcGFyYW0ge2NsYXNzfSBicm9hZGNhc3RlciAtIHNvY2tldCB0aGF0IGlzIGJyb2FkY2FzdGluZyBhbmQgaXMgdG8gYmUgZXhjbHVkZWQgZnJvbSB0aGUgbG9va3VwXG4gICovXG4gIHdlYnNvY2tldHNMb29rdXAodXJsLCByb29tLCBicm9hZGNhc3Rlcikge1xuICAgIGxldCB3ZWJzb2NrZXRzO1xuICAgIGNvbnN0IGNvbm5lY3Rpb25Mb29rdXAgPSB0aGlzLnVybE1hcFt1cmxdO1xuXG4gICAgd2Vic29ja2V0cyA9IGNvbm5lY3Rpb25Mb29rdXAgPyBjb25uZWN0aW9uTG9va3VwLndlYnNvY2tldHMgOiBbXTtcblxuICAgIGlmIChyb29tKSB7XG4gICAgICBjb25zdCBtZW1iZXJzID0gY29ubmVjdGlvbkxvb2t1cC5yb29tTWVtYmVyc2hpcHNbcm9vbV07XG4gICAgICB3ZWJzb2NrZXRzID0gbWVtYmVycyB8fCBbXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYnJvYWRjYXN0ZXIgPyB3ZWJzb2NrZXRzLmZpbHRlcih3ZWJzb2NrZXQgPT4gd2Vic29ja2V0ICE9PSBicm9hZGNhc3RlcikgOiB3ZWJzb2NrZXRzO1xuICB9XG5cbiAgLypcbiAgKiBSZW1vdmVzIHRoZSBlbnRyeSBhc3NvY2lhdGVkIHdpdGggdGhlIHVybC5cbiAgKlxuICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgKi9cbiAgcmVtb3ZlU2VydmVyKHVybCkge1xuICAgIGRlbGV0ZSB0aGlzLnVybE1hcFt1cmxdO1xuICB9XG5cbiAgLypcbiAgKiBSZW1vdmVzIHRoZSBpbmRpdmlkdWFsIHdlYnNvY2tldCBmcm9tIHRoZSBtYXAgb2YgYXNzb2NpYXRlZCB3ZWJzb2NrZXRzLlxuICAqXG4gICogQHBhcmFtIHtvYmplY3R9IHdlYnNvY2tldCAtIHdlYnNvY2tldCBvYmplY3QgdG8gcmVtb3ZlIGZyb20gdGhlIHVybCBtYXBcbiAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICovXG4gIHJlbW92ZVdlYlNvY2tldCh3ZWJzb2NrZXQsIHVybCkge1xuICAgIGNvbnN0IGNvbm5lY3Rpb25Mb29rdXAgPSB0aGlzLnVybE1hcFt1cmxdO1xuXG4gICAgaWYgKGNvbm5lY3Rpb25Mb29rdXApIHtcbiAgICAgIGNvbm5lY3Rpb25Mb29rdXAud2Vic29ja2V0cyA9IHJlamVjdChjb25uZWN0aW9uTG9va3VwLndlYnNvY2tldHMsIHNvY2tldCA9PiBzb2NrZXQgPT09IHdlYnNvY2tldCk7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgKiBSZW1vdmVzIGEgd2Vic29ja2V0IGZyb20gYSByb29tXG4gICovXG4gIHJlbW92ZU1lbWJlcnNoaXBGcm9tUm9vbSh3ZWJzb2NrZXQsIHJvb20pIHtcbiAgICBjb25zdCBjb25uZWN0aW9uTG9va3VwID0gdGhpcy51cmxNYXBbd2Vic29ja2V0LnVybF07XG4gICAgY29uc3QgbWVtYmVyc2hpcHMgPSBjb25uZWN0aW9uTG9va3VwLnJvb21NZW1iZXJzaGlwc1tyb29tXTtcblxuICAgIGlmIChjb25uZWN0aW9uTG9va3VwICYmIG1lbWJlcnNoaXBzICE9PSBudWxsKSB7XG4gICAgICBjb25uZWN0aW9uTG9va3VwLnJvb21NZW1iZXJzaGlwc1tyb29tXSA9IHJlamVjdChtZW1iZXJzaGlwcywgc29ja2V0ID0+IHNvY2tldCA9PT0gd2Vic29ja2V0KTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IE5ldHdvcmtCcmlkZ2UoKTsgLy8gTm90ZTogdGhpcyBpcyBhIHNpbmdsZXRvblxuIiwiLypcbiogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0Nsb3NlRXZlbnRcbiovXG5jb25zdCBjb2RlcyA9IHtcbiAgQ0xPU0VfTk9STUFMOiAxMDAwLFxuICBDTE9TRV9HT0lOR19BV0FZOiAxMDAxLFxuICBDTE9TRV9QUk9UT0NPTF9FUlJPUjogMTAwMixcbiAgQ0xPU0VfVU5TVVBQT1JURUQ6IDEwMDMsXG4gIENMT1NFX05PX1NUQVRVUzogMTAwNSxcbiAgQ0xPU0VfQUJOT1JNQUw6IDEwMDYsXG4gIENMT1NFX1RPT19MQVJHRTogMTAwOVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY29kZXM7XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBub3JtYWxpemVVcmwodXJsKSB7XG4gIGNvbnN0IHBhcnRzID0gdXJsLnNwbGl0KCc6Ly8nKTtcbiAgcmV0dXJuIChwYXJ0c1sxXSAmJiBwYXJ0c1sxXS5pbmRleE9mKCcvJykgPT09IC0xKSA/IGAke3VybH0vYCA6IHVybDtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGxvZyhtZXRob2QsIG1lc3NhZ2UpIHtcbiAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuICBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAndGVzdCcpIHtcbiAgICBjb25zb2xlW21ldGhvZF0uY2FsbChudWxsLCBtZXNzYWdlKTtcbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cbn1cbiIsIlxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXZlbnRQcm90b3R5cGUge1xuICAvLyBOb29wc1xuICBzdG9wUHJvcGFnYXRpb24oKSB7fVxuICBzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKSB7fVxuXG4gIC8vIGlmIG5vIGFyZ3VtZW50cyBhcmUgcGFzc2VkIHRoZW4gdGhlIHR5cGUgaXMgc2V0IHRvIFwidW5kZWZpbmVkXCIgb25cbiAgLy8gY2hyb21lIGFuZCBzYWZhcmkuXG4gIGluaXRFdmVudCh0eXBlID0gJ3VuZGVmaW5lZCcsIGJ1YmJsZXMgPSBmYWxzZSwgY2FuY2VsYWJsZSA9IGZhbHNlKSB7XG4gICAgdGhpcy50eXBlID0gU3RyaW5nKHR5cGUpO1xuICAgIHRoaXMuYnViYmxlcyA9IEJvb2xlYW4oYnViYmxlcyk7XG4gICAgdGhpcy5jYW5jZWxhYmxlID0gQm9vbGVhbihjYW5jZWxhYmxlKTtcbiAgfVxufVxuIiwiaW1wb3J0IEV2ZW50UHJvdG90eXBlIGZyb20gJy4vZXZlbnQtcHJvdG90eXBlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXZlbnQgZXh0ZW5kcyBFdmVudFByb3RvdHlwZSB7XG4gIGNvbnN0cnVjdG9yKHR5cGUsIGV2ZW50SW5pdENvbmZpZyA9IHt9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIGlmICghdHlwZSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRmFpbGVkIHRvIGNvbnN0cnVjdCBcXCdFdmVudFxcJzogMSBhcmd1bWVudCByZXF1aXJlZCwgYnV0IG9ubHkgMCBwcmVzZW50LicpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZXZlbnRJbml0Q29uZmlnICE9PSAnb2JqZWN0Jykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRmFpbGVkIHRvIGNvbnN0cnVjdCBcXCdFdmVudFxcJzogcGFyYW1ldGVyIDIgKFxcJ2V2ZW50SW5pdERpY3RcXCcpIGlzIG5vdCBhbiBvYmplY3QnKTtcbiAgICB9XG5cbiAgICBjb25zdCB7IGJ1YmJsZXMsIGNhbmNlbGFibGUgfSA9IGV2ZW50SW5pdENvbmZpZztcblxuICAgIHRoaXMudHlwZSA9IFN0cmluZyh0eXBlKTtcbiAgICB0aGlzLnRpbWVTdGFtcCA9IERhdGUubm93KCk7XG4gICAgdGhpcy50YXJnZXQgPSBudWxsO1xuICAgIHRoaXMuc3JjRWxlbWVudCA9IG51bGw7XG4gICAgdGhpcy5yZXR1cm5WYWx1ZSA9IHRydWU7XG4gICAgdGhpcy5pc1RydXN0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLmV2ZW50UGhhc2UgPSAwO1xuICAgIHRoaXMuZGVmYXVsdFByZXZlbnRlZCA9IGZhbHNlO1xuICAgIHRoaXMuY3VycmVudFRhcmdldCA9IG51bGw7XG4gICAgdGhpcy5jYW5jZWxhYmxlID0gY2FuY2VsYWJsZSA/IEJvb2xlYW4oY2FuY2VsYWJsZSkgOiBmYWxzZTtcbiAgICB0aGlzLmNhbm5jZWxCdWJibGUgPSBmYWxzZTtcbiAgICB0aGlzLmJ1YmJsZXMgPSBidWJibGVzID8gQm9vbGVhbihidWJibGVzKSA6IGZhbHNlO1xuICB9XG59XG4iLCJpbXBvcnQgRXZlbnRQcm90b3R5cGUgZnJvbSAnLi9ldmVudC1wcm90b3R5cGUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNZXNzYWdlRXZlbnQgZXh0ZW5kcyBFdmVudFByb3RvdHlwZSB7XG4gIGNvbnN0cnVjdG9yKHR5cGUsIGV2ZW50SW5pdENvbmZpZyA9IHt9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIGlmICghdHlwZSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRmFpbGVkIHRvIGNvbnN0cnVjdCBcXCdNZXNzYWdlRXZlbnRcXCc6IDEgYXJndW1lbnQgcmVxdWlyZWQsIGJ1dCBvbmx5IDAgcHJlc2VudC4nKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGV2ZW50SW5pdENvbmZpZyAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZhaWxlZCB0byBjb25zdHJ1Y3QgXFwnTWVzc2FnZUV2ZW50XFwnOiBwYXJhbWV0ZXIgMiAoXFwnZXZlbnRJbml0RGljdFxcJykgaXMgbm90IGFuIG9iamVjdCcpO1xuICAgIH1cblxuICAgIGNvbnN0IHtcbiAgICAgIGJ1YmJsZXMsXG4gICAgICBjYW5jZWxhYmxlLFxuICAgICAgZGF0YSxcbiAgICAgIG9yaWdpbixcbiAgICAgIGxhc3RFdmVudElkLFxuICAgICAgcG9ydHNcbiAgICB9ID0gZXZlbnRJbml0Q29uZmlnO1xuXG4gICAgdGhpcy50eXBlID0gU3RyaW5nKHR5cGUpO1xuICAgIHRoaXMudGltZVN0YW1wID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLnRhcmdldCA9IG51bGw7XG4gICAgdGhpcy5zcmNFbGVtZW50ID0gbnVsbDtcbiAgICB0aGlzLnJldHVyblZhbHVlID0gdHJ1ZTtcbiAgICB0aGlzLmlzVHJ1c3RlZCA9IGZhbHNlO1xuICAgIHRoaXMuZXZlbnRQaGFzZSA9IDA7XG4gICAgdGhpcy5kZWZhdWx0UHJldmVudGVkID0gZmFsc2U7XG4gICAgdGhpcy5jdXJyZW50VGFyZ2V0ID0gbnVsbDtcbiAgICB0aGlzLmNhbmNlbGFibGUgPSBjYW5jZWxhYmxlID8gQm9vbGVhbihjYW5jZWxhYmxlKSA6IGZhbHNlO1xuICAgIHRoaXMuY2FubmNlbEJ1YmJsZSA9IGZhbHNlO1xuICAgIHRoaXMuYnViYmxlcyA9IGJ1YmJsZXMgPyBCb29sZWFuKGJ1YmJsZXMpIDogZmFsc2U7XG4gICAgdGhpcy5vcmlnaW4gPSBvcmlnaW4gPyBTdHJpbmcob3JpZ2luKSA6ICcnO1xuICAgIHRoaXMucG9ydHMgPSB0eXBlb2YgcG9ydHMgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IHBvcnRzO1xuICAgIHRoaXMuZGF0YSA9IHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiBkYXRhO1xuICAgIHRoaXMubGFzdEV2ZW50SWQgPSBsYXN0RXZlbnRJZCA/IFN0cmluZyhsYXN0RXZlbnRJZCkgOiAnJztcbiAgfVxufVxuIiwiaW1wb3J0IEV2ZW50UHJvdG90eXBlIGZyb20gJy4vZXZlbnQtcHJvdG90eXBlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2xvc2VFdmVudCBleHRlbmRzIEV2ZW50UHJvdG90eXBlIHtcbiAgY29uc3RydWN0b3IodHlwZSwgZXZlbnRJbml0Q29uZmlnID0ge30pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgaWYgKCF0eXBlKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGYWlsZWQgdG8gY29uc3RydWN0IFxcJ0Nsb3NlRXZlbnRcXCc6IDEgYXJndW1lbnQgcmVxdWlyZWQsIGJ1dCBvbmx5IDAgcHJlc2VudC4nKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGV2ZW50SW5pdENvbmZpZyAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZhaWxlZCB0byBjb25zdHJ1Y3QgXFwnQ2xvc2VFdmVudFxcJzogcGFyYW1ldGVyIDIgKFxcJ2V2ZW50SW5pdERpY3RcXCcpIGlzIG5vdCBhbiBvYmplY3QnKTtcbiAgICB9XG5cbiAgICBjb25zdCB7XG4gICAgICBidWJibGVzLFxuICAgICAgY2FuY2VsYWJsZSxcbiAgICAgIGNvZGUsXG4gICAgICByZWFzb24sXG4gICAgICB3YXNDbGVhblxuICAgIH0gPSBldmVudEluaXRDb25maWc7XG5cbiAgICB0aGlzLnR5cGUgPSBTdHJpbmcodHlwZSk7XG4gICAgdGhpcy50aW1lU3RhbXAgPSBEYXRlLm5vdygpO1xuICAgIHRoaXMudGFyZ2V0ID0gbnVsbDtcbiAgICB0aGlzLnNyY0VsZW1lbnQgPSBudWxsO1xuICAgIHRoaXMucmV0dXJuVmFsdWUgPSB0cnVlO1xuICAgIHRoaXMuaXNUcnVzdGVkID0gZmFsc2U7XG4gICAgdGhpcy5ldmVudFBoYXNlID0gMDtcbiAgICB0aGlzLmRlZmF1bHRQcmV2ZW50ZWQgPSBmYWxzZTtcbiAgICB0aGlzLmN1cnJlbnRUYXJnZXQgPSBudWxsO1xuICAgIHRoaXMuY2FuY2VsYWJsZSA9IGNhbmNlbGFibGUgPyBCb29sZWFuKGNhbmNlbGFibGUpIDogZmFsc2U7XG4gICAgdGhpcy5jYW5uY2VsQnViYmxlID0gZmFsc2U7XG4gICAgdGhpcy5idWJibGVzID0gYnViYmxlcyA/IEJvb2xlYW4oYnViYmxlcykgOiBmYWxzZTtcbiAgICB0aGlzLmNvZGUgPSB0eXBlb2YgY29kZSA9PT0gJ251bWJlcicgPyBOdW1iZXIoY29kZSkgOiAwO1xuICAgIHRoaXMucmVhc29uID0gcmVhc29uID8gU3RyaW5nKHJlYXNvbikgOiAnJztcbiAgICB0aGlzLndhc0NsZWFuID0gd2FzQ2xlYW4gPyBCb29sZWFuKHdhc0NsZWFuKSA6IGZhbHNlO1xuICB9XG59XG4iLCJpbXBvcnQgRXZlbnQgZnJvbSAnLi9oZWxwZXJzL2V2ZW50JztcbmltcG9ydCBNZXNzYWdlRXZlbnQgZnJvbSAnLi9oZWxwZXJzL21lc3NhZ2UtZXZlbnQnO1xuaW1wb3J0IENsb3NlRXZlbnQgZnJvbSAnLi9oZWxwZXJzL2Nsb3NlLWV2ZW50JztcblxuLypcbiogQ3JlYXRlcyBhbiBFdmVudCBvYmplY3QgYW5kIGV4dGVuZHMgaXQgdG8gYWxsb3cgZnVsbCBtb2RpZmljYXRpb24gb2ZcbiogaXRzIHByb3BlcnRpZXMuXG4qXG4qIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgLSB3aXRoaW4gY29uZmlnIHlvdSB3aWxsIG5lZWQgdG8gcGFzcyB0eXBlIGFuZCBvcHRpb25hbGx5IHRhcmdldFxuKi9cbmZ1bmN0aW9uIGNyZWF0ZUV2ZW50KGNvbmZpZykge1xuICBjb25zdCB7IHR5cGUsIHRhcmdldCB9ID0gY29uZmlnO1xuICBjb25zdCBldmVudE9iamVjdCA9IG5ldyBFdmVudCh0eXBlKTtcblxuICBpZiAodGFyZ2V0KSB7XG4gICAgZXZlbnRPYmplY3QudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIGV2ZW50T2JqZWN0LnNyY0VsZW1lbnQgPSB0YXJnZXQ7XG4gICAgZXZlbnRPYmplY3QuY3VycmVudFRhcmdldCA9IHRhcmdldDtcbiAgfVxuXG4gIHJldHVybiBldmVudE9iamVjdDtcbn1cblxuLypcbiogQ3JlYXRlcyBhIE1lc3NhZ2VFdmVudCBvYmplY3QgYW5kIGV4dGVuZHMgaXQgdG8gYWxsb3cgZnVsbCBtb2RpZmljYXRpb24gb2ZcbiogaXRzIHByb3BlcnRpZXMuXG4qXG4qIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgLSB3aXRoaW4gY29uZmlnOiB0eXBlLCBvcmlnaW4sIGRhdGEgYW5kIG9wdGlvbmFsbHkgdGFyZ2V0XG4qL1xuZnVuY3Rpb24gY3JlYXRlTWVzc2FnZUV2ZW50KGNvbmZpZykge1xuICBjb25zdCB7IHR5cGUsIG9yaWdpbiwgZGF0YSwgdGFyZ2V0IH0gPSBjb25maWc7XG4gIGNvbnN0IG1lc3NhZ2VFdmVudCA9IG5ldyBNZXNzYWdlRXZlbnQodHlwZSwge1xuICAgIGRhdGEsXG4gICAgb3JpZ2luXG4gIH0pO1xuXG4gIGlmICh0YXJnZXQpIHtcbiAgICBtZXNzYWdlRXZlbnQudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIG1lc3NhZ2VFdmVudC5zcmNFbGVtZW50ID0gdGFyZ2V0O1xuICAgIG1lc3NhZ2VFdmVudC5jdXJyZW50VGFyZ2V0ID0gdGFyZ2V0O1xuICB9XG5cbiAgcmV0dXJuIG1lc3NhZ2VFdmVudDtcbn1cblxuLypcbiogQ3JlYXRlcyBhIENsb3NlRXZlbnQgb2JqZWN0IGFuZCBleHRlbmRzIGl0IHRvIGFsbG93IGZ1bGwgbW9kaWZpY2F0aW9uIG9mXG4qIGl0cyBwcm9wZXJ0aWVzLlxuKlxuKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIC0gd2l0aGluIGNvbmZpZzogdHlwZSBhbmQgb3B0aW9uYWxseSB0YXJnZXQsIGNvZGUsIGFuZCByZWFzb25cbiovXG5mdW5jdGlvbiBjcmVhdGVDbG9zZUV2ZW50KGNvbmZpZykge1xuICBjb25zdCB7IGNvZGUsIHJlYXNvbiwgdHlwZSwgdGFyZ2V0IH0gPSBjb25maWc7XG4gIGxldCB7IHdhc0NsZWFuIH0gPSBjb25maWc7XG5cbiAgaWYgKCF3YXNDbGVhbikge1xuICAgIHdhc0NsZWFuID0gKGNvZGUgPT09IDEwMDApO1xuICB9XG5cbiAgY29uc3QgY2xvc2VFdmVudCA9IG5ldyBDbG9zZUV2ZW50KHR5cGUsIHtcbiAgICBjb2RlLFxuICAgIHJlYXNvbixcbiAgICB3YXNDbGVhblxuICB9KTtcblxuICBpZiAodGFyZ2V0KSB7XG4gICAgY2xvc2VFdmVudC50YXJnZXQgPSB0YXJnZXQ7XG4gICAgY2xvc2VFdmVudC5zcmNFbGVtZW50ID0gdGFyZ2V0O1xuICAgIGNsb3NlRXZlbnQuY3VycmVudFRhcmdldCA9IHRhcmdldDtcbiAgfVxuXG4gIHJldHVybiBjbG9zZUV2ZW50O1xufVxuXG5leHBvcnQge1xuICBjcmVhdGVFdmVudCxcbiAgY3JlYXRlTWVzc2FnZUV2ZW50LFxuICBjcmVhdGVDbG9zZUV2ZW50XG59O1xuIiwiaW1wb3J0IGRlbGF5IGZyb20gJy4vaGVscGVycy9kZWxheSc7XG5pbXBvcnQgRXZlbnRUYXJnZXQgZnJvbSAnLi9ldmVudC10YXJnZXQnO1xuaW1wb3J0IG5ldHdvcmtCcmlkZ2UgZnJvbSAnLi9uZXR3b3JrLWJyaWRnZSc7XG5pbXBvcnQgQ0xPU0VfQ09ERVMgZnJvbSAnLi9oZWxwZXJzL2Nsb3NlLWNvZGVzJztcbmltcG9ydCBub3JtYWxpemUgZnJvbSAnLi9oZWxwZXJzL25vcm1hbGl6ZS11cmwnO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuL2hlbHBlcnMvbG9nZ2VyJztcbmltcG9ydCB7IGNyZWF0ZUV2ZW50LCBjcmVhdGVNZXNzYWdlRXZlbnQsIGNyZWF0ZUNsb3NlRXZlbnQgfSBmcm9tICcuL2V2ZW50LWZhY3RvcnknO1xuXG4vKlxuKiBUaGUgbWFpbiB3ZWJzb2NrZXQgY2xhc3Mgd2hpY2ggaXMgZGVzaWduZWQgdG8gbWltaWNrIHRoZSBuYXRpdmUgV2ViU29ja2V0IGNsYXNzIGFzIGNsb3NlXG4qIGFzIHBvc3NpYmxlLlxuKlxuKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2ViU29ja2V0XG4qL1xuY2xhc3MgV2ViU29ja2V0IGV4dGVuZHMgRXZlbnRUYXJnZXQge1xuICAvKlxuICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgKi9cbiAgY29uc3RydWN0b3IodXJsLCBwcm90b2NvbCA9ICcnKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIGlmICghdXJsKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGYWlsZWQgdG8gY29uc3RydWN0IFxcJ1dlYlNvY2tldFxcJzogMSBhcmd1bWVudCByZXF1aXJlZCwgYnV0IG9ubHkgMCBwcmVzZW50LicpO1xuICAgIH1cblxuICAgIHRoaXMuYmluYXJ5VHlwZSA9ICdibG9iJztcbiAgICB0aGlzLnVybCA9IG5vcm1hbGl6ZSh1cmwpO1xuICAgIHRoaXMucmVhZHlTdGF0ZSA9IFdlYlNvY2tldC5DT05ORUNUSU5HO1xuICAgIHRoaXMucHJvdG9jb2wgPSAnJztcblxuICAgIGlmICh0eXBlb2YgcHJvdG9jb2wgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLnByb3RvY29sID0gcHJvdG9jb2w7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHByb3RvY29sKSAmJiBwcm90b2NvbC5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnByb3RvY29sID0gcHJvdG9jb2xbMF07XG4gICAgfVxuXG4gICAgLypcbiAgICAqIEluIG9yZGVyIHRvIGNhcHR1cmUgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHdlIG5lZWQgdG8gZGVmaW5lIGN1c3RvbSBzZXR0ZXJzLlxuICAgICogVG8gaWxsdXN0cmF0ZTpcbiAgICAqICAgbXlTb2NrZXQub25vcGVuID0gZnVuY3Rpb24oKSB7IGFsZXJ0KHRydWUpIH07XG4gICAgKlxuICAgICogVGhlIG9ubHkgd2F5IHRvIGNhcHR1cmUgdGhhdCBmdW5jdGlvbiBhbmQgaG9sZCBvbnRvIGl0IGZvciBsYXRlciBpcyB3aXRoIHRoZVxuICAgICogYmVsb3cgY29kZTpcbiAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgIG9ub3Blbjoge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHsgcmV0dXJuIHRoaXMubGlzdGVuZXJzLm9wZW47IH0sXG4gICAgICAgIHNldChsaXN0ZW5lcikge1xuICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignb3BlbicsIGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9ubWVzc2FnZToge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHsgcmV0dXJuIHRoaXMubGlzdGVuZXJzLm1lc3NhZ2U7IH0sXG4gICAgICAgIHNldChsaXN0ZW5lcikge1xuICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9uY2xvc2U6IHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQoKSB7IHJldHVybiB0aGlzLmxpc3RlbmVycy5jbG9zZTsgfSxcbiAgICAgICAgc2V0KGxpc3RlbmVyKSB7XG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsIGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9uZXJyb3I6IHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQoKSB7IHJldHVybiB0aGlzLmxpc3RlbmVycy5lcnJvcjsgfSxcbiAgICAgICAgc2V0KGxpc3RlbmVyKSB7XG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3Qgc2VydmVyID0gbmV0d29ya0JyaWRnZS5hdHRhY2hXZWJTb2NrZXQodGhpcywgdGhpcy51cmwpO1xuXG4gICAgLypcbiAgICAqIFRoaXMgZGVsYXkgaXMgbmVlZGVkIHNvIHRoYXQgd2UgZG9udCB0cmlnZ2VyIGFuIGV2ZW50IGJlZm9yZSB0aGUgY2FsbGJhY2tzIGhhdmUgYmVlblxuICAgICogc2V0dXAuIEZvciBleGFtcGxlOlxuICAgICpcbiAgICAqIHZhciBzb2NrZXQgPSBuZXcgV2ViU29ja2V0KCd3czovL2xvY2FsaG9zdCcpO1xuICAgICpcbiAgICAqIC8vIElmIHdlIGRvbnQgaGF2ZSB0aGUgZGVsYXkgdGhlbiB0aGUgZXZlbnQgd291bGQgYmUgdHJpZ2dlcmVkIHJpZ2h0IGhlcmUgYW5kIHRoaXMgaXNcbiAgICAqIC8vIGJlZm9yZSB0aGUgb25vcGVuIGhhZCBhIGNoYW5jZSB0byByZWdpc3RlciBpdHNlbGYuXG4gICAgKlxuICAgICogc29ja2V0Lm9ub3BlbiA9ICgpID0+IHsgLy8gdGhpcyB3b3VsZCBuZXZlciBiZSBjYWxsZWQgfTtcbiAgICAqXG4gICAgKiAvLyBhbmQgd2l0aCB0aGUgZGVsYXkgdGhlIGV2ZW50IGdldHMgdHJpZ2dlcmVkIGhlcmUgYWZ0ZXIgYWxsIG9mIHRoZSBjYWxsYmFja3MgaGF2ZSBiZWVuXG4gICAgKiAvLyByZWdpc3RlcmVkIDotKVxuICAgICovXG4gICAgZGVsYXkoZnVuY3Rpb24gZGVsYXlDYWxsYmFjaygpIHtcbiAgICAgIGlmIChzZXJ2ZXIpIHtcbiAgICAgICAgaWYgKHNlcnZlci5vcHRpb25zLnZlcmlmeUNsaWVudFxuICAgICAgICAgICYmIHR5cGVvZiBzZXJ2ZXIub3B0aW9ucy52ZXJpZnlDbGllbnQgPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAmJiAhc2VydmVyLm9wdGlvbnMudmVyaWZ5Q2xpZW50KCkpIHtcbiAgICAgICAgICB0aGlzLnJlYWR5U3RhdGUgPSBXZWJTb2NrZXQuQ0xPU0VEO1xuXG4gICAgICAgICAgbG9nZ2VyKFxuICAgICAgICAgICAgJ2Vycm9yJyxcbiAgICAgICAgICAgIGBXZWJTb2NrZXQgY29ubmVjdGlvbiB0byAnJHt0aGlzLnVybH0nIGZhaWxlZDogSFRUUCBBdXRoZW50aWNhdGlvbiBmYWlsZWQ7IG5vIHZhbGlkIGNyZWRlbnRpYWxzIGF2YWlsYWJsZWBcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgbmV0d29ya0JyaWRnZS5yZW1vdmVXZWJTb2NrZXQodGhpcywgdGhpcy51cmwpO1xuICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChjcmVhdGVFdmVudCh7IHR5cGU6ICdlcnJvcicsIHRhcmdldDogdGhpcyB9KSk7XG4gICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGNyZWF0ZUNsb3NlRXZlbnQoeyB0eXBlOiAnY2xvc2UnLCB0YXJnZXQ6IHRoaXMsIGNvZGU6IENMT1NFX0NPREVTLkNMT1NFX05PUk1BTCB9KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5yZWFkeVN0YXRlID0gV2ViU29ja2V0Lk9QRU47XG4gICAgICAgICAgc2VydmVyLmRpc3BhdGNoRXZlbnQoY3JlYXRlRXZlbnQoeyB0eXBlOiAnY29ubmVjdGlvbicgfSksIHNlcnZlciwgdGhpcyk7XG4gICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGNyZWF0ZUV2ZW50KHsgdHlwZTogJ29wZW4nLCB0YXJnZXQ6IHRoaXMgfSkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlYWR5U3RhdGUgPSBXZWJTb2NrZXQuQ0xPU0VEO1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoY3JlYXRlRXZlbnQoeyB0eXBlOiAnZXJyb3InLCB0YXJnZXQ6IHRoaXMgfSkpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoY3JlYXRlQ2xvc2VFdmVudCh7IHR5cGU6ICdjbG9zZScsIHRhcmdldDogdGhpcywgY29kZTogQ0xPU0VfQ09ERVMuQ0xPU0VfTk9STUFMIH0pKTtcblxuICAgICAgICBsb2dnZXIoJ2Vycm9yJywgYFdlYlNvY2tldCBjb25uZWN0aW9uIHRvICcke3RoaXMudXJsfScgZmFpbGVkYCk7XG4gICAgICB9XG4gICAgfSwgdGhpcyk7XG4gIH1cblxuICAvKlxuICAqIFRyYW5zbWl0cyBkYXRhIHRvIHRoZSBzZXJ2ZXIgb3ZlciB0aGUgV2ViU29ja2V0IGNvbm5lY3Rpb24uXG4gICpcbiAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2ViU29ja2V0I3NlbmQoKVxuICAqL1xuICBzZW5kKGRhdGEpIHtcbiAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuQ0xPU0lORyB8fCB0aGlzLnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5DTE9TRUQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignV2ViU29ja2V0IGlzIGFscmVhZHkgaW4gQ0xPU0lORyBvciBDTE9TRUQgc3RhdGUnKTtcbiAgICB9XG5cbiAgICBjb25zdCBtZXNzYWdlRXZlbnQgPSBjcmVhdGVNZXNzYWdlRXZlbnQoe1xuICAgICAgdHlwZTogJ21lc3NhZ2UnLFxuICAgICAgb3JpZ2luOiB0aGlzLnVybCxcbiAgICAgIGRhdGFcbiAgICB9KTtcblxuICAgIGNvbnN0IHNlcnZlciA9IG5ldHdvcmtCcmlkZ2Uuc2VydmVyTG9va3VwKHRoaXMudXJsKTtcblxuICAgIGlmIChzZXJ2ZXIpIHtcbiAgICAgIHNlcnZlci5kaXNwYXRjaEV2ZW50KG1lc3NhZ2VFdmVudCwgZGF0YSk7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgKiBDbG9zZXMgdGhlIFdlYlNvY2tldCBjb25uZWN0aW9uIG9yIGNvbm5lY3Rpb24gYXR0ZW1wdCwgaWYgYW55LlxuICAqIElmIHRoZSBjb25uZWN0aW9uIGlzIGFscmVhZHkgQ0xPU0VELCB0aGlzIG1ldGhvZCBkb2VzIG5vdGhpbmcuXG4gICpcbiAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2ViU29ja2V0I2Nsb3NlKClcbiAgKi9cbiAgY2xvc2UoKSB7XG4gICAgaWYgKHRoaXMucmVhZHlTdGF0ZSAhPT0gV2ViU29ja2V0Lk9QRU4pIHsgcmV0dXJuIHVuZGVmaW5lZDsgfVxuXG4gICAgY29uc3Qgc2VydmVyID0gbmV0d29ya0JyaWRnZS5zZXJ2ZXJMb29rdXAodGhpcy51cmwpO1xuICAgIGNvbnN0IGNsb3NlRXZlbnQgPSBjcmVhdGVDbG9zZUV2ZW50KHtcbiAgICAgIHR5cGU6ICdjbG9zZScsXG4gICAgICB0YXJnZXQ6IHRoaXMsXG4gICAgICBjb2RlOiBDTE9TRV9DT0RFUy5DTE9TRV9OT1JNQUxcbiAgICB9KTtcblxuICAgIG5ldHdvcmtCcmlkZ2UucmVtb3ZlV2ViU29ja2V0KHRoaXMsIHRoaXMudXJsKTtcblxuICAgIHRoaXMucmVhZHlTdGF0ZSA9IFdlYlNvY2tldC5DTE9TRUQ7XG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KGNsb3NlRXZlbnQpO1xuXG4gICAgaWYgKHNlcnZlcikge1xuICAgICAgc2VydmVyLmRpc3BhdGNoRXZlbnQoY2xvc2VFdmVudCwgc2VydmVyKTtcbiAgICB9XG4gIH1cbn1cblxuV2ViU29ja2V0LkNPTk5FQ1RJTkcgPSAwO1xuV2ViU29ja2V0Lk9QRU4gPSAxO1xuV2ViU29ja2V0LkNMT1NJTkcgPSAyO1xuV2ViU29ja2V0LkNMT1NFRCA9IDM7XG5cbmV4cG9ydCBkZWZhdWx0IFdlYlNvY2tldDtcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJldHJpZXZlR2xvYmFsT2JqZWN0KCkge1xuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gd2luZG93O1xuICB9XG5cbiAgcmV0dXJuICh0eXBlb2YgcHJvY2VzcyA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiByZXF1aXJlID09PSAnZnVuY3Rpb24nICYmXG4gICAgICB0eXBlb2YgZ2xvYmFsID09PSAnb2JqZWN0JykgPyBnbG9iYWwgOiB0aGlzO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgKGFycikgPT4ge1xuICByZXR1cm4gYXJyLnJlZHVjZShmdW5jdGlvbihkZWR1cGVkLCBiKXtcbiAgXHRpZiAoZGVkdXBlZC5pbmRleE9mKGIpID4gLTEpIHJldHVybiBkZWR1cGVkO1xuICAgIHJldHVybiBkZWR1cGVkLmNvbmNhdChiKTtcbiAgfSwgW10pO1xufVxuIiwiaW1wb3J0IFdlYlNvY2tldCBmcm9tICcuL3dlYnNvY2tldCc7XG5pbXBvcnQgRXZlbnRUYXJnZXQgZnJvbSAnLi9ldmVudC10YXJnZXQnO1xuaW1wb3J0IG5ldHdvcmtCcmlkZ2UgZnJvbSAnLi9uZXR3b3JrLWJyaWRnZSc7XG5pbXBvcnQgQ0xPU0VfQ09ERVMgZnJvbSAnLi9oZWxwZXJzL2Nsb3NlLWNvZGVzJztcbmltcG9ydCBub3JtYWxpemUgZnJvbSAnLi9oZWxwZXJzL25vcm1hbGl6ZS11cmwnO1xuaW1wb3J0IGdsb2JhbE9iamVjdCBmcm9tICcuL2hlbHBlcnMvZ2xvYmFsLW9iamVjdCc7XG5pbXBvcnQgZGVkdXBlIGZyb20gJy4vaGVscGVycy9kZWR1cGUnO1xuaW1wb3J0IHsgY3JlYXRlRXZlbnQsIGNyZWF0ZU1lc3NhZ2VFdmVudCwgY3JlYXRlQ2xvc2VFdmVudCB9IGZyb20gJy4vZXZlbnQtZmFjdG9yeSc7XG5cbi8qXG4qIGh0dHBzOi8vZ2l0aHViLmNvbS93ZWJzb2NrZXRzL3dzI3NlcnZlci1leGFtcGxlXG4qL1xuY2xhc3MgU2VydmVyIGV4dGVuZHMgRXZlbnRUYXJnZXQge1xuICAvKlxuICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgKi9cbiAgY29uc3RydWN0b3IodXJsLCBvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMudXJsID0gbm9ybWFsaXplKHVybCk7XG4gICAgdGhpcy5vcmlnaW5hbFdlYlNvY2tldCA9IG51bGw7XG4gICAgY29uc3Qgc2VydmVyID0gbmV0d29ya0JyaWRnZS5hdHRhY2hTZXJ2ZXIodGhpcywgdGhpcy51cmwpO1xuXG4gICAgaWYgKCFzZXJ2ZXIpIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChjcmVhdGVFdmVudCh7IHR5cGU6ICdlcnJvcicgfSkpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIG1vY2sgc2VydmVyIGlzIGFscmVhZHkgbGlzdGVuaW5nIG9uIHRoaXMgdXJsJyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLnZlcmlmaXlDbGllbnQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBvcHRpb25zLnZlcmlmaXlDbGllbnQgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICB0aGlzLnN0YXJ0KCk7XG4gIH1cblxuICAvKlxuICAqIEF0dGFjaGVzIHRoZSBtb2NrIHdlYnNvY2tldCBvYmplY3QgdG8gdGhlIGdsb2JhbCBvYmplY3RcbiAgKi9cbiAgc3RhcnQoKSB7XG4gICAgY29uc3QgZ2xvYmFsT2JqID0gZ2xvYmFsT2JqZWN0KCk7XG5cbiAgICBpZiAoZ2xvYmFsT2JqLldlYlNvY2tldCkge1xuICAgICAgdGhpcy5vcmlnaW5hbFdlYlNvY2tldCA9IGdsb2JhbE9iai5XZWJTb2NrZXQ7XG4gICAgfVxuXG4gICAgZ2xvYmFsT2JqLldlYlNvY2tldCA9IFdlYlNvY2tldDtcbiAgfVxuXG4gIC8qXG4gICogUmVtb3ZlcyB0aGUgbW9jayB3ZWJzb2NrZXQgb2JqZWN0IGZyb20gdGhlIGdsb2JhbCBvYmplY3RcbiAgKi9cbiAgc3RvcChjYWxsYmFjayA9ICgpID0+IHt9KSB7XG4gICAgY29uc3QgZ2xvYmFsT2JqID0gZ2xvYmFsT2JqZWN0KCk7XG5cbiAgICBpZiAodGhpcy5vcmlnaW5hbFdlYlNvY2tldCkge1xuICAgICAgZ2xvYmFsT2JqLldlYlNvY2tldCA9IHRoaXMub3JpZ2luYWxXZWJTb2NrZXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSBnbG9iYWxPYmouV2ViU29ja2V0O1xuICAgIH1cblxuICAgIHRoaXMub3JpZ2luYWxXZWJTb2NrZXQgPSBudWxsO1xuXG4gICAgbmV0d29ya0JyaWRnZS5yZW1vdmVTZXJ2ZXIodGhpcy51cmwpO1xuXG4gICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG4gIH1cblxuICAvKlxuICAqIFRoaXMgaXMgdGhlIG1haW4gZnVuY3Rpb24gZm9yIHRoZSBtb2NrIHNlcnZlciB0byBzdWJzY3JpYmUgdG8gdGhlIG9uIGV2ZW50cy5cbiAgKlxuICAqIGllOiBtb2NrU2VydmVyLm9uKCdjb25uZWN0aW9uJywgZnVuY3Rpb24oKSB7IGNvbnNvbGUubG9nKCdhIG1vY2sgY2xpZW50IGNvbm5lY3RlZCcpOyB9KTtcbiAgKlxuICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gVGhlIGV2ZW50IGtleSB0byBzdWJzY3JpYmUgdG8uIFZhbGlkIGtleXMgYXJlOiBjb25uZWN0aW9uLCBtZXNzYWdlLCBhbmQgY2xvc2UuXG4gICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSBUaGUgY2FsbGJhY2sgd2hpY2ggc2hvdWxkIGJlIGNhbGxlZCB3aGVuIGEgY2VydGFpbiBldmVudCBpcyBmaXJlZC5cbiAgKi9cbiAgb24odHlwZSwgY2FsbGJhY2spIHtcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spO1xuICB9XG5cbiAgLypcbiAgKiBUaGlzIHNlbmQgZnVuY3Rpb24gd2lsbCBub3RpZnkgYWxsIG1vY2sgY2xpZW50cyB2aWEgdGhlaXIgb25tZXNzYWdlIGNhbGxiYWNrcyB0aGF0IHRoZSBzZXJ2ZXJcbiAgKiBoYXMgYSBtZXNzYWdlIGZvciB0aGVtLlxuICAqXG4gICogQHBhcmFtIHsqfSBkYXRhIC0gQW55IGphdmFzY3JpcHQgb2JqZWN0IHdoaWNoIHdpbGwgYmUgY3JhZnRlZCBpbnRvIGEgTWVzc2FnZU9iamVjdC5cbiAgKi9cbiAgc2VuZChkYXRhLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLmVtaXQoJ21lc3NhZ2UnLCBkYXRhLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qXG4gICogU2VuZHMgYSBnZW5lcmljIG1lc3NhZ2UgZXZlbnQgdG8gYWxsIG1vY2sgY2xpZW50cy5cbiAgKi9cbiAgZW1pdChldmVudCwgZGF0YSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IHsgd2Vic29ja2V0cyB9ID0gb3B0aW9ucztcblxuICAgIGlmICghd2Vic29ja2V0cykge1xuICAgICAgd2Vic29ja2V0cyA9IG5ldHdvcmtCcmlkZ2Uud2Vic29ja2V0c0xvb2t1cCh0aGlzLnVybCk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0JyB8fCBhcmd1bWVudHMubGVuZ3RoID4gMykge1xuICAgICAgZGF0YSA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSwgYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgd2Vic29ja2V0cy5mb3JFYWNoKChzb2NrZXQpID0+IHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgIHNvY2tldC5kaXNwYXRjaEV2ZW50KGNyZWF0ZU1lc3NhZ2VFdmVudCh7XG4gICAgICAgICAgdHlwZTogZXZlbnQsXG4gICAgICAgICAgZGF0YSxcbiAgICAgICAgICBvcmlnaW46IHRoaXMudXJsLFxuICAgICAgICAgIHRhcmdldDogc29ja2V0XG4gICAgICAgIH0pLCAuLi5kYXRhKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNvY2tldC5kaXNwYXRjaEV2ZW50KGNyZWF0ZU1lc3NhZ2VFdmVudCh7XG4gICAgICAgICAgdHlwZTogZXZlbnQsXG4gICAgICAgICAgZGF0YSxcbiAgICAgICAgICBvcmlnaW46IHRoaXMudXJsLFxuICAgICAgICAgIHRhcmdldDogc29ja2V0XG4gICAgICAgIH0pKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qXG4gICogQ2xvc2VzIHRoZSBjb25uZWN0aW9uIGFuZCB0cmlnZ2VycyB0aGUgb25jbG9zZSBtZXRob2Qgb2YgYWxsIGxpc3RlbmluZ1xuICAqIHdlYnNvY2tldHMuIEFmdGVyIHRoYXQgaXQgcmVtb3ZlcyBpdHNlbGYgZnJvbSB0aGUgdXJsTWFwIHNvIGFub3RoZXIgc2VydmVyXG4gICogY291bGQgYWRkIGl0c2VsZiB0byB0aGUgdXJsLlxuICAqXG4gICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiAgKi9cbiAgY2xvc2Uob3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3Qge1xuICAgICAgY29kZSxcbiAgICAgIHJlYXNvbixcbiAgICAgIHdhc0NsZWFuXG4gICAgfSA9IG9wdGlvbnM7XG4gICAgY29uc3QgbGlzdGVuZXJzID0gbmV0d29ya0JyaWRnZS53ZWJzb2NrZXRzTG9va3VwKHRoaXMudXJsKTtcblxuICAgIGxpc3RlbmVycy5mb3JFYWNoKChzb2NrZXQpID0+IHtcbiAgICAgIHNvY2tldC5yZWFkeVN0YXRlID0gV2ViU29ja2V0LkNMT1NFO1xuICAgICAgc29ja2V0LmRpc3BhdGNoRXZlbnQoY3JlYXRlQ2xvc2VFdmVudCh7XG4gICAgICAgIHR5cGU6ICdjbG9zZScsXG4gICAgICAgIHRhcmdldDogc29ja2V0LFxuICAgICAgICBjb2RlOiBjb2RlIHx8IENMT1NFX0NPREVTLkNMT1NFX05PUk1BTCxcbiAgICAgICAgcmVhc29uOiByZWFzb24gfHwgJycsXG4gICAgICAgIHdhc0NsZWFuXG4gICAgICB9KSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoY3JlYXRlQ2xvc2VFdmVudCh7IHR5cGU6ICdjbG9zZScgfSksIHRoaXMpO1xuICAgIG5ldHdvcmtCcmlkZ2UucmVtb3ZlU2VydmVyKHRoaXMudXJsKTtcbiAgfVxuXG4gIC8qXG4gICogUmV0dXJucyBhbiBhcnJheSBvZiB3ZWJzb2NrZXRzIHdoaWNoIGFyZSBsaXN0ZW5pbmcgdG8gdGhpcyBzZXJ2ZXJcbiAgKi9cbiAgY2xpZW50cygpIHtcbiAgICByZXR1cm4gbmV0d29ya0JyaWRnZS53ZWJzb2NrZXRzTG9va3VwKHRoaXMudXJsKTtcbiAgfVxuXG4gIC8qXG4gICogUHJlcGFyZXMgYSBtZXRob2QgdG8gc3VibWl0IGFuIGV2ZW50IHRvIG1lbWJlcnMgb2YgdGhlIHJvb21cbiAgKlxuICAqIGUuZy4gc2VydmVyLnRvKCdteS1yb29tJykuZW1pdCgnaGkhJyk7XG4gICovXG4gIHRvKHJvb20sIGJyb2FkY2FzdGVyLCBicm9hZGNhc3RMaXN0ID0gW10pIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBjb25zdCB3ZWJzb2NrZXRzID0gZGVkdXBlKGJyb2FkY2FzdExpc3QuY29uY2F0KFxuICAgICAgbmV0d29ya0JyaWRnZS53ZWJzb2NrZXRzTG9va3VwKHRoaXMudXJsLCByb29tLCBicm9hZGNhc3RlcilcbiAgICApKTtcblxuICAgIHJldHVybiB7XG4gICAgICB0bzogKGNoYWluZWRSb29tLCBjaGFpbmVkQnJvYWRjYXN0ZXIpID0+XG4gICAgICAgIHRoaXMudG8uY2FsbCh0aGlzLCBjaGFpbmVkUm9vbSwgY2hhaW5lZEJyb2FkY2FzdGVyLCB3ZWJzb2NrZXRzKSxcbiAgICAgIGVtaXQoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgc2VsZi5lbWl0KGV2ZW50LCBkYXRhLCB7IHdlYnNvY2tldHMgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qXG4gICAqIEFsaWFzIGZvciBTZXJ2ZXIudG9cbiAgICovXG4gIGluKC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy50by5hcHBseShudWxsLCBhcmdzKTtcbiAgfVxufVxuXG4vKlxuICogQWx0ZXJuYXRpdmUgY29uc3RydWN0b3IgdG8gc3VwcG9ydCBuYW1lc3BhY2VzIGluIHNvY2tldC5pb1xuICpcbiAqIGh0dHA6Ly9zb2NrZXQuaW8vZG9jcy9yb29tcy1hbmQtbmFtZXNwYWNlcy8jY3VzdG9tLW5hbWVzcGFjZXNcbiAqL1xuU2VydmVyLm9mID0gZnVuY3Rpb24gb2YodXJsKSB7XG4gIHJldHVybiBuZXcgU2VydmVyKHVybCk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBTZXJ2ZXI7XG4iLCJpbXBvcnQgZGVsYXkgZnJvbSAnLi9oZWxwZXJzL2RlbGF5JztcbmltcG9ydCBFdmVudFRhcmdldCBmcm9tICcuL2V2ZW50LXRhcmdldCc7XG5pbXBvcnQgbmV0d29ya0JyaWRnZSBmcm9tICcuL25ldHdvcmstYnJpZGdlJztcbmltcG9ydCBDTE9TRV9DT0RFUyBmcm9tICcuL2hlbHBlcnMvY2xvc2UtY29kZXMnO1xuaW1wb3J0IG5vcm1hbGl6ZSBmcm9tICcuL2hlbHBlcnMvbm9ybWFsaXplLXVybCc7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vaGVscGVycy9sb2dnZXInO1xuaW1wb3J0IHsgY3JlYXRlRXZlbnQsIGNyZWF0ZU1lc3NhZ2VFdmVudCwgY3JlYXRlQ2xvc2VFdmVudCB9IGZyb20gJy4vZXZlbnQtZmFjdG9yeSc7XG5cbi8qXG4qIFRoZSBzb2NrZXQtaW8gY2xhc3MgaXMgZGVzaWduZWQgdG8gbWltaWNrIHRoZSByZWFsIEFQSSBhcyBjbG9zZWx5IGFzIHBvc3NpYmxlLlxuKlxuKiBodHRwOi8vc29ja2V0LmlvL2RvY3MvXG4qL1xuY2xhc3MgU29ja2V0SU8gZXh0ZW5kcyBFdmVudFRhcmdldCB7XG4gIC8qXG4gICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAqL1xuICBjb25zdHJ1Y3Rvcih1cmwgPSAnc29ja2V0LmlvJywgcHJvdG9jb2wgPSAnJykge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmJpbmFyeVR5cGUgPSAnYmxvYic7XG4gICAgdGhpcy51cmwgPSBub3JtYWxpemUodXJsKTtcbiAgICB0aGlzLnJlYWR5U3RhdGUgPSBTb2NrZXRJTy5DT05ORUNUSU5HO1xuICAgIHRoaXMucHJvdG9jb2wgPSAnJztcblxuICAgIGlmICh0eXBlb2YgcHJvdG9jb2wgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLnByb3RvY29sID0gcHJvdG9jb2w7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHByb3RvY29sKSAmJiBwcm90b2NvbC5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnByb3RvY29sID0gcHJvdG9jb2xbMF07XG4gICAgfVxuXG4gICAgY29uc3Qgc2VydmVyID0gbmV0d29ya0JyaWRnZS5hdHRhY2hXZWJTb2NrZXQodGhpcywgdGhpcy51cmwpO1xuXG4gICAgLypcbiAgICAqIERlbGF5IHRyaWdnZXJpbmcgdGhlIGNvbm5lY3Rpb24gZXZlbnRzIHNvIHRoZXkgY2FuIGJlIGRlZmluZWQgaW4gdGltZS5cbiAgICAqL1xuICAgIGRlbGF5KGZ1bmN0aW9uIGRlbGF5Q2FsbGJhY2soKSB7XG4gICAgICBpZiAoc2VydmVyKSB7XG4gICAgICAgIHRoaXMucmVhZHlTdGF0ZSA9IFNvY2tldElPLk9QRU47XG4gICAgICAgIHNlcnZlci5kaXNwYXRjaEV2ZW50KGNyZWF0ZUV2ZW50KHsgdHlwZTogJ2Nvbm5lY3Rpb24nIH0pLCBzZXJ2ZXIsIHRoaXMpO1xuICAgICAgICBzZXJ2ZXIuZGlzcGF0Y2hFdmVudChjcmVhdGVFdmVudCh7IHR5cGU6ICdjb25uZWN0JyB9KSwgc2VydmVyLCB0aGlzKTsgLy8gYWxpYXNcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGNyZWF0ZUV2ZW50KHsgdHlwZTogJ2Nvbm5lY3QnLCB0YXJnZXQ6IHRoaXMgfSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWFkeVN0YXRlID0gU29ja2V0SU8uQ0xPU0VEO1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoY3JlYXRlRXZlbnQoeyB0eXBlOiAnZXJyb3InLCB0YXJnZXQ6IHRoaXMgfSkpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoY3JlYXRlQ2xvc2VFdmVudCh7XG4gICAgICAgICAgdHlwZTogJ2Nsb3NlJyxcbiAgICAgICAgICB0YXJnZXQ6IHRoaXMsXG4gICAgICAgICAgY29kZTogQ0xPU0VfQ09ERVMuQ0xPU0VfTk9STUFMXG4gICAgICAgIH0pKTtcblxuICAgICAgICBsb2dnZXIoJ2Vycm9yJywgYFNvY2tldC5pbyBjb25uZWN0aW9uIHRvICcke3RoaXMudXJsfScgZmFpbGVkYCk7XG4gICAgICB9XG4gICAgfSwgdGhpcyk7XG5cbiAgICAvKipcbiAgICAgIEFkZCBhbiBhbGlhc2VkIGV2ZW50IGxpc3RlbmVyIGZvciBjbG9zZSAvIGRpc2Nvbm5lY3RcbiAgICAgKi9cbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgKGV2ZW50KSA9PiB7XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoY3JlYXRlQ2xvc2VFdmVudCh7XG4gICAgICAgIHR5cGU6ICdkaXNjb25uZWN0JyxcbiAgICAgICAgdGFyZ2V0OiBldmVudC50YXJnZXQsXG4gICAgICAgIGNvZGU6IGV2ZW50LmNvZGVcbiAgICAgIH0pKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qXG4gICogQ2xvc2VzIHRoZSBTb2NrZXRJTyBjb25uZWN0aW9uIG9yIGNvbm5lY3Rpb24gYXR0ZW1wdCwgaWYgYW55LlxuICAqIElmIHRoZSBjb25uZWN0aW9uIGlzIGFscmVhZHkgQ0xPU0VELCB0aGlzIG1ldGhvZCBkb2VzIG5vdGhpbmcuXG4gICovXG4gIGNsb3NlKCkge1xuICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgIT09IFNvY2tldElPLk9QRU4pIHsgcmV0dXJuIHVuZGVmaW5lZDsgfVxuXG4gICAgY29uc3Qgc2VydmVyID0gbmV0d29ya0JyaWRnZS5zZXJ2ZXJMb29rdXAodGhpcy51cmwpO1xuICAgIG5ldHdvcmtCcmlkZ2UucmVtb3ZlV2ViU29ja2V0KHRoaXMsIHRoaXMudXJsKTtcblxuICAgIHRoaXMucmVhZHlTdGF0ZSA9IFNvY2tldElPLkNMT1NFRDtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoY3JlYXRlQ2xvc2VFdmVudCh7XG4gICAgICB0eXBlOiAnY2xvc2UnLFxuICAgICAgdGFyZ2V0OiB0aGlzLFxuICAgICAgY29kZTogQ0xPU0VfQ09ERVMuQ0xPU0VfTk9STUFMXG4gICAgfSkpO1xuXG4gICAgaWYgKHNlcnZlcikge1xuICAgICAgc2VydmVyLmRpc3BhdGNoRXZlbnQoY3JlYXRlQ2xvc2VFdmVudCh7XG4gICAgICAgIHR5cGU6ICdkaXNjb25uZWN0JyxcbiAgICAgICAgdGFyZ2V0OiB0aGlzLFxuICAgICAgICBjb2RlOiBDTE9TRV9DT0RFUy5DTE9TRV9OT1JNQUxcbiAgICAgIH0pLCBzZXJ2ZXIpO1xuICAgIH1cbiAgfVxuXG4gIC8qXG4gICogQWxpYXMgZm9yIFNvY2tldCNjbG9zZVxuICAqXG4gICogaHR0cHM6Ly9naXRodWIuY29tL3NvY2tldGlvL3NvY2tldC5pby1jbGllbnQvYmxvYi9tYXN0ZXIvbGliL3NvY2tldC5qcyNMMzgzXG4gICovXG4gIGRpc2Nvbm5lY3QoKSB7XG4gICAgdGhpcy5jbG9zZSgpO1xuICB9XG5cbiAgLypcbiAgKiBTdWJtaXRzIGFuIGV2ZW50IHRvIHRoZSBzZXJ2ZXIgd2l0aCBhIHBheWxvYWRcbiAgKi9cbiAgZW1pdChldmVudCwgLi4uZGF0YSkge1xuICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgIT09IFNvY2tldElPLk9QRU4pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignU29ja2V0SU8gaXMgYWxyZWFkeSBpbiBDTE9TSU5HIG9yIENMT1NFRCBzdGF0ZScpO1xuICAgIH1cblxuICAgIGNvbnN0IG1lc3NhZ2VFdmVudCA9IGNyZWF0ZU1lc3NhZ2VFdmVudCh7XG4gICAgICB0eXBlOiBldmVudCxcbiAgICAgIG9yaWdpbjogdGhpcy51cmwsXG4gICAgICBkYXRhXG4gICAgfSk7XG5cbiAgICBjb25zdCBzZXJ2ZXIgPSBuZXR3b3JrQnJpZGdlLnNlcnZlckxvb2t1cCh0aGlzLnVybCk7XG5cbiAgICBpZiAoc2VydmVyKSB7XG4gICAgICBzZXJ2ZXIuZGlzcGF0Y2hFdmVudChtZXNzYWdlRXZlbnQsIC4uLmRhdGEpO1xuICAgIH1cbiAgfVxuXG4gIC8qXG4gICogU3VibWl0cyBhICdtZXNzYWdlJyBldmVudCB0byB0aGUgc2VydmVyLlxuICAqXG4gICogU2hvdWxkIGJlaGF2ZSBleGFjdGx5IGxpa2UgV2ViU29ja2V0I3NlbmRcbiAgKlxuICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9zb2NrZXRpby9zb2NrZXQuaW8tY2xpZW50L2Jsb2IvbWFzdGVyL2xpYi9zb2NrZXQuanMjTDExM1xuICAqL1xuICBzZW5kKGRhdGEpIHtcbiAgICB0aGlzLmVtaXQoJ21lc3NhZ2UnLCBkYXRhKTtcbiAgfVxuXG4gIC8qXG4gICogRm9yIGJyb2FkY2FzdGluZyBldmVudHMgdG8gb3RoZXIgY29ubmVjdGVkIHNvY2tldHMuXG4gICpcbiAgKiBlLmcuIHNvY2tldC5icm9hZGNhc3QuZW1pdCgnaGkhJyk7XG4gICogZS5nLiBzb2NrZXQuYnJvYWRjYXN0LnRvKCdteS1yb29tJykuZW1pdCgnaGkhJyk7XG4gICovXG4gIGdldCBicm9hZGNhc3QoKSB7XG4gICAgaWYgKHRoaXMucmVhZHlTdGF0ZSAhPT0gU29ja2V0SU8uT1BFTikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTb2NrZXRJTyBpcyBhbHJlYWR5IGluIENMT1NJTkcgb3IgQ0xPU0VEIHN0YXRlJyk7XG4gICAgfVxuXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgY29uc3Qgc2VydmVyID0gbmV0d29ya0JyaWRnZS5zZXJ2ZXJMb29rdXAodGhpcy51cmwpO1xuICAgIGlmICghc2VydmVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFNvY2tldElPIGNhbiBub3QgZmluZCBhIHNlcnZlciBhdCB0aGUgc3BlY2lmaWVkIFVSTCAoJHt0aGlzLnVybH0pYCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGVtaXQoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgc2VydmVyLmVtaXQoZXZlbnQsIGRhdGEsIHsgd2Vic29ja2V0czogbmV0d29ya0JyaWRnZS53ZWJzb2NrZXRzTG9va3VwKHNlbGYudXJsLCBudWxsLCBzZWxmKSB9KTtcbiAgICAgIH0sXG4gICAgICB0byhyb29tKSB7XG4gICAgICAgIHJldHVybiBzZXJ2ZXIudG8ocm9vbSwgc2VsZik7XG4gICAgICB9LFxuICAgICAgaW4ocm9vbSkge1xuICAgICAgICByZXR1cm4gc2VydmVyLmluKHJvb20sIHNlbGYpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKlxuICAqIEZvciByZWdpc3RlcmluZyBldmVudHMgdG8gYmUgcmVjZWl2ZWQgZnJvbSB0aGUgc2VydmVyXG4gICovXG4gIG9uKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qXG4gICAqIEpvaW4gYSByb29tIG9uIGEgc2VydmVyXG4gICAqXG4gICAqIGh0dHA6Ly9zb2NrZXQuaW8vZG9jcy9yb29tcy1hbmQtbmFtZXNwYWNlcy8jam9pbmluZy1hbmQtbGVhdmluZ1xuICAgKi9cbiAgam9pbihyb29tKSB7XG4gICAgbmV0d29ya0JyaWRnZS5hZGRNZW1iZXJzaGlwVG9Sb29tKHRoaXMsIHJvb20pO1xuICB9XG5cbiAgLypcbiAgICogR2V0IHRoZSB3ZWJzb2NrZXQgdG8gbGVhdmUgdGhlIHJvb21cbiAgICpcbiAgICogaHR0cDovL3NvY2tldC5pby9kb2NzL3Jvb21zLWFuZC1uYW1lc3BhY2VzLyNqb2luaW5nLWFuZC1sZWF2aW5nXG4gICAqL1xuICBsZWF2ZShyb29tKSB7XG4gICAgbmV0d29ya0JyaWRnZS5yZW1vdmVNZW1iZXJzaGlwRnJvbVJvb20odGhpcywgcm9vbSk7XG4gIH1cblxuICB0byhyb29tKSB7XG4gICAgcmV0dXJuIHRoaXMuYnJvYWRjYXN0LnRvKHJvb20pO1xuICB9XG5cbiAgaW4oKSB7XG4gICAgcmV0dXJuIHRoaXMudG8uYXBwbHkobnVsbCwgYXJncyk7XG4gIH1cblxuICAvKlxuICAgKiBJbnZva2VzIGFsbCBsaXN0ZW5lciBmdW5jdGlvbnMgdGhhdCBhcmUgbGlzdGVuaW5nIHRvIHRoZSBnaXZlbiBldmVudC50eXBlIHByb3BlcnR5LiBFYWNoXG4gICAqIGxpc3RlbmVyIHdpbGwgYmUgcGFzc2VkIHRoZSBldmVudCBhcyB0aGUgZmlyc3QgYXJndW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBldmVudCAtIGV2ZW50IG9iamVjdCB3aGljaCB3aWxsIGJlIHBhc3NlZCB0byBhbGwgbGlzdGVuZXJzIG9mIHRoZSBldmVudC50eXBlIHByb3BlcnR5XG4gICAqL1xuICBkaXNwYXRjaEV2ZW50KGV2ZW50LCAuLi5jdXN0b21Bcmd1bWVudHMpIHtcbiAgICBjb25zdCBldmVudE5hbWUgPSBldmVudC50eXBlO1xuICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzW2V2ZW50TmFtZV07XG5cbiAgICBpZiAoIUFycmF5LmlzQXJyYXkobGlzdGVuZXJzKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgaWYgKGN1c3RvbUFyZ3VtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGN1c3RvbUFyZ3VtZW50cyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBSZWd1bGFyIFdlYlNvY2tldHMgZXhwZWN0IGEgTWVzc2FnZUV2ZW50IGJ1dCBTb2NrZXRpby5pbyBqdXN0IHdhbnRzIHJhdyBkYXRhXG4gICAgICAgIC8vICBwYXlsb2FkIGluc3RhbmNlb2YgTWVzc2FnZUV2ZW50IHdvcmtzLCBidXQgeW91IGNhbid0IGlzbnRhbmNlIG9mIE5vZGVFdmVudFxuICAgICAgICAvLyAgZm9yIG5vdyB3ZSBkZXRlY3QgaWYgdGhlIG91dHB1dCBoYXMgZGF0YSBkZWZpbmVkIG9uIGl0XG4gICAgICAgIGxpc3RlbmVyLmNhbGwodGhpcywgZXZlbnQuZGF0YSA/IGV2ZW50LmRhdGEgOiBldmVudCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuU29ja2V0SU8uQ09OTkVDVElORyA9IDA7XG5Tb2NrZXRJTy5PUEVOID0gMTtcblNvY2tldElPLkNMT1NJTkcgPSAyO1xuU29ja2V0SU8uQ0xPU0VEID0gMztcblxuLypcbiogU3RhdGljIGNvbnN0cnVjdG9yIG1ldGhvZHMgZm9yIHRoZSBJTyBTb2NrZXRcbiovXG5jb25zdCBJTyA9IGZ1bmN0aW9uIGlvQ29uc3RydWN0b3IodXJsKSB7XG4gIHJldHVybiBuZXcgU29ja2V0SU8odXJsKTtcbn07XG5cbi8qXG4qIEFsaWFzIHRoZSByYXcgSU8oKSBjb25zdHJ1Y3RvclxuKi9cbklPLmNvbm5lY3QgPSBmdW5jdGlvbiBpb0Nvbm5lY3QodXJsKSB7XG4gIC8qIGVzbGludC1kaXNhYmxlIG5ldy1jYXAgKi9cbiAgcmV0dXJuIElPKHVybCk7XG4gIC8qIGVzbGludC1lbmFibGUgbmV3LWNhcCAqL1xufTtcblxuZXhwb3J0IGRlZmF1bHQgSU87XG4iLCJpbXBvcnQgTW9ja1NlcnZlciBmcm9tICcuL3NlcnZlcic7XG5pbXBvcnQgTW9ja1NvY2tldElPIGZyb20gJy4vc29ja2V0LWlvJztcbmltcG9ydCBNb2NrV2ViU29ja2V0IGZyb20gJy4vd2Vic29ja2V0JztcblxuZXhwb3J0IGNvbnN0IFNlcnZlciA9IE1vY2tTZXJ2ZXI7XG5leHBvcnQgY29uc3QgV2ViU29ja2V0ID0gTW9ja1dlYlNvY2tldDtcbmV4cG9ydCBjb25zdCBTb2NrZXRJTyA9IE1vY2tTb2NrZXRJTztcbiJdLCJuYW1lcyI6WyJjb25zdCIsInRoaXMiLCJzdXBlciIsIldlYlNvY2tldCIsIm5vcm1hbGl6ZSIsImxvZ2dlciIsIkNMT1NFX0NPREVTIiwiU2VydmVyIiwiZ2xvYmFsT2JqZWN0IiwiU29ja2V0SU8iLCJNb2NrU2VydmVyIiwiTW9ja1dlYlNvY2tldCIsIk1vY2tTb2NrZXRJTyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7Ozs7Ozs7O0FBUUEsQUFBZSxTQUFTLEtBQUssQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFO0VBQy9DLFVBQVUsQ0FBQyxVQUFBLGNBQWMsRUFBQyxTQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUEsRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDekU7O0FDVk0sU0FBUyxNQUFNLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRTtFQUN0Q0EsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO0VBQ25CLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxXQUFXLEVBQUU7SUFDMUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtNQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQzNCO0dBQ0YsQ0FBQyxDQUFDOztFQUVILE9BQU8sT0FBTyxD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
