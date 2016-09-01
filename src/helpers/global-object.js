export default function retrieveGlobalObject() {
  if (typeof window !== 'undefinde') {
    return window;
  }

  return (typeof process === 'object' &&
      typeof require === 'function' &&
      typeof global === 'object') ? global : this;
}
