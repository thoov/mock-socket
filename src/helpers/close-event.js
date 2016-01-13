import EventPrototype from './event-prototype';

export default class CloseEvent extends EventPrototype {
  constructor(type, eventInitConfig = {}) {
    super();

    if (!type) {
      throw new TypeError('Failed to construct \'CloseEvent\': 1 argument required, but only 0 present.');
    }

    if (typeof eventInitConfig !== 'object') {
      throw new TypeError('Failed to construct \'CloseEvent\': parameter 2 (\'eventInitDict\') is not an object');
    }

    const {
      bubbles,
      cancelable,
      code,
      reason,
      wasClean,
    } = eventInitConfig;

    Object.assign(this, {
      type: String(type),
      timeStamp: Date.now(),
      target: null,
      srcElement: null,
      returnValue: true,
      isTrusted: false,
      eventPhase: 0,
      defaultPrevented: false,
      currentTarget: null,
      cancelable: cancelable ? Boolean(cancelable) : false,
      canncelBubble: false,
      bubbles: bubbles ? Boolean(bubbles) : false,
      code: typeof code === 'number' ? Number(code) : 0,
      reason: reason ? String(reason) : '',
      wasClean: wasClean ? Boolean(wasClean) : false,
    });
  }
}
