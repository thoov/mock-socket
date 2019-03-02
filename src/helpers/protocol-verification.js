import { ERROR_PREFIX } from '../constants';

export default function protocolVerification(protocols = []) {
  if (!Array.isArray(protocols) && typeof protocols !== 'string') {
    throw new SyntaxError(`${ERROR_PREFIX.CONSTRUCTOR_ERROR} The subprotocol '${protocols.toString()}' is invalid.`);
  }

  if (typeof protocols === 'string') {
    protocols = [protocols];
  }

  const uniq = protocols
    .map(p => ({ count: 1, protocol: p }))
    .reduce((a, b) => {
      a[b.protocol] = (a[b.protocol] || 0) + b.count;
      return a;
    }, {});

  const duplicates = Object.keys(uniq).filter(a => uniq[a] > 1);

  if (duplicates.length > 0) {
    throw new SyntaxError(`${ERROR_PREFIX.CONSTRUCTOR_ERROR} The subprotocol '${duplicates[0]}' is duplicated.`);
  }

  return protocols;
}
