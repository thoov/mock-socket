define("helpers/delay", ["exports", "module"], function (exports, module) {
  /*
  * This delay allows the thread to finish assigning its on* methods
  * before invoking the delay callback. This is purely a timing hack.
  * http://geekabyte.blogspot.com/2014/01/javascript-effect-of-setting-settimeout.html
  *
  * @param {callback: function} the callback which will be invoked after the timeout
  * @parma {context: object} the context in which to invoke the function
  */
  "use strict";

  module.exports = delay;

  function delay(callback, context) {
    setTimeout(function (timeoutContext) {
      return callback.call(timeoutContext);
    }, 4, context);
  }
});