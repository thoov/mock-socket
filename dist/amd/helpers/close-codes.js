define("helpers/close-codes", ["exports", "module"], function (exports, module) {
  /*
  * https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
  */
  "use strict";

  var codes = {
    CLOSE_NORMAL: 1000,
    CLOSE_GOING_AWAY: 1001,
    CLOSE_PROTOCOL_ERROR: 1002,
    CLOSE_UNSUPPORTED: 1003,
    CLOSE_NO_STATUS: 1005,
    CLOSE_ABNORMAL: 1006,
    CLOSE_TOO_LARGE: 1009
  };

  module.exports = codes;
});