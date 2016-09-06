'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = retrieveGlobalObject;

function retrieveGlobalObject() {
  if (typeof window !== 'undefined') {
    return window;
  }

  return typeof process === 'object' && typeof require === 'function' && typeof global === 'object' ? global : this;
}

module.exports = exports['default'];