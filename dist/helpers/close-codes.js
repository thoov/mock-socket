(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.closeCodes = mod.exports;
  }
})(this, function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  /*
  * https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
  */
  const codes = {
    CLOSE_NORMAL: 1000,
    CLOSE_GOING_AWAY: 1001,
    CLOSE_PROTOCOL_ERROR: 1002,
    CLOSE_UNSUPPORTED: 1003,
    CLOSE_NO_STATUS: 1005,
    CLOSE_ABNORMAL: 1006,
    CLOSE_TOO_LARGE: 1009
  };

  exports.default = codes;
});