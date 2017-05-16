define(['exports'], function (exports) { 'use strict';

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

  if (connectionLookup && connectionLookup.server && connectionLookup.websockets.indexOf(websocket) === -1) {
    connectionLookup.websockets.push(websocket);
    return connectionLookup.server;
  }
};

/*
* Attaches a websocket to a room
*/
NetworkBridge.prototype.addMembershipToRoom = function addMembershipToRoom (websocket, room) {
  var connectionLookup = this.urlMap[websocket.url];

  if (connectionLookup && connectionLookup.server && connectionLookup.websockets.indexOf(websocket) !== -1) {
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
  return parts[1] && parts[1].indexOf('/') === -1 ? (url + "/") : url;
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
      throw new TypeError("Failed to construct 'Event': 1 argument required, but only 0 present.");
    }

    if (typeof eventInitConfig !== 'object') {
      throw new TypeError("Failed to construct 'Event': parameter 2 ('eventInitDict') is not an object");
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
      throw new TypeError("Failed to construct 'MessageEvent': 1 argument required, but only 0 present.");
    }

    if (typeof eventInitConfig !== 'object') {
      throw new TypeError("Failed to construct 'MessageEvent': parameter 2 ('eventInitDict') is not an object");
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
      throw new TypeError("Failed to construct 'CloseEvent': 1 argument required, but only 0 present.");
    }

    if (typeof eventInitConfig !== 'object') {
      throw new TypeError("Failed to construct 'CloseEvent': parameter 2 ('eventInitDict') is not an object");
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
    wasClean = code === 1000;
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
      throw new TypeError("Failed to construct 'WebSocket': 1 argument required, but only 0 present.");
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
        get: function get() {
          return this.listeners.open;
        },
        set: function set(listener) {
          this.addEventListener('open', listener);
        }
      },
      onmessage: {
        configurable: true,
        enumerable: true,
        get: function get() {
          return this.listeners.message;
        },
        set: function set(listener) {
          this.addEventListener('message', listener);
        }
      },
      onclose: {
        configurable: true,
        enumerable: true,
        get: function get() {
          return this.listeners.close;
        },
        set: function set(listener) {
          this.addEventListener('close', listener);
        }
      },
      onerror: {
        configurable: true,
        enumerable: true,
        get: function get() {
          return this.listeners.error;
        },
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
        if (
          server.options.verifyClient &&
          typeof server.options.verifyClient === 'function' &&
          !server.options.verifyClient()
        ) {
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
    if (this.readyState !== WebSocket.OPEN) {
      return undefined;
    }

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

  return typeof process === 'object' && typeof require === 'function' && typeof global === 'object' ? global : this;
}

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
        socket.dispatchEvent.apply(
          socket, [ createMessageEvent({
            type: event,
            data: data,
            origin: this$1.url,
            target: socket
          }) ].concat( data )
        );
      } else {
        socket.dispatchEvent(
          createMessageEvent({
            type: event,
            data: data,
            origin: this$1.url,
            target: socket
          })
        );
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
      socket.dispatchEvent(
        createCloseEvent({
          type: 'close',
          target: socket,
          code: code || codes.CLOSE_NORMAL,
          reason: reason || '',
          wasClean: wasClean
        })
      );
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
  Server.prototype.to = function to (room, broadcaster) {
    var self = this;
    var websockets = networkBridge.websocketsLookup(this.url, room, broadcaster);
    return {
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
        this.dispatchEvent(
          createCloseEvent({
            type: 'close',
            target: this,
            code: codes.CLOSE_NORMAL
          })
        );

        log('error', ("Socket.io connection to '" + (this.url) + "' failed"));
      }
    }, this);

    /**
      Add an aliased event listener for close / disconnect
     */
    this.addEventListener('close', function (event) {
      this$1.dispatchEvent(
        createCloseEvent({
          type: 'disconnect',
          target: event.target,
          code: event.code
        })
      );
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
    if (this.readyState !== SocketIO.OPEN) {
      return undefined;
    }

    var server = networkBridge.serverLookup(this.url);
    networkBridge.removeWebSocket(this, this.url);

    this.readyState = SocketIO.CLOSED;
    this.dispatchEvent(
      createCloseEvent({
        type: 'close',
        target: this,
        code: codes.CLOSE_NORMAL
      })
    );

    if (server) {
      server.dispatchEvent(
        createCloseEvent({
          type: 'disconnect',
          target: this,
          code: codes.CLOSE_NORMAL
        }),
        server
      );
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

});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9jay1zb2NrZXQuYW1kLmpzIiwic291cmNlcyI6WyIuLi9zcmMvaGVscGVycy9kZWxheS5qcyIsIi4uL3NyYy9oZWxwZXJzL2FycmF5LWhlbHBlcnMuanMiLCIuLi9zcmMvZXZlbnQtdGFyZ2V0LmpzIiwiLi4vc3JjL25ldHdvcmstYnJpZGdlLmpzIiwiLi4vc3JjL2hlbHBlcnMvY2xvc2UtY29kZXMuanMiLCIuLi9zcmMvaGVscGVycy9ub3JtYWxpemUtdXJsLmpzIiwiLi4vc3JjL2hlbHBlcnMvbG9nZ2VyLmpzIiwiLi4vc3JjL2hlbHBlcnMvZXZlbnQtcHJvdG90eXBlLmpzIiwiLi4vc3JjL2hlbHBlcnMvZXZlbnQuanMiLCIuLi9zcmMvaGVscGVycy9tZXNzYWdlLWV2ZW50LmpzIiwiLi4vc3JjL2hlbHBlcnMvY2xvc2UtZXZlbnQuanMiLCIuLi9zcmMvZXZlbnQtZmFjdG9yeS5qcyIsIi4uL3NyYy93ZWJzb2NrZXQuanMiLCIuLi9zcmMvaGVscGVycy9nbG9iYWwtb2JqZWN0LmpzIiwiLi4vc3JjL3NlcnZlci5qcyIsIi4uL3NyYy9zb2NrZXQtaW8uanMiLCIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbiogVGhpcyBkZWxheSBhbGxvd3MgdGhlIHRocmVhZCB0byBmaW5pc2ggYXNzaWduaW5nIGl0cyBvbiogbWV0aG9kc1xuKiBiZWZvcmUgaW52b2tpbmcgdGhlIGRlbGF5IGNhbGxiYWNrLiBUaGlzIGlzIHB1cmVseSBhIHRpbWluZyBoYWNrLlxuKiBodHRwOi8vZ2Vla2FieXRlLmJsb2dzcG90LmNvbS8yMDE0LzAxL2phdmFzY3JpcHQtZWZmZWN0LW9mLXNldHRpbmctc2V0dGltZW91dC5odG1sXG4qXG4qIEBwYXJhbSB7Y2FsbGJhY2s6IGZ1bmN0aW9ufSB0aGUgY2FsbGJhY2sgd2hpY2ggd2lsbCBiZSBpbnZva2VkIGFmdGVyIHRoZSB0aW1lb3V0XG4qIEBwYXJtYSB7Y29udGV4dDogb2JqZWN0fSB0aGUgY29udGV4dCBpbiB3aGljaCB0byBpbnZva2UgdGhlIGZ1bmN0aW9uXG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVsYXkoY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgc2V0VGltZW91dCh0aW1lb3V0Q29udGV4dCA9PiBjYWxsYmFjay5jYWxsKHRpbWVvdXRDb250ZXh0KSwgNCwgY29udGV4dCk7XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gcmVqZWN0KGFycmF5LCBjYWxsYmFjaykge1xuICBjb25zdCByZXN1bHRzID0gW107XG4gIGFycmF5LmZvckVhY2goaXRlbUluQXJyYXkgPT4ge1xuICAgIGlmICghY2FsbGJhY2soaXRlbUluQXJyYXkpKSB7XG4gICAgICByZXN1bHRzLnB1c2goaXRlbUluQXJyYXkpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHJlc3VsdHM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXIoYXJyYXksIGNhbGxiYWNrKSB7XG4gIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgYXJyYXkuZm9yRWFjaChpdGVtSW5BcnJheSA9PiB7XG4gICAgaWYgKGNhbGxiYWNrKGl0ZW1JbkFycmF5KSkge1xuICAgICAgcmVzdWx0cy5wdXNoKGl0ZW1JbkFycmF5KTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiByZXN1bHRzO1xufVxuIiwiaW1wb3J0IHsgcmVqZWN0LCBmaWx0ZXIgfSBmcm9tICcuL2hlbHBlcnMvYXJyYXktaGVscGVycyc7XG5cbi8qXG4qIEV2ZW50VGFyZ2V0IGlzIGFuIGludGVyZmFjZSBpbXBsZW1lbnRlZCBieSBvYmplY3RzIHRoYXQgY2FuXG4qIHJlY2VpdmUgZXZlbnRzIGFuZCBtYXkgaGF2ZSBsaXN0ZW5lcnMgZm9yIHRoZW0uXG4qXG4qIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9FdmVudFRhcmdldFxuKi9cbmNsYXNzIEV2ZW50VGFyZ2V0IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMgPSB7fTtcbiAgfVxuXG4gIC8qXG4gICogVGllcyBhIGxpc3RlbmVyIGZ1bmN0aW9uIHRvIGFuIGV2ZW50IHR5cGUgd2hpY2ggY2FuIGxhdGVyIGJlIGludm9rZWQgdmlhIHRoZVxuICAqIGRpc3BhdGNoRXZlbnQgbWV0aG9kLlxuICAqXG4gICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSB0aGUgdHlwZSBvZiBldmVudCAoaWU6ICdvcGVuJywgJ21lc3NhZ2UnLCBldGMuKVxuICAqIEBwYXJhbSB7ZnVuY3Rpb259IGxpc3RlbmVyIC0gdGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSB3aGVuZXZlciBhbiBldmVudCBpcyBkaXNwYXRjaGVkIG1hdGNoaW5nIHRoZSBnaXZlbiB0eXBlXG4gICogQHBhcmFtIHtib29sZWFufSB1c2VDYXB0dXJlIC0gTi9BIFRPRE86IGltcGxlbWVudCB1c2VDYXB0dXJlIGZ1bmN0aW9uYWxpdHlcbiAgKi9cbiAgYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciAvKiAsIHVzZUNhcHR1cmUgKi8pIHtcbiAgICBpZiAodHlwZW9mIGxpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkodGhpcy5saXN0ZW5lcnNbdHlwZV0pKSB7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzW3R5cGVdID0gW107XG4gICAgICB9XG5cbiAgICAgIC8vIE9ubHkgYWRkIHRoZSBzYW1lIGZ1bmN0aW9uIG9uY2VcbiAgICAgIGlmIChmaWx0ZXIodGhpcy5saXN0ZW5lcnNbdHlwZV0sIGl0ZW0gPT4gaXRlbSA9PT0gbGlzdGVuZXIpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aGlzLmxpc3RlbmVyc1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKlxuICAqIFJlbW92ZXMgdGhlIGxpc3RlbmVyIHNvIGl0IHdpbGwgbm8gbG9uZ2VyIGJlIGludm9rZWQgdmlhIHRoZSBkaXNwYXRjaEV2ZW50IG1ldGhvZC5cbiAgKlxuICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gdGhlIHR5cGUgb2YgZXZlbnQgKGllOiAnb3BlbicsICdtZXNzYWdlJywgZXRjLilcbiAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBsaXN0ZW5lciAtIHRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugd2hlbmV2ZXIgYW4gZXZlbnQgaXMgZGlzcGF0Y2hlZCBtYXRjaGluZyB0aGUgZ2l2ZW4gdHlwZVxuICAqIEBwYXJhbSB7Ym9vbGVhbn0gdXNlQ2FwdHVyZSAtIE4vQSBUT0RPOiBpbXBsZW1lbnQgdXNlQ2FwdHVyZSBmdW5jdGlvbmFsaXR5XG4gICovXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgcmVtb3ZpbmdMaXN0ZW5lciAvKiAsIHVzZUNhcHR1cmUgKi8pIHtcbiAgICBjb25zdCBhcnJheU9mTGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnNbdHlwZV07XG4gICAgdGhpcy5saXN0ZW5lcnNbdHlwZV0gPSByZWplY3QoYXJyYXlPZkxpc3RlbmVycywgbGlzdGVuZXIgPT4gbGlzdGVuZXIgPT09IHJlbW92aW5nTGlzdGVuZXIpO1xuICB9XG5cbiAgLypcbiAgKiBJbnZva2VzIGFsbCBsaXN0ZW5lciBmdW5jdGlvbnMgdGhhdCBhcmUgbGlzdGVuaW5nIHRvIHRoZSBnaXZlbiBldmVudC50eXBlIHByb3BlcnR5LiBFYWNoXG4gICogbGlzdGVuZXIgd2lsbCBiZSBwYXNzZWQgdGhlIGV2ZW50IGFzIHRoZSBmaXJzdCBhcmd1bWVudC5cbiAgKlxuICAqIEBwYXJhbSB7b2JqZWN0fSBldmVudCAtIGV2ZW50IG9iamVjdCB3aGljaCB3aWxsIGJlIHBhc3NlZCB0byBhbGwgbGlzdGVuZXJzIG9mIHRoZSBldmVudC50eXBlIHByb3BlcnR5XG4gICovXG4gIGRpc3BhdGNoRXZlbnQoZXZlbnQsIC4uLmN1c3RvbUFyZ3VtZW50cykge1xuICAgIGNvbnN0IGV2ZW50TmFtZSA9IGV2ZW50LnR5cGU7XG4gICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnNbZXZlbnROYW1lXTtcblxuICAgIGlmICghQXJyYXkuaXNBcnJheShsaXN0ZW5lcnMpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbGlzdGVuZXJzLmZvckVhY2gobGlzdGVuZXIgPT4ge1xuICAgICAgaWYgKGN1c3RvbUFyZ3VtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGN1c3RvbUFyZ3VtZW50cyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsaXN0ZW5lci5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEV2ZW50VGFyZ2V0O1xuIiwiaW1wb3J0IHsgcmVqZWN0IH0gZnJvbSAnLi9oZWxwZXJzL2FycmF5LWhlbHBlcnMnO1xuXG4vKlxuKiBUaGUgbmV0d29yayBicmlkZ2UgaXMgYSB3YXkgZm9yIHRoZSBtb2NrIHdlYnNvY2tldCBvYmplY3QgdG8gJ2NvbW11bmljYXRlJyB3aXRoXG4qIGFsbCBhdmFpbGFibGUgc2VydmVycy4gVGhpcyBpcyBhIHNpbmdsZXRvbiBvYmplY3Qgc28gaXQgaXMgaW1wb3J0YW50IHRoYXQgeW91XG4qIGNsZWFuIHVwIHVybE1hcCB3aGVuZXZlciB5b3UgYXJlIGZpbmlzaGVkLlxuKi9cbmNsYXNzIE5ldHdvcmtCcmlkZ2Uge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnVybE1hcCA9IHt9O1xuICB9XG5cbiAgLypcbiAgKiBBdHRhY2hlcyBhIHdlYnNvY2tldCBvYmplY3QgdG8gdGhlIHVybE1hcCBoYXNoIHNvIHRoYXQgaXQgY2FuIGZpbmQgdGhlIHNlcnZlclxuICAqIGl0IGlzIGNvbm5lY3RlZCB0byBhbmQgdGhlIHNlcnZlciBpbiB0dXJuIGNhbiBmaW5kIGl0LlxuICAqXG4gICogQHBhcmFtIHtvYmplY3R9IHdlYnNvY2tldCAtIHdlYnNvY2tldCBvYmplY3QgdG8gYWRkIHRvIHRoZSB1cmxNYXAgaGFzaFxuICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgKi9cbiAgYXR0YWNoV2ViU29ja2V0KHdlYnNvY2tldCwgdXJsKSB7XG4gICAgY29uc3QgY29ubmVjdGlvbkxvb2t1cCA9IHRoaXMudXJsTWFwW3VybF07XG5cbiAgICBpZiAoY29ubmVjdGlvbkxvb2t1cCAmJiBjb25uZWN0aW9uTG9va3VwLnNlcnZlciAmJiBjb25uZWN0aW9uTG9va3VwLndlYnNvY2tldHMuaW5kZXhPZih3ZWJzb2NrZXQpID09PSAtMSkge1xuICAgICAgY29ubmVjdGlvbkxvb2t1cC53ZWJzb2NrZXRzLnB1c2god2Vic29ja2V0KTtcbiAgICAgIHJldHVybiBjb25uZWN0aW9uTG9va3VwLnNlcnZlcjtcbiAgICB9XG4gIH1cblxuICAvKlxuICAqIEF0dGFjaGVzIGEgd2Vic29ja2V0IHRvIGEgcm9vbVxuICAqL1xuICBhZGRNZW1iZXJzaGlwVG9Sb29tKHdlYnNvY2tldCwgcm9vbSkge1xuICAgIGNvbnN0IGNvbm5lY3Rpb25Mb29rdXAgPSB0aGlzLnVybE1hcFt3ZWJzb2NrZXQudXJsXTtcblxuICAgIGlmIChjb25uZWN0aW9uTG9va3VwICYmIGNvbm5lY3Rpb25Mb29rdXAuc2VydmVyICYmIGNvbm5lY3Rpb25Mb29rdXAud2Vic29ja2V0cy5pbmRleE9mKHdlYnNvY2tldCkgIT09IC0xKSB7XG4gICAgICBpZiAoIWNvbm5lY3Rpb25Mb29rdXAucm9vbU1lbWJlcnNoaXBzW3Jvb21dKSB7XG4gICAgICAgIGNvbm5lY3Rpb25Mb29rdXAucm9vbU1lbWJlcnNoaXBzW3Jvb21dID0gW107XG4gICAgICB9XG5cbiAgICAgIGNvbm5lY3Rpb25Mb29rdXAucm9vbU1lbWJlcnNoaXBzW3Jvb21dLnB1c2god2Vic29ja2V0KTtcbiAgICB9XG4gIH1cblxuICAvKlxuICAqIEF0dGFjaGVzIGEgc2VydmVyIG9iamVjdCB0byB0aGUgdXJsTWFwIGhhc2ggc28gdGhhdCBpdCBjYW4gZmluZCBhIHdlYnNvY2tldHNcbiAgKiB3aGljaCBhcmUgY29ubmVjdGVkIHRvIGl0IGFuZCBzbyB0aGF0IHdlYnNvY2tldHMgY2FuIGluIHR1cm4gY2FuIGZpbmQgaXQuXG4gICpcbiAgKiBAcGFyYW0ge29iamVjdH0gc2VydmVyIC0gc2VydmVyIG9iamVjdCB0byBhZGQgdG8gdGhlIHVybE1hcCBoYXNoXG4gICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAqL1xuICBhdHRhY2hTZXJ2ZXIoc2VydmVyLCB1cmwpIHtcbiAgICBjb25zdCBjb25uZWN0aW9uTG9va3VwID0gdGhpcy51cmxNYXBbdXJsXTtcblxuICAgIGlmICghY29ubmVjdGlvbkxvb2t1cCkge1xuICAgICAgdGhpcy51cmxNYXBbdXJsXSA9IHtcbiAgICAgICAgc2VydmVyLFxuICAgICAgICB3ZWJzb2NrZXRzOiBbXSxcbiAgICAgICAgcm9vbU1lbWJlcnNoaXBzOiB7fVxuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHNlcnZlcjtcbiAgICB9XG4gIH1cblxuICAvKlxuICAqIEZpbmRzIHRoZSBzZXJ2ZXIgd2hpY2ggaXMgJ3J1bm5pbmcnIG9uIHRoZSBnaXZlbiB1cmwuXG4gICpcbiAgKiBAcGFyYW0ge3N0cmluZ30gdXJsIC0gdGhlIHVybCB0byB1c2UgdG8gZmluZCB3aGljaCBzZXJ2ZXIgaXMgcnVubmluZyBvbiBpdFxuICAqL1xuICBzZXJ2ZXJMb29rdXAodXJsKSB7XG4gICAgY29uc3QgY29ubmVjdGlvbkxvb2t1cCA9IHRoaXMudXJsTWFwW3VybF07XG5cbiAgICBpZiAoY29ubmVjdGlvbkxvb2t1cCkge1xuICAgICAgcmV0dXJuIGNvbm5lY3Rpb25Mb29rdXAuc2VydmVyO1xuICAgIH1cbiAgfVxuXG4gIC8qXG4gICogRmluZHMgYWxsIHdlYnNvY2tldHMgd2hpY2ggaXMgJ2xpc3RlbmluZycgb24gdGhlIGdpdmVuIHVybC5cbiAgKlxuICAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgLSB0aGUgdXJsIHRvIHVzZSB0byBmaW5kIGFsbCB3ZWJzb2NrZXRzIHdoaWNoIGFyZSBhc3NvY2lhdGVkIHdpdGggaXRcbiAgKiBAcGFyYW0ge3N0cmluZ30gcm9vbSAtIGlmIGEgcm9vbSBpcyBwcm92aWRlZCwgd2lsbCBvbmx5IHJldHVybiBzb2NrZXRzIGluIHRoaXMgcm9vbVxuICAqIEBwYXJhbSB7Y2xhc3N9IGJyb2FkY2FzdGVyIC0gc29ja2V0IHRoYXQgaXMgYnJvYWRjYXN0aW5nIGFuZCBpcyB0byBiZSBleGNsdWRlZCBmcm9tIHRoZSBsb29rdXBcbiAgKi9cbiAgd2Vic29ja2V0c0xvb2t1cCh1cmwsIHJvb20sIGJyb2FkY2FzdGVyKSB7XG4gICAgbGV0IHdlYnNvY2tldHM7XG4gICAgY29uc3QgY29ubmVjdGlvbkxvb2t1cCA9IHRoaXMudXJsTWFwW3VybF07XG5cbiAgICB3ZWJzb2NrZXRzID0gY29ubmVjdGlvbkxvb2t1cCA/IGNvbm5lY3Rpb25Mb29rdXAud2Vic29ja2V0cyA6IFtdO1xuXG4gICAgaWYgKHJvb20pIHtcbiAgICAgIGNvbnN0IG1lbWJlcnMgPSBjb25uZWN0aW9uTG9va3VwLnJvb21NZW1iZXJzaGlwc1tyb29tXTtcbiAgICAgIHdlYnNvY2tldHMgPSBtZW1iZXJzIHx8IFtdO1xuICAgIH1cblxuICAgIHJldHVybiBicm9hZGNhc3RlciA/IHdlYnNvY2tldHMuZmlsdGVyKHdlYnNvY2tldCA9PiB3ZWJzb2NrZXQgIT09IGJyb2FkY2FzdGVyKSA6IHdlYnNvY2tldHM7XG4gIH1cblxuICAvKlxuICAqIFJlbW92ZXMgdGhlIGVudHJ5IGFzc29jaWF0ZWQgd2l0aCB0aGUgdXJsLlxuICAqXG4gICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAqL1xuICByZW1vdmVTZXJ2ZXIodXJsKSB7XG4gICAgZGVsZXRlIHRoaXMudXJsTWFwW3VybF07XG4gIH1cblxuICAvKlxuICAqIFJlbW92ZXMgdGhlIGluZGl2aWR1YWwgd2Vic29ja2V0IGZyb20gdGhlIG1hcCBvZiBhc3NvY2lhdGVkIHdlYnNvY2tldHMuXG4gICpcbiAgKiBAcGFyYW0ge29iamVjdH0gd2Vic29ja2V0IC0gd2Vic29ja2V0IG9iamVjdCB0byByZW1vdmUgZnJvbSB0aGUgdXJsIG1hcFxuICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgKi9cbiAgcmVtb3ZlV2ViU29ja2V0KHdlYnNvY2tldCwgdXJsKSB7XG4gICAgY29uc3QgY29ubmVjdGlvbkxvb2t1cCA9IHRoaXMudXJsTWFwW3VybF07XG5cbiAgICBpZiAoY29ubmVjdGlvbkxvb2t1cCkge1xuICAgICAgY29ubmVjdGlvbkxvb2t1cC53ZWJzb2NrZXRzID0gcmVqZWN0KGNvbm5lY3Rpb25Mb29rdXAud2Vic29ja2V0cywgc29ja2V0ID0+IHNvY2tldCA9PT0gd2Vic29ja2V0KTtcbiAgICB9XG4gIH1cblxuICAvKlxuICAqIFJlbW92ZXMgYSB3ZWJzb2NrZXQgZnJvbSBhIHJvb21cbiAgKi9cbiAgcmVtb3ZlTWVtYmVyc2hpcEZyb21Sb29tKHdlYnNvY2tldCwgcm9vbSkge1xuICAgIGNvbnN0IGNvbm5lY3Rpb25Mb29rdXAgPSB0aGlzLnVybE1hcFt3ZWJzb2NrZXQudXJsXTtcbiAgICBjb25zdCBtZW1iZXJzaGlwcyA9IGNvbm5lY3Rpb25Mb29rdXAucm9vbU1lbWJlcnNoaXBzW3Jvb21dO1xuXG4gICAgaWYgKGNvbm5lY3Rpb25Mb29rdXAgJiYgbWVtYmVyc2hpcHMgIT09IG51bGwpIHtcbiAgICAgIGNvbm5lY3Rpb25Mb29rdXAucm9vbU1lbWJlcnNoaXBzW3Jvb21dID0gcmVqZWN0KG1lbWJlcnNoaXBzLCBzb2NrZXQgPT4gc29ja2V0ID09PSB3ZWJzb2NrZXQpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgTmV0d29ya0JyaWRnZSgpOyAvLyBOb3RlOiB0aGlzIGlzIGEgc2luZ2xldG9uXG4iLCIvKlxuKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ2xvc2VFdmVudFxuKi9cbmNvbnN0IGNvZGVzID0ge1xuICBDTE9TRV9OT1JNQUw6IDEwMDAsXG4gIENMT1NFX0dPSU5HX0FXQVk6IDEwMDEsXG4gIENMT1NFX1BST1RPQ09MX0VSUk9SOiAxMDAyLFxuICBDTE9TRV9VTlNVUFBPUlRFRDogMTAwMyxcbiAgQ0xPU0VfTk9fU1RBVFVTOiAxMDA1LFxuICBDTE9TRV9BQk5PUk1BTDogMTAwNixcbiAgQ0xPU0VfVE9PX0xBUkdFOiAxMDA5XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjb2RlcztcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG5vcm1hbGl6ZVVybCh1cmwpIHtcbiAgY29uc3QgcGFydHMgPSB1cmwuc3BsaXQoJzovLycpO1xuICByZXR1cm4gcGFydHNbMV0gJiYgcGFydHNbMV0uaW5kZXhPZignLycpID09PSAtMSA/IGAke3VybH0vYCA6IHVybDtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGxvZyhtZXRob2QsIG1lc3NhZ2UpIHtcbiAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuICBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAndGVzdCcpIHtcbiAgICBjb25zb2xlW21ldGhvZF0uY2FsbChudWxsLCBtZXNzYWdlKTtcbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2ZW50UHJvdG90eXBlIHtcbiAgLy8gTm9vcHNcbiAgc3RvcFByb3BhZ2F0aW9uKCkge31cbiAgc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCkge31cblxuICAvLyBpZiBubyBhcmd1bWVudHMgYXJlIHBhc3NlZCB0aGVuIHRoZSB0eXBlIGlzIHNldCB0byBcInVuZGVmaW5lZFwiIG9uXG4gIC8vIGNocm9tZSBhbmQgc2FmYXJpLlxuICBpbml0RXZlbnQodHlwZSA9ICd1bmRlZmluZWQnLCBidWJibGVzID0gZmFsc2UsIGNhbmNlbGFibGUgPSBmYWxzZSkge1xuICAgIHRoaXMudHlwZSA9IFN0cmluZyh0eXBlKTtcbiAgICB0aGlzLmJ1YmJsZXMgPSBCb29sZWFuKGJ1YmJsZXMpO1xuICAgIHRoaXMuY2FuY2VsYWJsZSA9IEJvb2xlYW4oY2FuY2VsYWJsZSk7XG4gIH1cbn1cbiIsImltcG9ydCBFdmVudFByb3RvdHlwZSBmcm9tICcuL2V2ZW50LXByb3RvdHlwZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2ZW50IGV4dGVuZHMgRXZlbnRQcm90b3R5cGUge1xuICBjb25zdHJ1Y3Rvcih0eXBlLCBldmVudEluaXRDb25maWcgPSB7fSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICBpZiAoIXR5cGUpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJGYWlsZWQgdG8gY29uc3RydWN0ICdFdmVudCc6IDEgYXJndW1lbnQgcmVxdWlyZWQsIGJ1dCBvbmx5IDAgcHJlc2VudC5cIik7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBldmVudEluaXRDb25maWcgIT09ICdvYmplY3QnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRmFpbGVkIHRvIGNvbnN0cnVjdCAnRXZlbnQnOiBwYXJhbWV0ZXIgMiAoJ2V2ZW50SW5pdERpY3QnKSBpcyBub3QgYW4gb2JqZWN0XCIpO1xuICAgIH1cblxuICAgIGNvbnN0IHsgYnViYmxlcywgY2FuY2VsYWJsZSB9ID0gZXZlbnRJbml0Q29uZmlnO1xuXG4gICAgdGhpcy50eXBlID0gU3RyaW5nKHR5cGUpO1xuICAgIHRoaXMudGltZVN0YW1wID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLnRhcmdldCA9IG51bGw7XG4gICAgdGhpcy5zcmNFbGVtZW50ID0gbnVsbDtcbiAgICB0aGlzLnJldHVyblZhbHVlID0gdHJ1ZTtcbiAgICB0aGlzLmlzVHJ1c3RlZCA9IGZhbHNlO1xuICAgIHRoaXMuZXZlbnRQaGFzZSA9IDA7XG4gICAgdGhpcy5kZWZhdWx0UHJldmVudGVkID0gZmFsc2U7XG4gICAgdGhpcy5jdXJyZW50VGFyZ2V0ID0gbnVsbDtcbiAgICB0aGlzLmNhbmNlbGFibGUgPSBjYW5jZWxhYmxlID8gQm9vbGVhbihjYW5jZWxhYmxlKSA6IGZhbHNlO1xuICAgIHRoaXMuY2FubmNlbEJ1YmJsZSA9IGZhbHNlO1xuICAgIHRoaXMuYnViYmxlcyA9IGJ1YmJsZXMgPyBCb29sZWFuKGJ1YmJsZXMpIDogZmFsc2U7XG4gIH1cbn1cbiIsImltcG9ydCBFdmVudFByb3RvdHlwZSBmcm9tICcuL2V2ZW50LXByb3RvdHlwZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1lc3NhZ2VFdmVudCBleHRlbmRzIEV2ZW50UHJvdG90eXBlIHtcbiAgY29uc3RydWN0b3IodHlwZSwgZXZlbnRJbml0Q29uZmlnID0ge30pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgaWYgKCF0eXBlKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRmFpbGVkIHRvIGNvbnN0cnVjdCAnTWVzc2FnZUV2ZW50JzogMSBhcmd1bWVudCByZXF1aXJlZCwgYnV0IG9ubHkgMCBwcmVzZW50LlwiKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGV2ZW50SW5pdENvbmZpZyAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJGYWlsZWQgdG8gY29uc3RydWN0ICdNZXNzYWdlRXZlbnQnOiBwYXJhbWV0ZXIgMiAoJ2V2ZW50SW5pdERpY3QnKSBpcyBub3QgYW4gb2JqZWN0XCIpO1xuICAgIH1cblxuICAgIGNvbnN0IHsgYnViYmxlcywgY2FuY2VsYWJsZSwgZGF0YSwgb3JpZ2luLCBsYXN0RXZlbnRJZCwgcG9ydHMgfSA9IGV2ZW50SW5pdENvbmZpZztcblxuICAgIHRoaXMudHlwZSA9IFN0cmluZyh0eXBlKTtcbiAgICB0aGlzLnRpbWVTdGFtcCA9IERhdGUubm93KCk7XG4gICAgdGhpcy50YXJnZXQgPSBudWxsO1xuICAgIHRoaXMuc3JjRWxlbWVudCA9IG51bGw7XG4gICAgdGhpcy5yZXR1cm5WYWx1ZSA9IHRydWU7XG4gICAgdGhpcy5pc1RydXN0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLmV2ZW50UGhhc2UgPSAwO1xuICAgIHRoaXMuZGVmYXVsdFByZXZlbnRlZCA9IGZhbHNlO1xuICAgIHRoaXMuY3VycmVudFRhcmdldCA9IG51bGw7XG4gICAgdGhpcy5jYW5jZWxhYmxlID0gY2FuY2VsYWJsZSA/IEJvb2xlYW4oY2FuY2VsYWJsZSkgOiBmYWxzZTtcbiAgICB0aGlzLmNhbm5jZWxCdWJibGUgPSBmYWxzZTtcbiAgICB0aGlzLmJ1YmJsZXMgPSBidWJibGVzID8gQm9vbGVhbihidWJibGVzKSA6IGZhbHNlO1xuICAgIHRoaXMub3JpZ2luID0gb3JpZ2luID8gU3RyaW5nKG9yaWdpbikgOiAnJztcbiAgICB0aGlzLnBvcnRzID0gdHlwZW9mIHBvcnRzID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiBwb3J0cztcbiAgICB0aGlzLmRhdGEgPSB0eXBlb2YgZGF0YSA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogZGF0YTtcbiAgICB0aGlzLmxhc3RFdmVudElkID0gbGFzdEV2ZW50SWQgPyBTdHJpbmcobGFzdEV2ZW50SWQpIDogJyc7XG4gIH1cbn1cbiIsImltcG9ydCBFdmVudFByb3RvdHlwZSBmcm9tICcuL2V2ZW50LXByb3RvdHlwZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsb3NlRXZlbnQgZXh0ZW5kcyBFdmVudFByb3RvdHlwZSB7XG4gIGNvbnN0cnVjdG9yKHR5cGUsIGV2ZW50SW5pdENvbmZpZyA9IHt9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIGlmICghdHlwZSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkZhaWxlZCB0byBjb25zdHJ1Y3QgJ0Nsb3NlRXZlbnQnOiAxIGFyZ3VtZW50IHJlcXVpcmVkLCBidXQgb25seSAwIHByZXNlbnQuXCIpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZXZlbnRJbml0Q29uZmlnICE9PSAnb2JqZWN0Jykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkZhaWxlZCB0byBjb25zdHJ1Y3QgJ0Nsb3NlRXZlbnQnOiBwYXJhbWV0ZXIgMiAoJ2V2ZW50SW5pdERpY3QnKSBpcyBub3QgYW4gb2JqZWN0XCIpO1xuICAgIH1cblxuICAgIGNvbnN0IHsgYnViYmxlcywgY2FuY2VsYWJsZSwgY29kZSwgcmVhc29uLCB3YXNDbGVhbiB9ID0gZXZlbnRJbml0Q29uZmlnO1xuXG4gICAgdGhpcy50eXBlID0gU3RyaW5nKHR5cGUpO1xuICAgIHRoaXMudGltZVN0YW1wID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLnRhcmdldCA9IG51bGw7XG4gICAgdGhpcy5zcmNFbGVtZW50ID0gbnVsbDtcbiAgICB0aGlzLnJldHVyblZhbHVlID0gdHJ1ZTtcbiAgICB0aGlzLmlzVHJ1c3RlZCA9IGZhbHNlO1xuICAgIHRoaXMuZXZlbnRQaGFzZSA9IDA7XG4gICAgdGhpcy5kZWZhdWx0UHJldmVudGVkID0gZmFsc2U7XG4gICAgdGhpcy5jdXJyZW50VGFyZ2V0ID0gbnVsbDtcbiAgICB0aGlzLmNhbmNlbGFibGUgPSBjYW5jZWxhYmxlID8gQm9vbGVhbihjYW5jZWxhYmxlKSA6IGZhbHNlO1xuICAgIHRoaXMuY2FubmNlbEJ1YmJsZSA9IGZhbHNlO1xuICAgIHRoaXMuYnViYmxlcyA9IGJ1YmJsZXMgPyBCb29sZWFuKGJ1YmJsZXMpIDogZmFsc2U7XG4gICAgdGhpcy5jb2RlID0gdHlwZW9mIGNvZGUgPT09ICdudW1iZXInID8gTnVtYmVyKGNvZGUpIDogMDtcbiAgICB0aGlzLnJlYXNvbiA9IHJlYXNvbiA/IFN0cmluZyhyZWFzb24pIDogJyc7XG4gICAgdGhpcy53YXNDbGVhbiA9IHdhc0NsZWFuID8gQm9vbGVhbih3YXNDbGVhbikgOiBmYWxzZTtcbiAgfVxufVxuIiwiaW1wb3J0IEV2ZW50IGZyb20gJy4vaGVscGVycy9ldmVudCc7XG5pbXBvcnQgTWVzc2FnZUV2ZW50IGZyb20gJy4vaGVscGVycy9tZXNzYWdlLWV2ZW50JztcbmltcG9ydCBDbG9zZUV2ZW50IGZyb20gJy4vaGVscGVycy9jbG9zZS1ldmVudCc7XG5cbi8qXG4qIENyZWF0ZXMgYW4gRXZlbnQgb2JqZWN0IGFuZCBleHRlbmRzIGl0IHRvIGFsbG93IGZ1bGwgbW9kaWZpY2F0aW9uIG9mXG4qIGl0cyBwcm9wZXJ0aWVzLlxuKlxuKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIC0gd2l0aGluIGNvbmZpZyB5b3Ugd2lsbCBuZWVkIHRvIHBhc3MgdHlwZSBhbmQgb3B0aW9uYWxseSB0YXJnZXRcbiovXG5mdW5jdGlvbiBjcmVhdGVFdmVudChjb25maWcpIHtcbiAgY29uc3QgeyB0eXBlLCB0YXJnZXQgfSA9IGNvbmZpZztcbiAgY29uc3QgZXZlbnRPYmplY3QgPSBuZXcgRXZlbnQodHlwZSk7XG5cbiAgaWYgKHRhcmdldCkge1xuICAgIGV2ZW50T2JqZWN0LnRhcmdldCA9IHRhcmdldDtcbiAgICBldmVudE9iamVjdC5zcmNFbGVtZW50ID0gdGFyZ2V0O1xuICAgIGV2ZW50T2JqZWN0LmN1cnJlbnRUYXJnZXQgPSB0YXJnZXQ7XG4gIH1cblxuICByZXR1cm4gZXZlbnRPYmplY3Q7XG59XG5cbi8qXG4qIENyZWF0ZXMgYSBNZXNzYWdlRXZlbnQgb2JqZWN0IGFuZCBleHRlbmRzIGl0IHRvIGFsbG93IGZ1bGwgbW9kaWZpY2F0aW9uIG9mXG4qIGl0cyBwcm9wZXJ0aWVzLlxuKlxuKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIC0gd2l0aGluIGNvbmZpZzogdHlwZSwgb3JpZ2luLCBkYXRhIGFuZCBvcHRpb25hbGx5IHRhcmdldFxuKi9cbmZ1bmN0aW9uIGNyZWF0ZU1lc3NhZ2VFdmVudChjb25maWcpIHtcbiAgY29uc3QgeyB0eXBlLCBvcmlnaW4sIGRhdGEsIHRhcmdldCB9ID0gY29uZmlnO1xuICBjb25zdCBtZXNzYWdlRXZlbnQgPSBuZXcgTWVzc2FnZUV2ZW50KHR5cGUsIHtcbiAgICBkYXRhLFxuICAgIG9yaWdpblxuICB9KTtcblxuICBpZiAodGFyZ2V0KSB7XG4gICAgbWVzc2FnZUV2ZW50LnRhcmdldCA9IHRhcmdldDtcbiAgICBtZXNzYWdlRXZlbnQuc3JjRWxlbWVudCA9IHRhcmdldDtcbiAgICBtZXNzYWdlRXZlbnQuY3VycmVudFRhcmdldCA9IHRhcmdldDtcbiAgfVxuXG4gIHJldHVybiBtZXNzYWdlRXZlbnQ7XG59XG5cbi8qXG4qIENyZWF0ZXMgYSBDbG9zZUV2ZW50IG9iamVjdCBhbmQgZXh0ZW5kcyBpdCB0byBhbGxvdyBmdWxsIG1vZGlmaWNhdGlvbiBvZlxuKiBpdHMgcHJvcGVydGllcy5cbipcbiogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyAtIHdpdGhpbiBjb25maWc6IHR5cGUgYW5kIG9wdGlvbmFsbHkgdGFyZ2V0LCBjb2RlLCBhbmQgcmVhc29uXG4qL1xuZnVuY3Rpb24gY3JlYXRlQ2xvc2VFdmVudChjb25maWcpIHtcbiAgY29uc3QgeyBjb2RlLCByZWFzb24sIHR5cGUsIHRhcmdldCB9ID0gY29uZmlnO1xuICBsZXQgeyB3YXNDbGVhbiB9ID0gY29uZmlnO1xuXG4gIGlmICghd2FzQ2xlYW4pIHtcbiAgICB3YXNDbGVhbiA9IGNvZGUgPT09IDEwMDA7XG4gIH1cblxuICBjb25zdCBjbG9zZUV2ZW50ID0gbmV3IENsb3NlRXZlbnQodHlwZSwge1xuICAgIGNvZGUsXG4gICAgcmVhc29uLFxuICAgIHdhc0NsZWFuXG4gIH0pO1xuXG4gIGlmICh0YXJnZXQpIHtcbiAgICBjbG9zZUV2ZW50LnRhcmdldCA9IHRhcmdldDtcbiAgICBjbG9zZUV2ZW50LnNyY0VsZW1lbnQgPSB0YXJnZXQ7XG4gICAgY2xvc2VFdmVudC5jdXJyZW50VGFyZ2V0ID0gdGFyZ2V0O1xuICB9XG5cbiAgcmV0dXJuIGNsb3NlRXZlbnQ7XG59XG5cbmV4cG9ydCB7IGNyZWF0ZUV2ZW50LCBjcmVhdGVNZXNzYWdlRXZlbnQsIGNyZWF0ZUNsb3NlRXZlbnQgfTtcbiIsImltcG9ydCBkZWxheSBmcm9tICcuL2hlbHBlcnMvZGVsYXknO1xuaW1wb3J0IEV2ZW50VGFyZ2V0IGZyb20gJy4vZXZlbnQtdGFyZ2V0JztcbmltcG9ydCBuZXR3b3JrQnJpZGdlIGZyb20gJy4vbmV0d29yay1icmlkZ2UnO1xuaW1wb3J0IENMT1NFX0NPREVTIGZyb20gJy4vaGVscGVycy9jbG9zZS1jb2Rlcyc7XG5pbXBvcnQgbm9ybWFsaXplIGZyb20gJy4vaGVscGVycy9ub3JtYWxpemUtdXJsJztcbmltcG9ydCBsb2dnZXIgZnJvbSAnLi9oZWxwZXJzL2xvZ2dlcic7XG5pbXBvcnQgeyBjcmVhdGVFdmVudCwgY3JlYXRlTWVzc2FnZUV2ZW50LCBjcmVhdGVDbG9zZUV2ZW50IH0gZnJvbSAnLi9ldmVudC1mYWN0b3J5JztcblxuLypcbiogVGhlIG1haW4gd2Vic29ja2V0IGNsYXNzIHdoaWNoIGlzIGRlc2lnbmVkIHRvIG1pbWljayB0aGUgbmF0aXZlIFdlYlNvY2tldCBjbGFzcyBhcyBjbG9zZVxuKiBhcyBwb3NzaWJsZS5cbipcbiogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1dlYlNvY2tldFxuKi9cbmNsYXNzIFdlYlNvY2tldCBleHRlbmRzIEV2ZW50VGFyZ2V0IHtcbiAgLypcbiAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICovXG4gIGNvbnN0cnVjdG9yKHVybCwgcHJvdG9jb2wgPSAnJykge1xuICAgIHN1cGVyKCk7XG5cbiAgICBpZiAoIXVybCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkZhaWxlZCB0byBjb25zdHJ1Y3QgJ1dlYlNvY2tldCc6IDEgYXJndW1lbnQgcmVxdWlyZWQsIGJ1dCBvbmx5IDAgcHJlc2VudC5cIik7XG4gICAgfVxuXG4gICAgdGhpcy5iaW5hcnlUeXBlID0gJ2Jsb2InO1xuICAgIHRoaXMudXJsID0gbm9ybWFsaXplKHVybCk7XG4gICAgdGhpcy5yZWFkeVN0YXRlID0gV2ViU29ja2V0LkNPTk5FQ1RJTkc7XG4gICAgdGhpcy5wcm90b2NvbCA9ICcnO1xuXG4gICAgaWYgKHR5cGVvZiBwcm90b2NvbCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRoaXMucHJvdG9jb2wgPSBwcm90b2NvbDtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocHJvdG9jb2wpICYmIHByb3RvY29sLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMucHJvdG9jb2wgPSBwcm90b2NvbFswXTtcbiAgICB9XG5cbiAgICAvKlxuICAgICogSW4gb3JkZXIgdG8gY2FwdHVyZSB0aGUgY2FsbGJhY2sgZnVuY3Rpb24gd2UgbmVlZCB0byBkZWZpbmUgY3VzdG9tIHNldHRlcnMuXG4gICAgKiBUbyBpbGx1c3RyYXRlOlxuICAgICogICBteVNvY2tldC5vbm9wZW4gPSBmdW5jdGlvbigpIHsgYWxlcnQodHJ1ZSkgfTtcbiAgICAqXG4gICAgKiBUaGUgb25seSB3YXkgdG8gY2FwdHVyZSB0aGF0IGZ1bmN0aW9uIGFuZCBob2xkIG9udG8gaXQgZm9yIGxhdGVyIGlzIHdpdGggdGhlXG4gICAgKiBiZWxvdyBjb2RlOlxuICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgb25vcGVuOiB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVycy5vcGVuO1xuICAgICAgICB9LFxuICAgICAgICBzZXQobGlzdGVuZXIpIHtcbiAgICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ29wZW4nLCBsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvbm1lc3NhZ2U6IHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXJzLm1lc3NhZ2U7XG4gICAgICAgIH0sXG4gICAgICAgIHNldChsaXN0ZW5lcikge1xuICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9uY2xvc2U6IHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXJzLmNsb3NlO1xuICAgICAgICB9LFxuICAgICAgICBzZXQobGlzdGVuZXIpIHtcbiAgICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgbGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb25lcnJvcjoge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lcnMuZXJyb3I7XG4gICAgICAgIH0sXG4gICAgICAgIHNldChsaXN0ZW5lcikge1xuICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IHNlcnZlciA9IG5ldHdvcmtCcmlkZ2UuYXR0YWNoV2ViU29ja2V0KHRoaXMsIHRoaXMudXJsKTtcblxuICAgIC8qXG4gICAgKiBUaGlzIGRlbGF5IGlzIG5lZWRlZCBzbyB0aGF0IHdlIGRvbnQgdHJpZ2dlciBhbiBldmVudCBiZWZvcmUgdGhlIGNhbGxiYWNrcyBoYXZlIGJlZW5cbiAgICAqIHNldHVwLiBGb3IgZXhhbXBsZTpcbiAgICAqXG4gICAgKiB2YXIgc29ja2V0ID0gbmV3IFdlYlNvY2tldCgnd3M6Ly9sb2NhbGhvc3QnKTtcbiAgICAqXG4gICAgKiAvLyBJZiB3ZSBkb250IGhhdmUgdGhlIGRlbGF5IHRoZW4gdGhlIGV2ZW50IHdvdWxkIGJlIHRyaWdnZXJlZCByaWdodCBoZXJlIGFuZCB0aGlzIGlzXG4gICAgKiAvLyBiZWZvcmUgdGhlIG9ub3BlbiBoYWQgYSBjaGFuY2UgdG8gcmVnaXN0ZXIgaXRzZWxmLlxuICAgICpcbiAgICAqIHNvY2tldC5vbm9wZW4gPSAoKSA9PiB7IC8vIHRoaXMgd291bGQgbmV2ZXIgYmUgY2FsbGVkIH07XG4gICAgKlxuICAgICogLy8gYW5kIHdpdGggdGhlIGRlbGF5IHRoZSBldmVudCBnZXRzIHRyaWdnZXJlZCBoZXJlIGFmdGVyIGFsbCBvZiB0aGUgY2FsbGJhY2tzIGhhdmUgYmVlblxuICAgICogLy8gcmVnaXN0ZXJlZCA6LSlcbiAgICAqL1xuICAgIGRlbGF5KGZ1bmN0aW9uIGRlbGF5Q2FsbGJhY2soKSB7XG4gICAgICBpZiAoc2VydmVyKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBzZXJ2ZXIub3B0aW9ucy52ZXJpZnlDbGllbnQgJiZcbiAgICAgICAgICB0eXBlb2Ygc2VydmVyLm9wdGlvbnMudmVyaWZ5Q2xpZW50ID09PSAnZnVuY3Rpb24nICYmXG4gICAgICAgICAgIXNlcnZlci5vcHRpb25zLnZlcmlmeUNsaWVudCgpXG4gICAgICAgICkge1xuICAgICAgICAgIHRoaXMucmVhZHlTdGF0ZSA9IFdlYlNvY2tldC5DTE9TRUQ7XG5cbiAgICAgICAgICBsb2dnZXIoXG4gICAgICAgICAgICAnZXJyb3InLFxuICAgICAgICAgICAgYFdlYlNvY2tldCBjb25uZWN0aW9uIHRvICcke3RoaXMudXJsfScgZmFpbGVkOiBIVFRQIEF1dGhlbnRpY2F0aW9uIGZhaWxlZDsgbm8gdmFsaWQgY3JlZGVudGlhbHMgYXZhaWxhYmxlYFxuICAgICAgICAgICk7XG5cbiAgICAgICAgICBuZXR3b3JrQnJpZGdlLnJlbW92ZVdlYlNvY2tldCh0aGlzLCB0aGlzLnVybCk7XG4gICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGNyZWF0ZUV2ZW50KHsgdHlwZTogJ2Vycm9yJywgdGFyZ2V0OiB0aGlzIH0pKTtcbiAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoY3JlYXRlQ2xvc2VFdmVudCh7IHR5cGU6ICdjbG9zZScsIHRhcmdldDogdGhpcywgY29kZTogQ0xPU0VfQ09ERVMuQ0xPU0VfTk9STUFMIH0pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnJlYWR5U3RhdGUgPSBXZWJTb2NrZXQuT1BFTjtcbiAgICAgICAgICBzZXJ2ZXIuZGlzcGF0Y2hFdmVudChjcmVhdGVFdmVudCh7IHR5cGU6ICdjb25uZWN0aW9uJyB9KSwgc2VydmVyLCB0aGlzKTtcbiAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoY3JlYXRlRXZlbnQoeyB0eXBlOiAnb3BlbicsIHRhcmdldDogdGhpcyB9KSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucmVhZHlTdGF0ZSA9IFdlYlNvY2tldC5DTE9TRUQ7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChjcmVhdGVFdmVudCh7IHR5cGU6ICdlcnJvcicsIHRhcmdldDogdGhpcyB9KSk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChjcmVhdGVDbG9zZUV2ZW50KHsgdHlwZTogJ2Nsb3NlJywgdGFyZ2V0OiB0aGlzLCBjb2RlOiBDTE9TRV9DT0RFUy5DTE9TRV9OT1JNQUwgfSkpO1xuXG4gICAgICAgIGxvZ2dlcignZXJyb3InLCBgV2ViU29ja2V0IGNvbm5lY3Rpb24gdG8gJyR7dGhpcy51cmx9JyBmYWlsZWRgKTtcbiAgICAgIH1cbiAgICB9LCB0aGlzKTtcbiAgfVxuXG4gIC8qXG4gICogVHJhbnNtaXRzIGRhdGEgdG8gdGhlIHNlcnZlciBvdmVyIHRoZSBXZWJTb2NrZXQgY29ubmVjdGlvbi5cbiAgKlxuICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9XZWJTb2NrZXQjc2VuZCgpXG4gICovXG4gIHNlbmQoZGF0YSkge1xuICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5DTE9TSU5HIHx8IHRoaXMucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0LkNMT1NFRCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdXZWJTb2NrZXQgaXMgYWxyZWFkeSBpbiBDTE9TSU5HIG9yIENMT1NFRCBzdGF0ZScpO1xuICAgIH1cblxuICAgIGNvbnN0IG1lc3NhZ2VFdmVudCA9IGNyZWF0ZU1lc3NhZ2VFdmVudCh7XG4gICAgICB0eXBlOiAnbWVzc2FnZScsXG4gICAgICBvcmlnaW46IHRoaXMudXJsLFxuICAgICAgZGF0YVxuICAgIH0pO1xuXG4gICAgY29uc3Qgc2VydmVyID0gbmV0d29ya0JyaWRnZS5zZXJ2ZXJMb29rdXAodGhpcy51cmwpO1xuXG4gICAgaWYgKHNlcnZlcikge1xuICAgICAgc2VydmVyLmRpc3BhdGNoRXZlbnQobWVzc2FnZUV2ZW50LCBkYXRhKTtcbiAgICB9XG4gIH1cblxuICAvKlxuICAqIENsb3NlcyB0aGUgV2ViU29ja2V0IGNvbm5lY3Rpb24gb3IgY29ubmVjdGlvbiBhdHRlbXB0LCBpZiBhbnkuXG4gICogSWYgdGhlIGNvbm5lY3Rpb24gaXMgYWxyZWFkeSBDTE9TRUQsIHRoaXMgbWV0aG9kIGRvZXMgbm90aGluZy5cbiAgKlxuICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9XZWJTb2NrZXQjY2xvc2UoKVxuICAqL1xuICBjbG9zZSgpIHtcbiAgICBpZiAodGhpcy5yZWFkeVN0YXRlICE9PSBXZWJTb2NrZXQuT1BFTikge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjb25zdCBzZXJ2ZXIgPSBuZXR3b3JrQnJpZGdlLnNlcnZlckxvb2t1cCh0aGlzLnVybCk7XG4gICAgY29uc3QgY2xvc2VFdmVudCA9IGNyZWF0ZUNsb3NlRXZlbnQoe1xuICAgICAgdHlwZTogJ2Nsb3NlJyxcbiAgICAgIHRhcmdldDogdGhpcyxcbiAgICAgIGNvZGU6IENMT1NFX0NPREVTLkNMT1NFX05PUk1BTFxuICAgIH0pO1xuXG4gICAgbmV0d29ya0JyaWRnZS5yZW1vdmVXZWJTb2NrZXQodGhpcywgdGhpcy51cmwpO1xuXG4gICAgdGhpcy5yZWFkeVN0YXRlID0gV2ViU29ja2V0LkNMT1NFRDtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoY2xvc2VFdmVudCk7XG5cbiAgICBpZiAoc2VydmVyKSB7XG4gICAgICBzZXJ2ZXIuZGlzcGF0Y2hFdmVudChjbG9zZUV2ZW50LCBzZXJ2ZXIpO1xuICAgIH1cbiAgfVxufVxuXG5XZWJTb2NrZXQuQ09OTkVDVElORyA9IDA7XG5XZWJTb2NrZXQuT1BFTiA9IDE7XG5XZWJTb2NrZXQuQ0xPU0lORyA9IDI7XG5XZWJTb2NrZXQuQ0xPU0VEID0gMztcblxuZXhwb3J0IGRlZmF1bHQgV2ViU29ja2V0O1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmV0cmlldmVHbG9iYWxPYmplY3QoKSB7XG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiB3aW5kb3c7XG4gIH1cblxuICByZXR1cm4gdHlwZW9mIHByb2Nlc3MgPT09ICdvYmplY3QnICYmIHR5cGVvZiByZXF1aXJlID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBnbG9iYWwgPT09ICdvYmplY3QnID8gZ2xvYmFsIDogdGhpcztcbn1cbiIsImltcG9ydCBXZWJTb2NrZXQgZnJvbSAnLi93ZWJzb2NrZXQnO1xuaW1wb3J0IEV2ZW50VGFyZ2V0IGZyb20gJy4vZXZlbnQtdGFyZ2V0JztcbmltcG9ydCBuZXR3b3JrQnJpZGdlIGZyb20gJy4vbmV0d29yay1icmlkZ2UnO1xuaW1wb3J0IENMT1NFX0NPREVTIGZyb20gJy4vaGVscGVycy9jbG9zZS1jb2Rlcyc7XG5pbXBvcnQgbm9ybWFsaXplIGZyb20gJy4vaGVscGVycy9ub3JtYWxpemUtdXJsJztcbmltcG9ydCBnbG9iYWxPYmplY3QgZnJvbSAnLi9oZWxwZXJzL2dsb2JhbC1vYmplY3QnO1xuaW1wb3J0IHsgY3JlYXRlRXZlbnQsIGNyZWF0ZU1lc3NhZ2VFdmVudCwgY3JlYXRlQ2xvc2VFdmVudCB9IGZyb20gJy4vZXZlbnQtZmFjdG9yeSc7XG5cbi8qXG4qIGh0dHBzOi8vZ2l0aHViLmNvbS93ZWJzb2NrZXRzL3dzI3NlcnZlci1leGFtcGxlXG4qL1xuY2xhc3MgU2VydmVyIGV4dGVuZHMgRXZlbnRUYXJnZXQge1xuICAvKlxuICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgKi9cbiAgY29uc3RydWN0b3IodXJsLCBvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMudXJsID0gbm9ybWFsaXplKHVybCk7XG4gICAgdGhpcy5vcmlnaW5hbFdlYlNvY2tldCA9IG51bGw7XG4gICAgY29uc3Qgc2VydmVyID0gbmV0d29ya0JyaWRnZS5hdHRhY2hTZXJ2ZXIodGhpcywgdGhpcy51cmwpO1xuXG4gICAgaWYgKCFzZXJ2ZXIpIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChjcmVhdGVFdmVudCh7IHR5cGU6ICdlcnJvcicgfSkpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIG1vY2sgc2VydmVyIGlzIGFscmVhZHkgbGlzdGVuaW5nIG9uIHRoaXMgdXJsJyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLnZlcmlmaXlDbGllbnQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBvcHRpb25zLnZlcmlmaXlDbGllbnQgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICB0aGlzLnN0YXJ0KCk7XG4gIH1cblxuICAvKlxuICAqIEF0dGFjaGVzIHRoZSBtb2NrIHdlYnNvY2tldCBvYmplY3QgdG8gdGhlIGdsb2JhbCBvYmplY3RcbiAgKi9cbiAgc3RhcnQoKSB7XG4gICAgY29uc3QgZ2xvYmFsT2JqID0gZ2xvYmFsT2JqZWN0KCk7XG5cbiAgICBpZiAoZ2xvYmFsT2JqLldlYlNvY2tldCkge1xuICAgICAgdGhpcy5vcmlnaW5hbFdlYlNvY2tldCA9IGdsb2JhbE9iai5XZWJTb2NrZXQ7XG4gICAgfVxuXG4gICAgZ2xvYmFsT2JqLldlYlNvY2tldCA9IFdlYlNvY2tldDtcbiAgfVxuXG4gIC8qXG4gICogUmVtb3ZlcyB0aGUgbW9jayB3ZWJzb2NrZXQgb2JqZWN0IGZyb20gdGhlIGdsb2JhbCBvYmplY3RcbiAgKi9cbiAgc3RvcChjYWxsYmFjayA9ICgpID0+IHt9KSB7XG4gICAgY29uc3QgZ2xvYmFsT2JqID0gZ2xvYmFsT2JqZWN0KCk7XG5cbiAgICBpZiAodGhpcy5vcmlnaW5hbFdlYlNvY2tldCkge1xuICAgICAgZ2xvYmFsT2JqLldlYlNvY2tldCA9IHRoaXMub3JpZ2luYWxXZWJTb2NrZXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSBnbG9iYWxPYmouV2ViU29ja2V0O1xuICAgIH1cblxuICAgIHRoaXMub3JpZ2luYWxXZWJTb2NrZXQgPSBudWxsO1xuXG4gICAgbmV0d29ya0JyaWRnZS5yZW1vdmVTZXJ2ZXIodGhpcy51cmwpO1xuXG4gICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG4gIH1cblxuICAvKlxuICAqIFRoaXMgaXMgdGhlIG1haW4gZnVuY3Rpb24gZm9yIHRoZSBtb2NrIHNlcnZlciB0byBzdWJzY3JpYmUgdG8gdGhlIG9uIGV2ZW50cy5cbiAgKlxuICAqIGllOiBtb2NrU2VydmVyLm9uKCdjb25uZWN0aW9uJywgZnVuY3Rpb24oKSB7IGNvbnNvbGUubG9nKCdhIG1vY2sgY2xpZW50IGNvbm5lY3RlZCcpOyB9KTtcbiAgKlxuICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gVGhlIGV2ZW50IGtleSB0byBzdWJzY3JpYmUgdG8uIFZhbGlkIGtleXMgYXJlOiBjb25uZWN0aW9uLCBtZXNzYWdlLCBhbmQgY2xvc2UuXG4gICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSBUaGUgY2FsbGJhY2sgd2hpY2ggc2hvdWxkIGJlIGNhbGxlZCB3aGVuIGEgY2VydGFpbiBldmVudCBpcyBmaXJlZC5cbiAgKi9cbiAgb24odHlwZSwgY2FsbGJhY2spIHtcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spO1xuICB9XG5cbiAgLypcbiAgKiBUaGlzIHNlbmQgZnVuY3Rpb24gd2lsbCBub3RpZnkgYWxsIG1vY2sgY2xpZW50cyB2aWEgdGhlaXIgb25tZXNzYWdlIGNhbGxiYWNrcyB0aGF0IHRoZSBzZXJ2ZXJcbiAgKiBoYXMgYSBtZXNzYWdlIGZvciB0aGVtLlxuICAqXG4gICogQHBhcmFtIHsqfSBkYXRhIC0gQW55IGphdmFzY3JpcHQgb2JqZWN0IHdoaWNoIHdpbGwgYmUgY3JhZnRlZCBpbnRvIGEgTWVzc2FnZU9iamVjdC5cbiAgKi9cbiAgc2VuZChkYXRhLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLmVtaXQoJ21lc3NhZ2UnLCBkYXRhLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qXG4gICogU2VuZHMgYSBnZW5lcmljIG1lc3NhZ2UgZXZlbnQgdG8gYWxsIG1vY2sgY2xpZW50cy5cbiAgKi9cbiAgZW1pdChldmVudCwgZGF0YSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IHsgd2Vic29ja2V0cyB9ID0gb3B0aW9ucztcblxuICAgIGlmICghd2Vic29ja2V0cykge1xuICAgICAgd2Vic29ja2V0cyA9IG5ldHdvcmtCcmlkZ2Uud2Vic29ja2V0c0xvb2t1cCh0aGlzLnVybCk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0JyB8fCBhcmd1bWVudHMubGVuZ3RoID4gMykge1xuICAgICAgZGF0YSA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSwgYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgd2Vic29ja2V0cy5mb3JFYWNoKHNvY2tldCA9PiB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgICAgICBzb2NrZXQuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICBjcmVhdGVNZXNzYWdlRXZlbnQoe1xuICAgICAgICAgICAgdHlwZTogZXZlbnQsXG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgb3JpZ2luOiB0aGlzLnVybCxcbiAgICAgICAgICAgIHRhcmdldDogc29ja2V0XG4gICAgICAgICAgfSksXG4gICAgICAgICAgLi4uZGF0YVxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc29ja2V0LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgY3JlYXRlTWVzc2FnZUV2ZW50KHtcbiAgICAgICAgICAgIHR5cGU6IGV2ZW50LFxuICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgIG9yaWdpbjogdGhpcy51cmwsXG4gICAgICAgICAgICB0YXJnZXQ6IHNvY2tldFxuICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKlxuICAqIENsb3NlcyB0aGUgY29ubmVjdGlvbiBhbmQgdHJpZ2dlcnMgdGhlIG9uY2xvc2UgbWV0aG9kIG9mIGFsbCBsaXN0ZW5pbmdcbiAgKiB3ZWJzb2NrZXRzLiBBZnRlciB0aGF0IGl0IHJlbW92ZXMgaXRzZWxmIGZyb20gdGhlIHVybE1hcCBzbyBhbm90aGVyIHNlcnZlclxuICAqIGNvdWxkIGFkZCBpdHNlbGYgdG8gdGhlIHVybC5cbiAgKlxuICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gICovXG4gIGNsb3NlKG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHsgY29kZSwgcmVhc29uLCB3YXNDbGVhbiB9ID0gb3B0aW9ucztcbiAgICBjb25zdCBsaXN0ZW5lcnMgPSBuZXR3b3JrQnJpZGdlLndlYnNvY2tldHNMb29rdXAodGhpcy51cmwpO1xuXG4gICAgbGlzdGVuZXJzLmZvckVhY2goc29ja2V0ID0+IHtcbiAgICAgIHNvY2tldC5yZWFkeVN0YXRlID0gV2ViU29ja2V0LkNMT1NFO1xuICAgICAgc29ja2V0LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIGNyZWF0ZUNsb3NlRXZlbnQoe1xuICAgICAgICAgIHR5cGU6ICdjbG9zZScsXG4gICAgICAgICAgdGFyZ2V0OiBzb2NrZXQsXG4gICAgICAgICAgY29kZTogY29kZSB8fCBDTE9TRV9DT0RFUy5DTE9TRV9OT1JNQUwsXG4gICAgICAgICAgcmVhc29uOiByZWFzb24gfHwgJycsXG4gICAgICAgICAgd2FzQ2xlYW5cbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoY3JlYXRlQ2xvc2VFdmVudCh7IHR5cGU6ICdjbG9zZScgfSksIHRoaXMpO1xuICAgIG5ldHdvcmtCcmlkZ2UucmVtb3ZlU2VydmVyKHRoaXMudXJsKTtcbiAgfVxuXG4gIC8qXG4gICogUmV0dXJucyBhbiBhcnJheSBvZiB3ZWJzb2NrZXRzIHdoaWNoIGFyZSBsaXN0ZW5pbmcgdG8gdGhpcyBzZXJ2ZXJcbiAgKi9cbiAgY2xpZW50cygpIHtcbiAgICByZXR1cm4gbmV0d29ya0JyaWRnZS53ZWJzb2NrZXRzTG9va3VwKHRoaXMudXJsKTtcbiAgfVxuXG4gIC8qXG4gICogUHJlcGFyZXMgYSBtZXRob2QgdG8gc3VibWl0IGFuIGV2ZW50IHRvIG1lbWJlcnMgb2YgdGhlIHJvb21cbiAgKlxuICAqIGUuZy4gc2VydmVyLnRvKCdteS1yb29tJykuZW1pdCgnaGkhJyk7XG4gICovXG4gIHRvKHJvb20sIGJyb2FkY2FzdGVyKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgY29uc3Qgd2Vic29ja2V0cyA9IG5ldHdvcmtCcmlkZ2Uud2Vic29ja2V0c0xvb2t1cCh0aGlzLnVybCwgcm9vbSwgYnJvYWRjYXN0ZXIpO1xuICAgIHJldHVybiB7XG4gICAgICBlbWl0KGV2ZW50LCBkYXRhKSB7XG4gICAgICAgIHNlbGYuZW1pdChldmVudCwgZGF0YSwgeyB3ZWJzb2NrZXRzIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKlxuICAgKiBBbGlhcyBmb3IgU2VydmVyLnRvXG4gICAqL1xuICBpbiguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMudG8uYXBwbHkobnVsbCwgYXJncyk7XG4gIH1cbn1cblxuLypcbiAqIEFsdGVybmF0aXZlIGNvbnN0cnVjdG9yIHRvIHN1cHBvcnQgbmFtZXNwYWNlcyBpbiBzb2NrZXQuaW9cbiAqXG4gKiBodHRwOi8vc29ja2V0LmlvL2RvY3Mvcm9vbXMtYW5kLW5hbWVzcGFjZXMvI2N1c3RvbS1uYW1lc3BhY2VzXG4gKi9cblNlcnZlci5vZiA9IGZ1bmN0aW9uIG9mKHVybCkge1xuICByZXR1cm4gbmV3IFNlcnZlcih1cmwpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgU2VydmVyO1xuIiwiaW1wb3J0IGRlbGF5IGZyb20gJy4vaGVscGVycy9kZWxheSc7XG5pbXBvcnQgRXZlbnRUYXJnZXQgZnJvbSAnLi9ldmVudC10YXJnZXQnO1xuaW1wb3J0IG5ldHdvcmtCcmlkZ2UgZnJvbSAnLi9uZXR3b3JrLWJyaWRnZSc7XG5pbXBvcnQgQ0xPU0VfQ09ERVMgZnJvbSAnLi9oZWxwZXJzL2Nsb3NlLWNvZGVzJztcbmltcG9ydCBub3JtYWxpemUgZnJvbSAnLi9oZWxwZXJzL25vcm1hbGl6ZS11cmwnO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuL2hlbHBlcnMvbG9nZ2VyJztcbmltcG9ydCB7IGNyZWF0ZUV2ZW50LCBjcmVhdGVNZXNzYWdlRXZlbnQsIGNyZWF0ZUNsb3NlRXZlbnQgfSBmcm9tICcuL2V2ZW50LWZhY3RvcnknO1xuXG4vKlxuKiBUaGUgc29ja2V0LWlvIGNsYXNzIGlzIGRlc2lnbmVkIHRvIG1pbWljayB0aGUgcmVhbCBBUEkgYXMgY2xvc2VseSBhcyBwb3NzaWJsZS5cbipcbiogaHR0cDovL3NvY2tldC5pby9kb2NzL1xuKi9cbmNsYXNzIFNvY2tldElPIGV4dGVuZHMgRXZlbnRUYXJnZXQge1xuICAvKlxuICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgKi9cbiAgY29uc3RydWN0b3IodXJsID0gJ3NvY2tldC5pbycsIHByb3RvY29sID0gJycpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5iaW5hcnlUeXBlID0gJ2Jsb2InO1xuICAgIHRoaXMudXJsID0gbm9ybWFsaXplKHVybCk7XG4gICAgdGhpcy5yZWFkeVN0YXRlID0gU29ja2V0SU8uQ09OTkVDVElORztcbiAgICB0aGlzLnByb3RvY29sID0gJyc7XG5cbiAgICBpZiAodHlwZW9mIHByb3RvY29sID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5wcm90b2NvbCA9IHByb3RvY29sO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShwcm90b2NvbCkgJiYgcHJvdG9jb2wubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5wcm90b2NvbCA9IHByb3RvY29sWzBdO1xuICAgIH1cblxuICAgIGNvbnN0IHNlcnZlciA9IG5ldHdvcmtCcmlkZ2UuYXR0YWNoV2ViU29ja2V0KHRoaXMsIHRoaXMudXJsKTtcblxuICAgIC8qXG4gICAgKiBEZWxheSB0cmlnZ2VyaW5nIHRoZSBjb25uZWN0aW9uIGV2ZW50cyBzbyB0aGV5IGNhbiBiZSBkZWZpbmVkIGluIHRpbWUuXG4gICAgKi9cbiAgICBkZWxheShmdW5jdGlvbiBkZWxheUNhbGxiYWNrKCkge1xuICAgICAgaWYgKHNlcnZlcikge1xuICAgICAgICB0aGlzLnJlYWR5U3RhdGUgPSBTb2NrZXRJTy5PUEVOO1xuICAgICAgICBzZXJ2ZXIuZGlzcGF0Y2hFdmVudChjcmVhdGVFdmVudCh7IHR5cGU6ICdjb25uZWN0aW9uJyB9KSwgc2VydmVyLCB0aGlzKTtcbiAgICAgICAgc2VydmVyLmRpc3BhdGNoRXZlbnQoY3JlYXRlRXZlbnQoeyB0eXBlOiAnY29ubmVjdCcgfSksIHNlcnZlciwgdGhpcyk7IC8vIGFsaWFzXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChjcmVhdGVFdmVudCh7IHR5cGU6ICdjb25uZWN0JywgdGFyZ2V0OiB0aGlzIH0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucmVhZHlTdGF0ZSA9IFNvY2tldElPLkNMT1NFRDtcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGNyZWF0ZUV2ZW50KHsgdHlwZTogJ2Vycm9yJywgdGFyZ2V0OiB0aGlzIH0pKTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgIGNyZWF0ZUNsb3NlRXZlbnQoe1xuICAgICAgICAgICAgdHlwZTogJ2Nsb3NlJyxcbiAgICAgICAgICAgIHRhcmdldDogdGhpcyxcbiAgICAgICAgICAgIGNvZGU6IENMT1NFX0NPREVTLkNMT1NFX05PUk1BTFxuICAgICAgICAgIH0pXG4gICAgICAgICk7XG5cbiAgICAgICAgbG9nZ2VyKCdlcnJvcicsIGBTb2NrZXQuaW8gY29ubmVjdGlvbiB0byAnJHt0aGlzLnVybH0nIGZhaWxlZGApO1xuICAgICAgfVxuICAgIH0sIHRoaXMpO1xuXG4gICAgLyoqXG4gICAgICBBZGQgYW4gYWxpYXNlZCBldmVudCBsaXN0ZW5lciBmb3IgY2xvc2UgLyBkaXNjb25uZWN0XG4gICAgICovXG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsIGV2ZW50ID0+IHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgY3JlYXRlQ2xvc2VFdmVudCh7XG4gICAgICAgICAgdHlwZTogJ2Rpc2Nvbm5lY3QnLFxuICAgICAgICAgIHRhcmdldDogZXZlbnQudGFyZ2V0LFxuICAgICAgICAgIGNvZGU6IGV2ZW50LmNvZGVcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICAvKlxuICAqIENsb3NlcyB0aGUgU29ja2V0SU8gY29ubmVjdGlvbiBvciBjb25uZWN0aW9uIGF0dGVtcHQsIGlmIGFueS5cbiAgKiBJZiB0aGUgY29ubmVjdGlvbiBpcyBhbHJlYWR5IENMT1NFRCwgdGhpcyBtZXRob2QgZG9lcyBub3RoaW5nLlxuICAqL1xuICBjbG9zZSgpIHtcbiAgICBpZiAodGhpcy5yZWFkeVN0YXRlICE9PSBTb2NrZXRJTy5PUEVOKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNvbnN0IHNlcnZlciA9IG5ldHdvcmtCcmlkZ2Uuc2VydmVyTG9va3VwKHRoaXMudXJsKTtcbiAgICBuZXR3b3JrQnJpZGdlLnJlbW92ZVdlYlNvY2tldCh0aGlzLCB0aGlzLnVybCk7XG5cbiAgICB0aGlzLnJlYWR5U3RhdGUgPSBTb2NrZXRJTy5DTE9TRUQ7XG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KFxuICAgICAgY3JlYXRlQ2xvc2VFdmVudCh7XG4gICAgICAgIHR5cGU6ICdjbG9zZScsXG4gICAgICAgIHRhcmdldDogdGhpcyxcbiAgICAgICAgY29kZTogQ0xPU0VfQ09ERVMuQ0xPU0VfTk9STUFMXG4gICAgICB9KVxuICAgICk7XG5cbiAgICBpZiAoc2VydmVyKSB7XG4gICAgICBzZXJ2ZXIuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgY3JlYXRlQ2xvc2VFdmVudCh7XG4gICAgICAgICAgdHlwZTogJ2Rpc2Nvbm5lY3QnLFxuICAgICAgICAgIHRhcmdldDogdGhpcyxcbiAgICAgICAgICBjb2RlOiBDTE9TRV9DT0RFUy5DTE9TRV9OT1JNQUxcbiAgICAgICAgfSksXG4gICAgICAgIHNlcnZlclxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKlxuICAqIEFsaWFzIGZvciBTb2NrZXQjY2xvc2VcbiAgKlxuICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9zb2NrZXRpby9zb2NrZXQuaW8tY2xpZW50L2Jsb2IvbWFzdGVyL2xpYi9zb2NrZXQuanMjTDM4M1xuICAqL1xuICBkaXNjb25uZWN0KCkge1xuICAgIHRoaXMuY2xvc2UoKTtcbiAgfVxuXG4gIC8qXG4gICogU3VibWl0cyBhbiBldmVudCB0byB0aGUgc2VydmVyIHdpdGggYSBwYXlsb2FkXG4gICovXG4gIGVtaXQoZXZlbnQsIC4uLmRhdGEpIHtcbiAgICBpZiAodGhpcy5yZWFkeVN0YXRlICE9PSBTb2NrZXRJTy5PUEVOKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NvY2tldElPIGlzIGFscmVhZHkgaW4gQ0xPU0lORyBvciBDTE9TRUQgc3RhdGUnKTtcbiAgICB9XG5cbiAgICBjb25zdCBtZXNzYWdlRXZlbnQgPSBjcmVhdGVNZXNzYWdlRXZlbnQoe1xuICAgICAgdHlwZTogZXZlbnQsXG4gICAgICBvcmlnaW46IHRoaXMudXJsLFxuICAgICAgZGF0YVxuICAgIH0pO1xuXG4gICAgY29uc3Qgc2VydmVyID0gbmV0d29ya0JyaWRnZS5zZXJ2ZXJMb29rdXAodGhpcy51cmwpO1xuXG4gICAgaWYgKHNlcnZlcikge1xuICAgICAgc2VydmVyLmRpc3BhdGNoRXZlbnQobWVzc2FnZUV2ZW50LCAuLi5kYXRhKTtcbiAgICB9XG4gIH1cblxuICAvKlxuICAqIFN1Ym1pdHMgYSAnbWVzc2FnZScgZXZlbnQgdG8gdGhlIHNlcnZlci5cbiAgKlxuICAqIFNob3VsZCBiZWhhdmUgZXhhY3RseSBsaWtlIFdlYlNvY2tldCNzZW5kXG4gICpcbiAgKiBodHRwczovL2dpdGh1Yi5jb20vc29ja2V0aW8vc29ja2V0LmlvLWNsaWVudC9ibG9iL21hc3Rlci9saWIvc29ja2V0LmpzI0wxMTNcbiAgKi9cbiAgc2VuZChkYXRhKSB7XG4gICAgdGhpcy5lbWl0KCdtZXNzYWdlJywgZGF0YSk7XG4gIH1cblxuICAvKlxuICAqIEZvciBicm9hZGNhc3RpbmcgZXZlbnRzIHRvIG90aGVyIGNvbm5lY3RlZCBzb2NrZXRzLlxuICAqXG4gICogZS5nLiBzb2NrZXQuYnJvYWRjYXN0LmVtaXQoJ2hpIScpO1xuICAqIGUuZy4gc29ja2V0LmJyb2FkY2FzdC50bygnbXktcm9vbScpLmVtaXQoJ2hpIScpO1xuICAqL1xuICBnZXQgYnJvYWRjYXN0KCkge1xuICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgIT09IFNvY2tldElPLk9QRU4pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignU29ja2V0SU8gaXMgYWxyZWFkeSBpbiBDTE9TSU5HIG9yIENMT1NFRCBzdGF0ZScpO1xuICAgIH1cblxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGNvbnN0IHNlcnZlciA9IG5ldHdvcmtCcmlkZ2Uuc2VydmVyTG9va3VwKHRoaXMudXJsKTtcbiAgICBpZiAoIXNlcnZlcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBTb2NrZXRJTyBjYW4gbm90IGZpbmQgYSBzZXJ2ZXIgYXQgdGhlIHNwZWNpZmllZCBVUkwgKCR7dGhpcy51cmx9KWApO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBlbWl0KGV2ZW50LCBkYXRhKSB7XG4gICAgICAgIHNlcnZlci5lbWl0KGV2ZW50LCBkYXRhLCB7IHdlYnNvY2tldHM6IG5ldHdvcmtCcmlkZ2Uud2Vic29ja2V0c0xvb2t1cChzZWxmLnVybCwgbnVsbCwgc2VsZikgfSk7XG4gICAgICB9LFxuICAgICAgdG8ocm9vbSkge1xuICAgICAgICByZXR1cm4gc2VydmVyLnRvKHJvb20sIHNlbGYpO1xuICAgICAgfSxcbiAgICAgIGluKHJvb20pIHtcbiAgICAgICAgcmV0dXJuIHNlcnZlci5pbihyb29tLCBzZWxmKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLypcbiAgKiBGb3IgcmVnaXN0ZXJpbmcgZXZlbnRzIHRvIGJlIHJlY2VpdmVkIGZyb20gdGhlIHNlcnZlclxuICAqL1xuICBvbih0eXBlLCBjYWxsYmFjaykge1xuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjayk7XG4gIH1cblxuICAvKlxuICAgKiBKb2luIGEgcm9vbSBvbiBhIHNlcnZlclxuICAgKlxuICAgKiBodHRwOi8vc29ja2V0LmlvL2RvY3Mvcm9vbXMtYW5kLW5hbWVzcGFjZXMvI2pvaW5pbmctYW5kLWxlYXZpbmdcbiAgICovXG4gIGpvaW4ocm9vbSkge1xuICAgIG5ldHdvcmtCcmlkZ2UuYWRkTWVtYmVyc2hpcFRvUm9vbSh0aGlzLCByb29tKTtcbiAgfVxuXG4gIC8qXG4gICAqIEdldCB0aGUgd2Vic29ja2V0IHRvIGxlYXZlIHRoZSByb29tXG4gICAqXG4gICAqIGh0dHA6Ly9zb2NrZXQuaW8vZG9jcy9yb29tcy1hbmQtbmFtZXNwYWNlcy8jam9pbmluZy1hbmQtbGVhdmluZ1xuICAgKi9cbiAgbGVhdmUocm9vbSkge1xuICAgIG5ldHdvcmtCcmlkZ2UucmVtb3ZlTWVtYmVyc2hpcEZyb21Sb29tKHRoaXMsIHJvb20pO1xuICB9XG5cbiAgLypcbiAgICogSW52b2tlcyBhbGwgbGlzdGVuZXIgZnVuY3Rpb25zIHRoYXQgYXJlIGxpc3RlbmluZyB0byB0aGUgZ2l2ZW4gZXZlbnQudHlwZSBwcm9wZXJ0eS4gRWFjaFxuICAgKiBsaXN0ZW5lciB3aWxsIGJlIHBhc3NlZCB0aGUgZXZlbnQgYXMgdGhlIGZpcnN0IGFyZ3VtZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gZXZlbnQgLSBldmVudCBvYmplY3Qgd2hpY2ggd2lsbCBiZSBwYXNzZWQgdG8gYWxsIGxpc3RlbmVycyBvZiB0aGUgZXZlbnQudHlwZSBwcm9wZXJ0eVxuICAgKi9cbiAgZGlzcGF0Y2hFdmVudChldmVudCwgLi4uY3VzdG9tQXJndW1lbnRzKSB7XG4gICAgY29uc3QgZXZlbnROYW1lID0gZXZlbnQudHlwZTtcbiAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVyc1tldmVudE5hbWVdO1xuXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGxpc3RlbmVycykpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBsaXN0ZW5lcnMuZm9yRWFjaChsaXN0ZW5lciA9PiB7XG4gICAgICBpZiAoY3VzdG9tQXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgY3VzdG9tQXJndW1lbnRzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFJlZ3VsYXIgV2ViU29ja2V0cyBleHBlY3QgYSBNZXNzYWdlRXZlbnQgYnV0IFNvY2tldGlvLmlvIGp1c3Qgd2FudHMgcmF3IGRhdGFcbiAgICAgICAgLy8gIHBheWxvYWQgaW5zdGFuY2VvZiBNZXNzYWdlRXZlbnQgd29ya3MsIGJ1dCB5b3UgY2FuJ3QgaXNudGFuY2Ugb2YgTm9kZUV2ZW50XG4gICAgICAgIC8vICBmb3Igbm93IHdlIGRldGVjdCBpZiB0aGUgb3V0cHV0IGhhcyBkYXRhIGRlZmluZWQgb24gaXRcbiAgICAgICAgbGlzdGVuZXIuY2FsbCh0aGlzLCBldmVudC5kYXRhID8gZXZlbnQuZGF0YSA6IGV2ZW50KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG5Tb2NrZXRJTy5DT05ORUNUSU5HID0gMDtcblNvY2tldElPLk9QRU4gPSAxO1xuU29ja2V0SU8uQ0xPU0lORyA9IDI7XG5Tb2NrZXRJTy5DTE9TRUQgPSAzO1xuXG4vKlxuKiBTdGF0aWMgY29uc3RydWN0b3IgbWV0aG9kcyBmb3IgdGhlIElPIFNvY2tldFxuKi9cbmNvbnN0IElPID0gZnVuY3Rpb24gaW9Db25zdHJ1Y3Rvcih1cmwpIHtcbiAgcmV0dXJuIG5ldyBTb2NrZXRJTyh1cmwpO1xufTtcblxuLypcbiogQWxpYXMgdGhlIHJhdyBJTygpIGNvbnN0cnVjdG9yXG4qL1xuSU8uY29ubmVjdCA9IGZ1bmN0aW9uIGlvQ29ubmVjdCh1cmwpIHtcbiAgLyogZXNsaW50LWRpc2FibGUgbmV3LWNhcCAqL1xuICByZXR1cm4gSU8odXJsKTtcbiAgLyogZXNsaW50LWVuYWJsZSBuZXctY2FwICovXG59O1xuXG5leHBvcnQgZGVmYXVsdCBJTztcbiIsImltcG9ydCBNb2NrU2VydmVyIGZyb20gJy4vc2VydmVyJztcbmltcG9ydCBNb2NrU29ja2V0SU8gZnJvbSAnLi9zb2NrZXQtaW8nO1xuaW1wb3J0IE1vY2tXZWJTb2NrZXQgZnJvbSAnLi93ZWJzb2NrZXQnO1xuXG5leHBvcnQgY29uc3QgU2VydmVyID0gTW9ja1NlcnZlcjtcbmV4cG9ydCBjb25zdCBXZWJTb2NrZXQgPSBNb2NrV2ViU29ja2V0O1xuZXhwb3J0IGNvbnN0IFNvY2tldElPID0gTW9ja1NvY2tldElPO1xuIl0sIm5hbWVzIjpbImNvbnN0IiwidGhpcyIsInN1cGVyIiwiV2ViU29ja2V0Iiwibm9ybWFsaXplIiwibG9nZ2VyIiwiQ0xPU0VfQ09ERVMiLCJTZXJ2ZXIiLCJnbG9iYWxPYmplY3QiLCJTb2NrZXRJTyIsIk1vY2tTZXJ2ZXIiLCJNb2NrV2ViU29ja2V0IiwiTW9ja1NvY2tldElPIl0sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7OztBQVFBLEFBQWUsU0FBUyxLQUFLLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRTtFQUMvQyxVQUFVLENBQUMsVUFBQSxjQUFjLEVBQUMsU0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFBLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0NBQ3pFOztBQ1ZNLFNBQVMsTUFBTSxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUU7RUFDdENBLElBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztFQUNuQixLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUEsV0FBVyxFQUFDO0lBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7TUFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUMzQjtHQUNGLENBQUMsQ0FBQzs7RUFFSCxPQUFPLE9BQU8sQ0FBQztDQUNoQjs7QUFFRCxBQUFPLFNBQVMsTUFBTSxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUU7RUFDdENBLElBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztFQUNuQixLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUEsV0FBVyxFQUFDO0lBQ3hCLElBQUksUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO01BQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDM0I7R0FDRixDQUFDLENBQUM7O0VBRUgsT0FBTyxPQUFPLENBQUM7Q0FDaEI7Ozs7Ozs7O0FDWkQsSUFBTSxXQUFXLEdBQUMsb0JBQ0wsR0FBRztFQUNkLElBQU0sQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0NBQ3JCLENBQUE7Ozs7Ozs7Ozs7QUFVSCxzQkFBRSxnQkFBZ0IsOEJBQUMsSUFBSSxFQUFFLFFBQVEscUJBQXFCO0VBQ3BELElBQU0sT0FBTyxRQUFRLEtBQUssVUFBVSxFQUFFO0lBQ3BDLElBQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRTtNQUMxQyxJQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztLQUMzQjs7O0lBR0gsSUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxVQUFBLElBQUksRUFBQyxTQUFHLElBQUksS0FBSyxRQUFRLEdBQUEsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7TUFDMUUsSUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDckM7R0FDRjtDQUNGLENBQUE7Ozs7Ozs7OztBQVNILHNCQUFFLG1CQUFtQixpQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLHFCQUFxQjtFQUMvRCxJQUFRLGdCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDaEQsSUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsVUFBQSxRQUFRLEVBQUMsU0FBRyxRQUFRLEtBQUssZ0JBQWdCLEdBQUEsQ0FBQyxDQUFDO0NBQzVGLENBQUE7Ozs7Ozs7O0FBUUgsc0JBQUUsYUFBYSwyQkFBQyxLQUFLLEVBQXNCOzs7OztFQUN6QyxJQUFRLFNBQVMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0VBQy9CLElBQVEsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7O0VBRTlDLElBQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFO0lBQy9CLE9BQVMsS0FBSyxDQUFDO0dBQ2Q7O0VBRUgsU0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFBLFFBQVEsRUFBQztJQUMzQixJQUFNLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO01BQ2hDLFFBQVUsQ0FBQyxLQUFLLENBQUNDLE1BQUksRUFBRSxlQUFlLENBQUMsQ0FBQztLQUN2QyxNQUFNO01BQ1AsUUFBVSxDQUFDLElBQUksQ0FBQ0EsTUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQzVCO0dBQ0YsQ0FBQyxDQUFDOztFQUVMLE9BQVMsSUFBSSxDQUFDO0NBQ2IsQ0FBQSxBQUdILEFBQTJCOzs7Ozs7O0FDakUzQixJQUFNLGFBQWEsR0FBQyxzQkFDUCxHQUFHO0VBQ2QsSUFBTSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7Q0FDbEIsQ0FBQTs7Ozs7Ozs7O0FBU0gsd0JBQUUsZUFBZSw2QkFBQyxTQUFTLEVBQUUsR0FBRyxFQUFFO0VBQ2hDLElBQVEsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzs7RUFFNUMsSUFBTSxnQkFBZ0IsSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLElBQUksZ0JBQWdCLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtJQUMxRyxnQkFBa0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzlDLE9BQVMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDO0dBQ2hDO0NBQ0YsQ0FBQTs7Ozs7QUFLSCx3QkFBRSxtQkFBbUIsaUNBQUMsU0FBUyxFQUFFLElBQUksRUFBRTtFQUNyQyxJQUFRLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztFQUV0RCxJQUFNLGdCQUFnQixJQUFJLGdCQUFnQixDQUFDLE1BQU0sSUFBSSxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0lBQzFHLElBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUU7TUFDN0MsZ0JBQWtCLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztLQUM3Qzs7SUFFSCxnQkFBa0IsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0dBQ3hEO0NBQ0YsQ0FBQTs7Ozs7Ozs7O0FBU0gsd0JBQUUsWUFBWSwwQkFBQyxNQUFNLEVBQUUsR0FBRyxFQUFFO0VBQzFCLElBQVEsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzs7RUFFNUMsSUFBTSxDQUFDLGdCQUFnQixFQUFFO0lBQ3ZCLElBQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUc7TUFDbkIsUUFBRSxNQUFNO01BQ1IsVUFBWSxFQUFFLEVBQUU7TUFDaEIsZUFBaUIsRUFBRSxFQUFFO0tBQ3BCLENBQUM7O0lBRUosT0FBUyxNQUFNLENBQUM7R0FDZjtDQUNGLENBQUE7Ozs7Ozs7QUFPSCx3QkFBRSxZQUFZLDBCQUFDLEdBQUcsRUFBRTtFQUNsQixJQUFRLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7O0VBRTVDLElBQU0sZ0JBQWdCLEVBQUU7SUFDdEIsT0FBUyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7R0FDaEM7Q0FDRixDQUFBOzs7Ozs7Ozs7QUFTSCx3QkFBRSxnQkFBZ0IsOEJBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUU7RUFDekMsSUFBTSxVQUFVLENBQUM7RUFDakIsSUFBUSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztFQUU1QyxVQUFZLEdBQUcsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQzs7RUFFbkUsSUFBTSxJQUFJLEVBQUU7SUFDVixJQUFRLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekQsVUFBWSxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7R0FDNUI7O0VBRUgsT0FBUyxXQUFXLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFBLFNBQVMsRUFBQyxTQUFHLFNBQVMsS0FBSyxXQUFXLEdBQUEsQ0FBQyxHQUFHLFVBQVUsQ0FBQztDQUM3RixDQUFBOzs7Ozs7O0FBT0gsd0JBQUUsWUFBWSwwQkFBQyxHQUFHLEVBQUU7RUFDbEIsT0FBUyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ3pCLENBQUE7Ozs7Ozs7O0FBUUgsd0JBQUUsZUFBZSw2QkFBQyxTQUFTLEVBQUUsR0FBRyxFQUFFO0VBQ2hDLElBQVEsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzs7RUFFNUMsSUFBTSxnQkFBZ0IsRUFBRTtJQUN0QixnQkFBa0IsQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxVQUFBLE1BQU0sRUFBQyxTQUFHLE1BQU0sS0FBSyxTQUFTLEdBQUEsQ0FBQyxDQUFDO0dBQ25HO0NBQ0YsQ0FBQTs7Ozs7QUFLSCx3QkFBRSx3QkFBd0Isc0NBQUMsU0FBUyxFQUFFLElBQUksRUFBRTtFQUMxQyxJQUFRLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ3RELElBQVEsV0FBVyxHQUFHLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7RUFFN0QsSUFBTSxnQkFBZ0IsSUFBSSxXQUFXLEtBQUssSUFBSSxFQUFFO0lBQzlDLGdCQUFrQixDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsV0FBVyxFQUFFLFVBQUEsTUFBTSxFQUFDLFNBQUcsTUFBTSxLQUFLLFNBQVMsR0FBQSxDQUFDLENBQUM7R0FDOUY7Q0FDRixDQUFBOztBQUdILG9CQUFlLElBQUksYUFBYSxFQUFFLENBQUM7O0FDdEluQzs7O0FBR0FELElBQU0sS0FBSyxHQUFHO0VBQ1osWUFBWSxFQUFFLElBQUk7RUFDbEIsZ0JBQWdCLEVBQUUsSUFBSTtFQUN0QixvQkFBb0IsRUFBRSxJQUFJO0VBQzFCLGlCQUFpQixFQUFFLElBQUk7RUFDdkIsZUFBZSxFQUFFLElBQUk7RUFDckIsY0FBYyxFQUFFLElBQUk7RUFDcEIsZUFBZSxFQUFFLElBQUk7Q0FDdEIsQ0FBQyxBQUVGLEFBQXFCOztBQ2JOLFNBQVMsWUFBWSxDQUFDLEdBQUcsRUFBRTtFQUN4Q0EsSUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUMvQixPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFHLEdBQU0sTUFBRSxJQUFJLEdBQUcsQ0FBQztDQUNuRTs7QUNIYyxTQUFTLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFOztFQUUzQyxJQUFJLE9BQU8sT0FBTyxLQUFLLFdBQVcsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsS0FBSyxNQUFNLEVBQUU7SUFDckUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7R0FDckM7O0NBRUY7O0FDTmMsSUFBTSxjQUFjLEdBQUM7O0FBQUEseUJBRWxDLGVBQWUsK0JBQUcsRUFBRSxDQUFBO0FBQ3RCLHlCQUFFLHdCQUF3Qix3Q0FBRyxFQUFFLENBQUE7Ozs7QUFJL0IseUJBQUUsU0FBUyx1QkFBQyxJQUFrQixFQUFFLE9BQWUsRUFBRSxVQUFrQixFQUFFOytCQUFyRCxHQUFHLFdBQVcsQ0FBUztxQ0FBQSxHQUFHLEtBQUssQ0FBWTsyQ0FBQSxHQUFHLEtBQUs7O0VBQ2pFLElBQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQzNCLElBQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0VBQ2xDLElBQU0sQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0NBQ3ZDLENBQUEsQUFDRjs7QUNWRCxJQUFxQixLQUFLO0VBQXdCLGNBQ3JDLENBQUMsSUFBSSxFQUFFLGVBQW9CLEVBQUU7cURBQVAsR0FBRyxFQUFFOztJQUNwQ0UsaUJBQUssS0FBQSxDQUFDLElBQUEsQ0FBQyxDQUFDOztJQUVSLElBQUksQ0FBQyxJQUFJLEVBQUU7TUFDVCxNQUFNLElBQUksU0FBUyxDQUFDLHVFQUF1RSxDQUFDLENBQUM7S0FDOUY7O0lBRUQsSUFBSSxPQUFPLGVBQWUsS0FBSyxRQUFRLEVBQUU7TUFDdkMsTUFBTSxJQUFJLFNBQVMsQ0FBQyw2RUFBNkUsQ0FBQyxDQUFDO0tBQ3BHOztJQUVELElBQVEsT0FBTztJQUFFLElBQUEsVUFBVSw4QkFBckI7O0lBRU4sSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDNUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7SUFDbkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7SUFDdkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7SUFDeEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDcEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQztJQUM5QixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztJQUMxQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQzNELElBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO0lBQzNCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxLQUFLLENBQUM7R0FDbkQ7Ozs7c0NBQUE7OztFQTFCZ0MsY0EyQmxDLEdBQUE7O0FDM0JELElBQXFCLFlBQVk7RUFBd0IscUJBQzVDLENBQUMsSUFBSSxFQUFFLGVBQW9CLEVBQUU7cURBQVAsR0FBRyxFQUFFOztJQUNwQ0EsaUJBQUssS0FBQSxDQUFDLElBQUEsQ0FBQyxDQUFDOztJQUVSLElBQUksQ0FBQyxJQUFJLEVBQUU7TUFDVCxNQUFNLElBQUksU0FBUyxDQUFDLDhFQUE4RSxDQUFDLENBQUM7S0FDckc7O0lBRUQsSUFBSSxPQUFPLGVBQWUsS0FBSyxRQUFRLEVBQUU7TUFDdkMsTUFBTSxJQUFJLFNBQVMsQ0FBQyxvRkFBb0YsQ0FBQyxDQUFDO0tBQzNHOztJQUVELElBQVEsT0FBTztJQUFFLElBQUEsVUFBVTtJQUFFLElBQUEsSUFBSTtJQUFFLElBQUEsTUFBTTtJQUFFLElBQUEsV0FBVztJQUFFLElBQUEsS0FBSyx5QkFBdkQ7O0lBRU4sSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDNUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7SUFDbkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7SUFDdkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7SUFDeEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDcEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQztJQUM5QixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztJQUMxQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQzNELElBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO0lBQzNCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDbEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUMzQyxJQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sS0FBSyxLQUFLLFdBQVcsR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDO0lBQ3pELElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxJQUFJLEtBQUssV0FBVyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUM7SUFDdEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztHQUMzRDs7OztvREFBQTs7O0VBOUJ1QyxjQStCekMsR0FBQTs7QUMvQkQsSUFBcUIsVUFBVTtFQUF3QixtQkFDMUMsQ0FBQyxJQUFJLEVBQUUsZUFBb0IsRUFBRTtxREFBUCxHQUFHLEVBQUU7O0lBQ3BDQSxpQkFBSyxLQUFBLENBQUMsSUFBQSxDQUFDLENBQUM7O0lBRVIsSUFBSSxDQUFDLElBQUksRUFBRTtNQUNULE1BQU0sSUFBSSxTQUFTLENBQUMsNEVBQTRFLENBQUMsQ0FBQztLQUNuRzs7SUFFRCxJQUFJLE9BQU8sZUFBZSxLQUFLLFFBQVEsRUFBRTtNQUN2QyxNQUFNLElBQUksU0FBUyxDQUFDLGtGQUFrRixDQUFDLENBQUM7S0FDekc7O0lBRUQsSUFBUSxPQUFPO0lBQUUsSUFBQSxVQUFVO0lBQUUsSUFBQSxJQUFJO0lBQUUsSUFBQSxNQUFNO0lBQUUsSUFBQSxRQUFRLDRCQUE3Qzs7SUFFTixJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6QixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUM1QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztJQUNuQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztJQUN2QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztJQUN4QixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUN2QixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztJQUNwQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO0lBQzlCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO0lBQzFCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDM0QsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7SUFDM0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUNsRCxJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sSUFBSSxLQUFLLFFBQVEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3hELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDM0MsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEtBQUssQ0FBQztHQUN0RDs7OztnREFBQTs7O0VBN0JxQyxjQThCdkMsR0FBQTs7Ozs7Ozs7QUN0QkQsU0FBUyxXQUFXLENBQUMsTUFBTSxFQUFFO0VBQzNCLElBQVEsSUFBSTtFQUFFLElBQUEsTUFBTSxpQkFBZDtFQUNORixJQUFNLFdBQVcsR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQzs7RUFFcEMsSUFBSSxNQUFNLEVBQUU7SUFDVixXQUFXLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUM1QixXQUFXLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztJQUNoQyxXQUFXLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQztHQUNwQzs7RUFFRCxPQUFPLFdBQVcsQ0FBQztDQUNwQjs7Ozs7Ozs7QUFRRCxTQUFTLGtCQUFrQixDQUFDLE1BQU0sRUFBRTtFQUNsQyxJQUFRLElBQUk7RUFBRSxJQUFBLE1BQU07RUFBRSxJQUFBLElBQUk7RUFBRSxJQUFBLE1BQU0saUJBQTVCO0VBQ05BLElBQU0sWUFBWSxHQUFHLElBQUksWUFBWSxDQUFDLElBQUksRUFBRTtJQUMxQyxNQUFBLElBQUk7SUFDSixRQUFBLE1BQU07R0FDUCxDQUFDLENBQUM7O0VBRUgsSUFBSSxNQUFNLEVBQUU7SUFDVixZQUFZLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUM3QixZQUFZLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztJQUNqQyxZQUFZLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQztHQUNyQzs7RUFFRCxPQUFPLFlBQVksQ0FBQztDQUNyQjs7Ozs7Ozs7QUFRRCxTQUFTLGdCQUFnQixDQUFDLE1BQU0sRUFBRTtFQUNoQyxJQUFRLElBQUk7RUFBRSxJQUFBLE1BQU07RUFBRSxJQUFBLElBQUk7RUFBRSxJQUFBLE1BQU0saUJBQTVCO0VBQ04sSUFBTSxRQUFRLG1CQUFWOztFQUVKLElBQUksQ0FBQyxRQUFRLEVBQUU7SUFDYixRQUFRLEdBQUcsSUFBSSxLQUFLLElBQUksQ0FBQztHQUMxQjs7RUFFREEsSUFBTSxVQUFVLEdBQUcsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFO0lBQ3RDLE1BQUEsSUFBSTtJQUNKLFFBQUEsTUFBTTtJQUNOLFVBQUEsUUFBUTtHQUNULENBQUMsQ0FBQzs7RUFFSCxJQUFJLE1BQU0sRUFBRTtJQUNWLFVBQVUsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQzNCLFVBQVUsQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDO0lBQy9CLFVBQVUsQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDO0dBQ25DOztFQUVELE9BQU8sVUFBVSxDQUFDO0NBQ25CLEFBRUQsQUFBNkQ7Ozs7Ozs7O0FDNUQ3RCxJQUFNRyxXQUFTO0VBQXFCLGtCQUl2QixDQUFDLEdBQUcsRUFBRSxRQUFhLEVBQUU7dUNBQVAsR0FBRyxFQUFFOztJQUM1QkQsY0FBSyxLQUFBLENBQUMsSUFBQSxDQUFDLENBQUM7O0lBRVIsSUFBSSxDQUFDLEdBQUcsRUFBRTtNQUNSLE1BQU0sSUFBSSxTQUFTLENBQUMsMkVBQTJFLENBQUMsQ0FBQztLQUNsRzs7SUFFRCxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztJQUN6QixJQUFJLENBQUMsR0FBRyxHQUFHRSxZQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDMUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDO0lBQ3ZDLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDOztJQUVuQixJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsRUFBRTtNQUNoQyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztLQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtNQUN6RCxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM3Qjs7Ozs7Ozs7OztJQVVELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUU7TUFDNUIsTUFBTSxFQUFFO1FBQ04sWUFBWSxFQUFFLElBQUk7UUFDbEIsVUFBVSxFQUFFLElBQUk7UUFDaEIsR0FBRyxjQUFBLEdBQUc7VUFDSixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO1NBQzVCO1FBQ0QsR0FBRyxjQUFBLENBQUMsUUFBUSxFQUFFO1VBQ1osSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztTQUN6QztPQUNGO01BQ0QsU0FBUyxFQUFFO1FBQ1QsWUFBWSxFQUFFLElBQUk7UUFDbEIsVUFBVSxFQUFFLElBQUk7UUFDaEIsR0FBRyxjQUFBLEdBQUc7VUFDSixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDO1NBQy9CO1FBQ0QsR0FBRyxjQUFBLENBQUMsUUFBUSxFQUFFO1VBQ1osSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztTQUM1QztPQUNGO01BQ0QsT0FBTyxFQUFFO1FBQ1AsWUFBWSxFQUFFLElBQUk7UUFDbEIsVUFBVSxFQUFFLElBQUk7UUFDaEIsR0FBRyxjQUFBLEdBQUc7VUFDSixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1NBQzdCO1FBQ0QsR0FBRyxjQUFBLENBQUMsUUFBUSxFQUFFO1VBQ1osSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztTQUMxQztPQUNGO01BQ0QsT0FBTyxFQUFFO1FBQ1AsWUFBWSxFQUFFLElBQUk7UUFDbEIsVUFBVSxFQUFFLElBQUk7UUFDaEIsR0FBRyxjQUFBLEdBQUc7VUFDSixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1NBQzdCO1FBQ0QsR0FBRyxjQUFBLENBQUMsUUFBUSxFQUFFO1VBQ1osSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztTQUMxQztPQUNGO0tBQ0YsQ0FBQyxDQUFDOztJQUVISixJQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7SUFnQjdELEtBQUssQ0FBQyxTQUFTLGFBQWEsR0FBRztNQUM3QixJQUFJLE1BQU0sRUFBRTtRQUNWO1VBQ0UsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZO1VBQzNCLE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEtBQUssVUFBVTtVQUNqRCxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFO1VBQzlCO1VBQ0EsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDOztVQUVuQ0ssR0FBTTtZQUNKLE9BQU87YUFDUCwyQkFBMEIsSUFBRSxJQUFJLENBQUMsR0FBRyxDQUFBLHlFQUFxRTtXQUMxRyxDQUFDOztVQUVGLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztVQUM5QyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztVQUNqRSxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRUMsS0FBVyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztTQUN2RyxNQUFNO1VBQ0wsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO1VBQ2pDLE1BQU0sQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1VBQ3hFLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ2pFO09BQ0YsTUFBTTtRQUNMLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztRQUNuQyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRUEsS0FBVyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQzs7UUFFdEdELEdBQU0sQ0FBQyxPQUFPLEdBQUUsMkJBQTBCLElBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQSxhQUFTLEVBQUUsQ0FBQztPQUNqRTtLQUNGLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDVjs7Ozs4Q0FBQTs7Ozs7OztFQU9ELG9CQUFBLElBQUksa0JBQUMsSUFBSSxFQUFFO0lBQ1QsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLFNBQVMsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxTQUFTLENBQUMsTUFBTSxFQUFFO01BQ2pGLE1BQU0sSUFBSSxLQUFLLENBQUMsaURBQWlELENBQUMsQ0FBQztLQUNwRTs7SUFFREwsSUFBTSxZQUFZLEdBQUcsa0JBQWtCLENBQUM7TUFDdEMsSUFBSSxFQUFFLFNBQVM7TUFDZixNQUFNLEVBQUUsSUFBSSxDQUFDLEdBQUc7TUFDaEIsTUFBQSxJQUFJO0tBQ0wsQ0FBQyxDQUFDOztJQUVIQSxJQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs7SUFFcEQsSUFBSSxNQUFNLEVBQUU7TUFDVixNQUFNLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztLQUMxQztHQUNGLENBQUE7Ozs7Ozs7O0VBUUQsb0JBQUEsS0FBSyxxQkFBRztJQUNOLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxTQUFTLENBQUMsSUFBSSxFQUFFO01BQ3RDLE9BQU8sU0FBUyxDQUFDO0tBQ2xCOztJQUVEQSxJQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwREEsSUFBTSxVQUFVLEdBQUcsZ0JBQWdCLENBQUM7TUFDbEMsSUFBSSxFQUFFLE9BQU87TUFDYixNQUFNLEVBQUUsSUFBSTtNQUNaLElBQUksRUFBRU0sS0FBVyxDQUFDLFlBQVk7S0FDL0IsQ0FBQyxDQUFDOztJQUVILGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs7SUFFOUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO0lBQ25DLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7O0lBRS9CLElBQUksTUFBTSxFQUFFO01BQ1YsTUFBTSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDMUM7R0FDRixDQUFBOzs7RUExS3FCLFdBMkt2QixHQUFBOztBQUVESCxXQUFTLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztBQUN6QkEsV0FBUyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7QUFDbkJBLFdBQVMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0FBQ3RCQSxXQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxBQUVyQixBQUF5Qjs7QUNoTVYsU0FBUyxvQkFBb0IsR0FBRztFQUM3QyxJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVcsRUFBRTtJQUNqQyxPQUFPLE1BQU0sQ0FBQztHQUNmOztFQUVELE9BQU8sT0FBTyxPQUFPLEtBQUssUUFBUSxJQUFJLE9BQU8sT0FBTyxLQUFLLFVBQVUsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQztDQUNuSDs7Ozs7QUNLRCxJQUFNSSxRQUFNO0VBQXFCLGVBSXBCLENBQUMsR0FBRyxFQUFFLE9BQVksRUFBRTtxQ0FBUCxHQUFHLEVBQUU7O0lBQzNCTCxjQUFLLEtBQUEsQ0FBQyxJQUFBLENBQUMsQ0FBQztJQUNSLElBQUksQ0FBQyxHQUFHLEdBQUdFLFlBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMxQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO0lBQzlCSixJQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7O0lBRTFELElBQUksQ0FBQyxNQUFNLEVBQUU7TUFDWCxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7TUFDbkQsTUFBTSxJQUFJLEtBQUssQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO0tBQ25FOztJQUVELElBQUksT0FBTyxPQUFPLENBQUMsYUFBYSxLQUFLLFdBQVcsRUFBRTtNQUNoRCxPQUFPLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztLQUM5Qjs7SUFFRCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQzs7SUFFdkIsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0dBQ2Q7Ozs7d0NBQUE7Ozs7O0VBS0QsaUJBQUEsS0FBSyxxQkFBRztJQUNOQSxJQUFNLFNBQVMsR0FBR1Esb0JBQVksRUFBRSxDQUFDOztJQUVqQyxJQUFJLFNBQVMsQ0FBQyxTQUFTLEVBQUU7TUFDdkIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7S0FDOUM7O0lBRUQsU0FBUyxDQUFDLFNBQVMsR0FBR0wsV0FBUyxDQUFDO0dBQ2pDLENBQUE7Ozs7O0VBS0QsaUJBQUEsSUFBSSxrQkFBQyxRQUFtQixFQUFFO3VDQUFiLEdBQUcsWUFBRyxFQUFLOztJQUN0QkgsSUFBTSxTQUFTLEdBQUdRLG9CQUFZLEVBQUUsQ0FBQzs7SUFFakMsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7TUFDMUIsU0FBUyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUM7S0FDOUMsTUFBTTtNQUNMLE9BQU8sU0FBUyxDQUFDLFNBQVMsQ0FBQztLQUM1Qjs7SUFFRCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDOztJQUU5QixhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs7SUFFckMsSUFBSSxPQUFPLFFBQVEsS0FBSyxVQUFVLEVBQUU7TUFDbEMsUUFBUSxFQUFFLENBQUM7S0FDWjtHQUNGLENBQUE7Ozs7Ozs7Ozs7RUFVRCxpQkFBQSxFQUFFLGdCQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7SUFDakIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztHQUN2QyxDQUFBOzs7Ozs7OztFQVFELGlCQUFBLElBQUksa0JBQUMsSUFBSSxFQUFFLE9BQVksRUFBRTtxQ0FBUCxHQUFHLEVBQUU7O0lBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztHQUNyQyxDQUFBOzs7OztFQUtELGlCQUFBLElBQUksa0JBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxPQUFZLEVBQUU7c0JBQVA7cUNBQUEsR0FBRyxFQUFFOztJQUM1QixJQUFNLFVBQVUsc0JBQVo7O0lBRUosSUFBSSxDQUFDLFVBQVUsRUFBRTtNQUNmLFVBQVUsR0FBRyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3ZEOztJQUVELElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxJQUFJLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO01BQ3ZELElBQUksR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDbkU7O0lBRUQsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFBLE1BQU0sRUFBQztNQUN4QixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDdkIsTUFBTSxDQUFDLGFBQWEsTUFBQTtVQUNsQixVQUFBLGtCQUFrQixDQUFDO1lBQ2pCLElBQUksRUFBRSxLQUFLO1lBQ1gsTUFBQSxJQUFJO1lBQ0osTUFBTSxFQUFFUCxNQUFJLENBQUMsR0FBRztZQUNoQixNQUFNLEVBQUUsTUFBTTtXQUNmLENBQUMsV0FDRixJQUFPLEVBQUE7U0FDUixDQUFDO09BQ0gsTUFBTTtRQUNMLE1BQU0sQ0FBQyxhQUFhO1VBQ2xCLGtCQUFrQixDQUFDO1lBQ2pCLElBQUksRUFBRSxLQUFLO1lBQ1gsTUFBQSxJQUFJO1lBQ0osTUFBTSxFQUFFQSxNQUFJLENBQUMsR0FBRztZQUNoQixNQUFNLEVBQUUsTUFBTTtXQUNmLENBQUM7U0FDSCxDQUFDO09BQ0g7S0FDRixDQUFDLENBQUM7R0FDSixDQUFBOzs7Ozs7Ozs7RUFTRCxpQkFBQSxLQUFLLG1CQUFDLE9BQVksRUFBRTtxQ0FBUCxHQUFHLEVBQUU7O0lBQ2hCLElBQVEsSUFBSTtJQUFFLElBQUEsTUFBTTtJQUFFLElBQUEsUUFBUSxvQkFBeEI7SUFDTkQsSUFBTSxTQUFTLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs7SUFFM0QsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFBLE1BQU0sRUFBQztNQUN2QixNQUFNLENBQUMsVUFBVSxHQUFHRyxXQUFTLENBQUMsS0FBSyxDQUFDO01BQ3BDLE1BQU0sQ0FBQyxhQUFhO1FBQ2xCLGdCQUFnQixDQUFDO1VBQ2YsSUFBSSxFQUFFLE9BQU87VUFDYixNQUFNLEVBQUUsTUFBTTtVQUNkLElBQUksRUFBRSxJQUFJLElBQUlHLEtBQVcsQ0FBQyxZQUFZO1VBQ3RDLE1BQU0sRUFBRSxNQUFNLElBQUksRUFBRTtVQUNwQixVQUFBLFFBQVE7U0FDVCxDQUFDO09BQ0gsQ0FBQztLQUNILENBQUMsQ0FBQzs7SUFFSCxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDOUQsYUFBYSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDdEMsQ0FBQTs7Ozs7RUFLRCxpQkFBQSxPQUFPLHVCQUFHO0lBQ1IsT0FBTyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQ2pELENBQUE7Ozs7Ozs7RUFPRCxpQkFBQSxFQUFFLGdCQUFDLElBQUksRUFBRSxXQUFXLEVBQUU7SUFDcEJOLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQztJQUNsQkEsSUFBTSxVQUFVLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQy9FLE9BQU87TUFDTCxJQUFJLGVBQUEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFO1FBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFLFlBQUEsVUFBVSxFQUFFLENBQUMsQ0FBQztPQUN4QztLQUNGLENBQUM7R0FDSCxDQUFBOzs7OztFQUtELGlCQUFBLEVBQUUsb0JBQVU7Ozs7SUFDVixPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztHQUNsQyxDQUFBOzs7RUE3S2tCLFdBOEtwQixHQUFBOzs7Ozs7O0FBT0RPLFFBQU0sQ0FBQyxFQUFFLEdBQUcsU0FBUyxFQUFFLENBQUMsR0FBRyxFQUFFO0VBQzNCLE9BQU8sSUFBSUEsUUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ3hCLENBQUMsQUFFRixBQUFzQjs7Ozs7OztBQ3ZMdEIsSUFBTUUsVUFBUTtFQUFxQixpQkFJdEIsQ0FBQyxHQUFpQixFQUFFLFFBQWEsRUFBRTtzQkFBL0I7NkJBQUEsR0FBRyxXQUFXLENBQVU7dUNBQUEsR0FBRyxFQUFFOztJQUMxQ1AsY0FBSyxLQUFBLENBQUMsSUFBQSxDQUFDLENBQUM7O0lBRVIsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7SUFDekIsSUFBSSxDQUFDLEdBQUcsR0FBR0UsWUFBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzFCLElBQUksQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQztJQUN0QyxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQzs7SUFFbkIsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLEVBQUU7TUFDaEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7S0FDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7TUFDekQsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDN0I7O0lBRURKLElBQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs7Ozs7SUFLN0QsS0FBSyxDQUFDLFNBQVMsYUFBYSxHQUFHO01BQzdCLElBQUksTUFBTSxFQUFFO1FBQ1YsSUFBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO1FBQ2hDLE1BQU0sQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3hFLE1BQU0sQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3JFLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO09BQ3BFLE1BQU07UUFDTCxJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7UUFDbEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakUsSUFBSSxDQUFDLGFBQWE7VUFDaEIsZ0JBQWdCLENBQUM7WUFDZixJQUFJLEVBQUUsT0FBTztZQUNiLE1BQU0sRUFBRSxJQUFJO1lBQ1osSUFBSSxFQUFFTSxLQUFXLENBQUMsWUFBWTtXQUMvQixDQUFDO1NBQ0gsQ0FBQzs7UUFFRkQsR0FBTSxDQUFDLE9BQU8sR0FBRSwyQkFBMEIsSUFBRSxJQUFJLENBQUMsR0FBRyxDQUFBLGFBQVMsRUFBRSxDQUFDO09BQ2pFO0tBQ0YsRUFBRSxJQUFJLENBQUMsQ0FBQzs7Ozs7SUFLVCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFVBQUEsS0FBSyxFQUFDO01BQ25DSixNQUFJLENBQUMsYUFBYTtRQUNoQixnQkFBZ0IsQ0FBQztVQUNmLElBQUksRUFBRSxZQUFZO1VBQ2xCLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTTtVQUNwQixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7U0FDakIsQ0FBQztPQUNILENBQUM7S0FDSCxDQUFDLENBQUM7R0FDSjs7Ozs7OzZDQUFBOzs7Ozs7RUFNRCxtQkFBQSxLQUFLLHFCQUFHO0lBQ04sSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLFFBQVEsQ0FBQyxJQUFJLEVBQUU7TUFDckMsT0FBTyxTQUFTLENBQUM7S0FDbEI7O0lBRURELElBQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3BELGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs7SUFFOUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO0lBQ2xDLElBQUksQ0FBQyxhQUFhO01BQ2hCLGdCQUFnQixDQUFDO1FBQ2YsSUFBSSxFQUFFLE9BQU87UUFDYixNQUFNLEVBQUUsSUFBSTtRQUNaLElBQUksRUFBRU0sS0FBVyxDQUFDLFlBQVk7T0FDL0IsQ0FBQztLQUNILENBQUM7O0lBRUYsSUFBSSxNQUFNLEVBQUU7TUFDVixNQUFNLENBQUMsYUFBYTtRQUNsQixnQkFBZ0IsQ0FBQztVQUNmLElBQUksRUFBRSxZQUFZO1VBQ2xCLE1BQU0sRUFBRSxJQUFJO1VBQ1osSUFBSSxFQUFFQSxLQUFXLENBQUMsWUFBWTtTQUMvQixDQUFDO1FBQ0YsTUFBTTtPQUNQLENBQUM7S0FDSDtHQUNGLENBQUE7Ozs7Ozs7RUFPRCxtQkFBQSxVQUFVLDBCQUFHO0lBQ1gsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0dBQ2QsQ0FBQTs7Ozs7RUFLRCxtQkFBQSxJQUFJLGtCQUFDLEtBQUssRUFBVzs7OztJQUNuQixJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssUUFBUSxDQUFDLElBQUksRUFBRTtNQUNyQyxNQUFNLElBQUksS0FBSyxDQUFDLGdEQUFnRCxDQUFDLENBQUM7S0FDbkU7O0lBRUROLElBQU0sWUFBWSxHQUFHLGtCQUFrQixDQUFDO01BQ3RDLElBQUksRUFBRSxLQUFLO01BQ1gsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHO01BQ2hCLE1BQUEsSUFBSTtLQUNMLENBQUMsQ0FBQzs7SUFFSEEsSUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7O0lBRXBELElBQUksTUFBTSxFQUFFO01BQ1YsTUFBTSxDQUFDLGFBQWEsTUFBQSxDQUFDLFVBQUEsWUFBWSxXQUFFLElBQU8sRUFBQSxDQUFDLENBQUM7S0FDN0M7R0FDRixDQUFBOzs7Ozs7Ozs7RUFTRCxtQkFBQSxJQUFJLGtCQUFDLElBQUksRUFBRTtJQUNULElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0dBQzVCLENBQUE7Ozs7Ozs7O0VBUUQsbUJBQUEsU0FBYSxtQkFBRztJQUNkLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxRQUFRLENBQUMsSUFBSSxFQUFFO01BQ3JDLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQztLQUNuRTs7SUFFREEsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ2xCQSxJQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwRCxJQUFJLENBQUMsTUFBTSxFQUFFO01BQ1gsTUFBTSxJQUFJLEtBQUssRUFBQyx1REFBc0QsSUFBRSxJQUFJLENBQUMsR0FBRyxDQUFBLE1BQUUsRUFBRSxDQUFDO0tBQ3RGOztJQUVELE9BQU87TUFDTCxJQUFJLGVBQUEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFO1FBQ2hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFLFVBQVUsRUFBRSxhQUFhLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO09BQ2hHO01BQ0QsRUFBRSxhQUFBLENBQUMsSUFBSSxFQUFFO1FBQ1AsT0FBTyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztPQUM5QjtNQUNELEVBQUUsZUFBQSxDQUFDLElBQUksRUFBRTtRQUNQLE9BQU8sTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7T0FDOUI7S0FDRixDQUFDO0dBQ0gsQ0FBQTs7Ozs7RUFLRCxtQkFBQSxFQUFFLGdCQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7SUFDakIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztHQUN2QyxDQUFBOzs7Ozs7O0VBT0QsbUJBQUEsSUFBSSxrQkFBQyxJQUFJLEVBQUU7SUFDVCxhQUFhLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0dBQy9DLENBQUE7Ozs7Ozs7RUFPRCxtQkFBQSxLQUFLLG1CQUFDLElBQUksRUFBRTtJQUNWLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDcEQsQ0FBQTs7Ozs7Ozs7RUFRRCxtQkFBQSxhQUFhLDJCQUFDLEtBQUssRUFBc0I7Ozs7O0lBQ3ZDQSxJQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0lBQzdCQSxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDOztJQUU1QyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRTtNQUM3QixPQUFPLEtBQUssQ0FBQztLQUNkOztJQUVELFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBQSxRQUFRLEVBQUM7TUFDekIsSUFBSSxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUM5QixRQUFRLENBQUMsS0FBSyxDQUFDQyxNQUFJLEVBQUUsZUFBZSxDQUFDLENBQUM7T0FDdkMsTUFBTTs7OztRQUlMLFFBQVEsQ0FBQyxJQUFJLENBQUNBLE1BQUksRUFBRSxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUM7T0FDdEQ7S0FDRixDQUFDLENBQUM7R0FDSixDQUFBOzs7OztFQW5Ob0IsV0FvTnRCLEdBQUE7O0FBRURRLFVBQVEsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCQSxVQUFRLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztBQUNsQkEsVUFBUSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDckJBLFVBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDOzs7OztBQUtwQlQsSUFBTSxFQUFFLEdBQUcsU0FBUyxhQUFhLENBQUMsR0FBRyxFQUFFO0VBQ3JDLE9BQU8sSUFBSVMsVUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQzFCLENBQUM7Ozs7O0FBS0YsRUFBRSxDQUFDLE9BQU8sR0FBRyxTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUU7O0VBRW5DLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztDQUVoQixDQUFDLEFBRUYsQUFBa0I7O0FDcFBYVCxJQUFNLE1BQU0sR0FBR1UsUUFBVSxDQUFDO0FBQ2pDLEFBQU9WLElBQU0sU0FBUyxHQUFHVyxXQUFhLENBQUM7QUFDdkMsQUFBT1gsSUFBTSxRQUFRLEdBQUdZLEVBQVksQ0FBQzs7Ozs7Ozs7In0=
