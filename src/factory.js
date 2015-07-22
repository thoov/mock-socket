/*
* Natively you cannot set or modify the properties: target, srcElement, and currentTarget on Event or
* MessageEvent objects. So in order to set them to the correct values we "overwrite" them to the same
* property but without the restriction of not writable.
*
* @param {object} event - an event object to extend
* @param {object} target - the value that should be set for target, srcElement, and currentTarget
*/
function extendEvent(event, target) {
  Object.defineProperties(event, {
    target:  {
      configurable: true,
      writable: true
    },
    srcElement: {
      configurable: true,
      writable: true
    },
    currentTarget: {
      configurable: true,
      writable: true
    }
  });

  if (target) {
    event.target = target;
    event.srcElement = target;
    event.currentTarget = target;
  }

  return event;
}

/*
* Creates an Event object and extends it to allow full modification of
* its properties.
*
* @param {object} config - within config you will need to pass type and optionally target
*/
function createEvent(config) {
  var {
    type,
    target
  } = config;

  var event = new window.Event(type);

  if (!event.path) {
    event = JSON.parse(JSON.stringify(event));
  }

  return extendEvent(event, target);
}

/*
* Creates a MessageEvent object and extends it to allow full modification of
* its properties.
*
* @param {object} config - within config you will need to pass type, origin, data and optionally target
*/
function createMessageEvent(config) {
  var {
    type,
    origin,
    data,
    target
  } = config;

  var messageEvent = new window.MessageEvent(type);

  if (!messageEvent.path) {
    messageEvent = JSON.parse(JSON.stringify(messageEvent));
  }

  extendEvent(messageEvent, target);

  if (messageEvent.initMessageEvent) {
    messageEvent.initMessageEvent(type, false, false, data, origin, null);
  }
  else {
    messageEvent.data = data;
    messageEvent.origin = origin;
  }

  return messageEvent;
}

/*
* Creates a CloseEvent object and extends it to allow full modification of
* its properties.
*
* @param {object} config - within config you will need to pass type and optionally target, code, and reason
*/
function createCloseEvent(config) {
  var {
    code,
    reason,
    type,
    target
  } = config;

  var closeEvent = new window.CloseEvent(type, {
    code,
    reason
  });

  if (!closeEvent.path) {
    closeEvent = JSON.parse(JSON.stringify(closeEvent));
    closeEvent.code = code || 0;
    closeEvent.reason = reason || '';
  }

  return extendEvent(closeEvent, target);
}

export {
  createEvent,
  createMessageEvent,
  createCloseEvent
};
