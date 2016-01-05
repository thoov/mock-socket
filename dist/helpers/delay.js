/*
* This delay allows the thread to finish assigning its on* methods
* before invoking the delay callback. This is purely a timing hack.
* http://geekabyte.blogspot.com/2014/01/javascript-effect-of-setting-settimeout.html
*
* @param {callback: function} the callback which will be invoked after the timeout
* @parma {context: object} the context in which to invoke the function
*/
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function delay(callback, context) {
  setTimeout(function timeout(timeoutContext) {
    callback.call(timeoutContext);
  }, 4, context);
}

exports["default"] = delay;
module.exports = exports["default"];