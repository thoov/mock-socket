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
    global.delay = mod.exports;
  }
})(this, function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = delay;
  /*
  * This delay allows the thread to finish assigning its on* methods
  * before invoking the delay callback. This is purely a timing hack.
  * http://geekabyte.blogspot.com/2014/01/javascript-effect-of-setting-settimeout.html
  *
  * @param {callback: function} the callback which will be invoked after the timeout
  * @parma {context: object} the context in which to invoke the function
  */
  function delay(callback, context) {
    setTimeout(function (timeoutContext) {
      return callback.call(timeoutContext);
    }, 4, context);
  }
});