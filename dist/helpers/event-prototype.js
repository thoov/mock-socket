'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var EventPrototype = (function () {
  function EventPrototype() {
    _classCallCheck(this, EventPrototype);
  }

  _createClass(EventPrototype, [{
    key: 'stopPropagation',

    // Noops
    value: function stopPropagation() {}
  }, {
    key: 'stopImmediatePropagation',
    value: function stopImmediatePropagation() {}

    // if no arguments are passed then the type is set to "undefined" on
    // chrome and safari.
  }, {
    key: 'initEvent',
    value: function initEvent() {
      var type = arguments.length <= 0 || arguments[0] === undefined ? 'undefined' : arguments[0];
      var bubbles = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
      var cancelable = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      Object.assign(this, {
        type: String(type),
        bubbles: Boolean(bubbles),
        cancelable: Boolean(cancelable)
      });
    }
  }]);

  return EventPrototype;
})();

exports['default'] = EventPrototype;
module.exports = exports['default'];