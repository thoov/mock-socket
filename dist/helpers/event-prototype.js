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
    global.eventPrototype = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  class EventPrototype {
    // Noops
    stopPropagation() {}
    stopImmediatePropagation() {}

    // if no arguments are passed then the type is set to "undefined" on
    // chrome and safari.
    initEvent(type = 'undefined', bubbles = false, cancelable = false) {
      this.type = String(type);
      this.bubbles = Boolean(bubbles);
      this.cancelable = Boolean(cancelable);
    }
  }
  exports.default = EventPrototype;
});