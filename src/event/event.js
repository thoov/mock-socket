import EventPrototype from './prototype';
import { ERROR_PREFIX } from '../constants';

export default class Event extends EventPrototype {
  constructor(type, eventInitConfig = {}) {
    super();

    if (!type) {
      throw new TypeError(`${ERROR_PREFIX.EVENT_ERROR} 1 argument required, but only 0 present.`);
    }

    if (typeof eventInitConfig !== 'object') {
      throw new TypeError(`${ERROR_PREFIX.EVENT_ERROR} parameter 2 ('eventInitDict') is not an object.`);
    }

    const { bubbles, cancelable } = eventInitConfig;

    this.type = `${type}`;
    this.timeStamp = Date.now();
    this.target = null;
    this.srcElement = null;
    this.returnValue = true;
    this.isTrusted = false;
    this.eventPhase = 0;
    this.defaultPrevented = false;
    this.currentTarget = null;
    this.cancelable = cancelable ? Boolean(cancelable) : false;
    this.cancelBubble = false;
    this.bubbles = bubbles ? Boolean(bubbles) : false;
  }
}
