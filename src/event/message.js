import EventPrototype from './prototype';
import { ERROR_PREFIX } from '../constants';

export default class MessageEvent extends EventPrototype {
  constructor(type, eventInitConfig = {}) {
    super();

    if (!type) {
      throw new TypeError(`${ERROR_PREFIX.EVENT.MESSAGE} 1 argument required, but only 0 present.`);
    }

    if (typeof eventInitConfig !== 'object') {
      throw new TypeError(`${ERROR_PREFIX.EVENT.MESSAGE} parameter 2 ('eventInitDict') is not an object`);
    }

    const { bubbles, cancelable, data, origin, lastEventId, ports } = eventInitConfig;

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
    this.canncelBubble = false;
    this.bubbles = bubbles ? Boolean(bubbles) : false;
    this.origin = `${origin}`;
    this.ports = typeof ports === 'undefined' ? null : ports;
    this.data = typeof data === 'undefined' ? null : data;
    this.lastEventId = `${lastEventId || ''}`;
  }
}
