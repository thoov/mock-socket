/*
*
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
*
* @param eventType can be Event or MessageEvent
*/
function createEvent(config) {
  var {
    type,
    target
  } = config;
  var event = new window.Event(type);

  if (!event) {
    throw new Error(`Event is not defined in this enviornment`);
  }

  return extendEvent(event, target);
}

/*
*
*/
function createMessageEvent(config) {
  var {
    type,
    origin,
    data,
    target
  } = config;
  var messageEvent = new window.MessageEvent(type);

  if (!messageEvent) {
    throw new Error(`MessageEvent is not defined in this enviornment`);
  }

  extendEvent(messageEvent, target);

  return messageEvent.initMessageEvent(type, false, false, data, origin, null);
}

export {
  createEvent,
  createMessageEvent
};
