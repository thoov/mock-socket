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

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var EventPrototype = function () {
    function EventPrototype() {
      _classCallCheck(this, EventPrototype);
    }

    _createClass(EventPrototype, [{
      key: 'stopPropagation',
      value: function stopPropagation() {}
    }, {
      key: 'stopImmediatePropagation',
      value: function stopImmediatePropagation() {}
    }, {
      key: 'initEvent',
      value: function initEvent() {
        var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'undefined';
        var bubbles = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var cancelable = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        this.type = String(type);
        this.bubbles = Boolean(bubbles);
        this.cancelable = Boolean(cancelable);
      }
    }]);

    return EventPrototype;
  }();

  exports.default = EventPrototype;
});