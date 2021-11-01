import { CLOSE_CODES } from '../constants';
import { closeWebSocketConnection } from '../algorithms/close';
import normalizeSendData from './normalize-send';
import { createMessageEvent } from '../event/factory';

const proxies = new WeakMap();

export default function proxyFactory(target) {
  if (proxies.has(target)) {
    return proxies.get(target);
  }

  const proxy = new Proxy(target, {
    get(obj, prop) {
      if (prop === 'close') {
        return function close(options = {}) {
          const code = options.code || CLOSE_CODES.CLOSE_NORMAL;
          const reason = options.reason || '';

          closeWebSocketConnection(proxy, code, reason);
        };
      }

      if (prop === 'send') {
        return function send(data) {
          data = normalizeSendData(data);

          target.dispatchEvent(
            createMessageEvent({
              type: 'message',
              data,
              origin: this.url,
              target
            })
          );
        };
      }

      if (prop === 'on') {
        return function onWrapper(type, cb) {
          target.addEventListener(`server::${type}`, cb);
        };
      }

      if (prop === 'target') {
        return target;
      }

      return obj[prop];
    }
  });
  proxies.set(target, proxy);

  return proxy;
}
