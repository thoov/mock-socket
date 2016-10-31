(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.logger = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = log;
  function log(method, message) {
    /* eslint-disable no-console */
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
      console[method].call(null, message);
    }
    /* eslint-enable no-console */
  }
});