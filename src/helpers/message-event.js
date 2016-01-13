import EventPrototype from './event-prototype';

export default class MessageEvent extends EventPrototype {
  constructor(type, eventInitConfig = {}) {
    super();

    if (!type) {
      throw new TypeError('Failed to construct \'MessageEvent\': 1 argument required, but only 0 present.');
    }

    if (typeof eventInitConfig !== 'object') {
      throw new TypeError('Failed to construct \'MessageEvent\': parameter 2 (\'eventInitDict\') is not an object');
    }

    const {
      bubbles,
      cancelable,
      data,
      origin,
      lastEventId,
      ports,
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
      cancelable: cancelable ? Boolean(cancelable) :false,
      canncelBubble: false,
      bubbles: bubbles ? Boolean(bubbles) : false,
      origin: origin ? String(origin) : '',
      ports: typeof ports === 'undefined' ? null : ports,
      data: typeof data === 'undefined' ? null : data,
      lastEventId: lastEventId ? String(lastEventId) : '',
    });
  }
}
