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
    global.globalObject = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = retrieveGlobalObject;
  function retrieveGlobalObject() {
    if (typeof window !== 'undefined') {
      return window;
    }

    return typeof process === 'object' && typeof require === 'function' && typeof global === 'object' ? global : this;
  }
});