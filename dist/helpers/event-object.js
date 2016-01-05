'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
function NodeEvent(config) {
  var _this = this;

  var event = {
    bubbles: false,
    cancelBublle: false,
    cancelable: false,
    defaultPrevented: false,
    eventPhase: 0,
    path: [],
    returnValue: true,
    timeStamp: Date.now(),
    type: config.type,
    lastEventId: ''
  };

  Object.keys(event).forEach(function (keyName) {
    _this[keyName] = event[keyName];
  });
}

exports['default'] = NodeEvent;
module.exports = exports['default'];