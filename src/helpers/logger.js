export default function log(method, message) {
  /* eslint-disable no-console */
  if (process && process.env && process.env.NODE_ENV !== 'test') {
    console[method].call(null, message);
  }
  /* eslint-enable no-console */
}
