import URL from 'url-parse';
import { ERROR_PREFIX } from '../constants';

export default function urlVerification(url) {
  const urlRecord = new URL(url);
  const { pathname, protocol, hash } = urlRecord;

  if (!url) {
    throw new TypeError(`${ERROR_PREFIX.CONSTRUCTOR_ERROR} 1 argument required, but only 0 present.`);
  }

  if (!pathname) {
    urlRecord.pathname = '/';
  }

  if (protocol === '') {
    throw new SyntaxError(`${ERROR_PREFIX.CONSTRUCTOR_ERROR} The URL '${urlRecord.toString()}' is invalid.`);
  }

  if (protocol !== 'ws:' && protocol !== 'wss:') {
    throw new SyntaxError(
      `${ERROR_PREFIX.CONSTRUCTOR_ERROR} The URL's scheme must be either 'ws' or 'wss'. '${protocol}' is not allowed.`
    );
  }

  if (hash !== '') {
    /* eslint-disable max-len */
    throw new SyntaxError(
      `${
        ERROR_PREFIX.CONSTRUCTOR_ERROR
      } The URL contains a fragment identifier ('${hash}'). Fragment identifiers are not allowed in WebSocket URLs.`
    );
    /* eslint-enable max-len */
  }

  return urlRecord.toString();
}
