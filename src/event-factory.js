import Event from './helpers/event';
import MessageEvent from './helpers/message-event';
import CloseEvent from './helpers/close-event';

/*
* Creates an Event object and extends it to allow full modification of
* its properties.
*
* @param {object} config - within config you will need to pass type and optionally target
*/
function createEvent(config) {
  const { type, target } = config;
  const eventObject = new Event(type);

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
  const { type, origin, data, target } = config;
  const messageEvent = new MessageEvent(type, {
    data,
    origin
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
  const { code, reason, type, target } = config;
  let { wasClean } = config;

  if (!wasClean) {
    wasClean = code === 1000;
  }

  const closeEvent = new CloseEvent(type, {
    code,
    reason,
    wasClean
  });

  if (target) {
    closeEvent.target = target;
    closeEvent.srcElement = target;
    closeEvent.currentTarget = target;
  }

  return closeEvent;
}

export { createEvent, createMessageEvent, createCloseEvent };
