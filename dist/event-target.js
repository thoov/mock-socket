(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './helpers/array-helpers'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./helpers/array-helpers'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.arrayHelpers);
    global.eventTarget = mod.exports;
  }
})(this, function (exports, _arrayHelpers) {
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

  var EventTarget = function () {
    function EventTarget() {
      _classCallCheck(this, EventTarget);

      this.listeners = {};
    }

    /*
    * Ties a listener function to a event type which can later be invoked via the
    * dispatchEvent method.
    *
    * @param {string} type - the type of event (ie: 'open', 'message', etc.)
    * @param {function} listener - the callback function to invoke whenever a event is dispatched matching the given type
    * @param {boolean} useCapture - N/A TODO: implement useCapture functionality
    */


    _createClass(EventTarget, [{
      key: 'addEventListener',
      value: function addEventListener(type, listener /* , useCapture */) {
        if (typeof listener === 'function') {
          if (!Array.isArray(this.listeners[type])) {
            this.listeners[type] = [];
          }

          // Only add the same function once
          if ((0, _arrayHelpers.filter)(this.listeners[type], function (item) {
            return item === listener;
          }).length === 0) {
            this.listeners[type].push(listener);
          }
        }
      }
    }, {
      key: 'removeEventListener',
      value: function removeEventListener(type, removingListener /* , useCapture */) {
        var arrayOfListeners = this.listeners[type];
        this.listeners[type] = (0, _arrayHelpers.reject)(arrayOfListeners, function (listener) {
          return listener === removingListener;
        });
      }
    }, {
      key: 'dispatchEvent',
      value: function dispatchEvent(event) {
        var _this = this;

        for (var _len = arguments.length, customArguments = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          customArguments[_key - 1] = arguments[_key];
        }

        var eventName = event.type;
        var listeners = this.listeners[eventName];

        if (!Array.isArray(listeners)) {
          return false;
        }

        listeners.forEach(function (listener) {
          if (customArguments.length > 0) {
            listener.apply(_this, customArguments);
          } else {
            listener.call(_this, event);
          }
        });

        return true;
      }
    }]);

    return EventTarget;
  }();

  exports.default = EventTarget;
});