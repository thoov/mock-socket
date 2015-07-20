/*
*
* @param eventType can be Event or MessageEvent
*/
function createEvent(eventObject) {
  var {type, kind, target, data, origin} = eventObject;

  if(!kind) {
    kind = 'Event';
  }

  var event = new window[kind](type);

  if(!event) {
    throw new Error(`${kind} is not defined in this enviornment`);
  }

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

  if(target) {
    event.target = target;
    event.srcElement = target;
    event.currentTarget = target;
  }

  if(kind === 'MessageEvent') {
    event.initMessageEvent(type, false, false, data, origin, null);
  }

  return event;
}

export default createEvent;
