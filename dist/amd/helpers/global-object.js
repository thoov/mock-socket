define('helpers/global-object', ['exports', 'module'], function (exports, module) {
  'use strict';

  module.exports = retrieveGlobalObject;

  function retrieveGlobalObject() {
    if (typeof window !== 'undefined') {
      return window;
    }

    return typeof process === 'object' && typeof require === 'function' && typeof global === 'object' ? global : this;
  }
});