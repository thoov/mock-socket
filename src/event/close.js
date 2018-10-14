import EventPrototype from './prototype';
import { ERROR_PREFIX } from '../constants';

export default class CloseEvent extends EventPrototype {
  constructor(type, eventInitConfig = {}) {
    super();

    if (!type) {
      throw new TypeError(`${ERROR_PREFIX.EVENT.CLOSE} 1 argument required, but only 0 present.`);
    }

    if (typeof eventInitConfig !== 'object') {
      throw new TypeError(`${ERROR_PREFIX.EVENT.CLOSE} parameter 2 ('eventInitDict') is not an object`);
    }

    const { bubbles, cancelable, code, reason, wasClean } = eventInitConfig;

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
    this.code = typeof code === 'number' ? parseInt(code, 10) : 0;
    this.reason = `${reason || ''}`;
    this.wasClean = wasClean ? Boolean(wasClean) : false;
  }
}
