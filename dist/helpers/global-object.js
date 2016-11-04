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

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  function retrieveGlobalObject() {
    if (typeof window !== 'undefined') {
      return window;
    }

    return (typeof process === 'undefined' ? 'undefined' : _typeof(process)) === 'object' && typeof require === 'function' && (typeof global === 'undefined' ? 'undefined' : _typeof(global)) === 'object' ? global : this;
  }
});