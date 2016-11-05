(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './event-prototype'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./event-prototype'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.eventPrototype);
    global.messageEvent = mod.exports;
  }
})(this, function (exports, _eventPrototype) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _eventPrototype2 = _interopRequireDefault(_eventPrototype);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var MessageEvent = function (_EventPrototype) {
    _inherits(MessageEvent, _EventPrototype);

    function MessageEvent(type) {
      var eventInitConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, MessageEvent);

      var _this = _possibleConstructorReturn(this, (MessageEvent.__proto__ || Object.getPrototypeOf(MessageEvent)).call(this));

      if (!type) {
        throw new TypeError('Failed to construct \'MessageEvent\': 1 argument required, but only 0 present.');
      }

      if ((typeof eventInitConfig === 'undefined' ? 'undefined' : _typeof(eventInitConfig)) !== 'object') {
        throw new TypeError('Failed to construct \'MessageEvent\': parameter 2 (\'eventInitDict\') is not an object');
      }

      var bubbles = eventInitConfig.bubbles,
          cancelable = eventInitConfig.cancelable,
          data = eventInitConfig.data,
          origin = eventInitConfig.origin,
          lastEventId = eventInitConfig.lastEventId,
          ports = eventInitConfig.ports;


      _this.type = String(type);
      _this.timeStamp = Date.now();
      _this.target = null;
      _this.srcElement = null;
      _this.returnValue = true;
      _this.isTrusted = false;
      _this.eventPhase = 0;
      _this.defaultPrevented = false;
      _this.currentTarget = null;
      _this.cancelable = cancelable ? Boolean(cancelable) : false;
      _this.canncelBubble = false;
      _this.bubbles = bubbles ? Boolean(bubbles) : false;
      _this.origin = origin ? String(origin) : '';
      _this.ports = typeof ports === 'undefined' ? null : ports;
      _this.data = typeof data === 'undefined' ? null : data;
      _this.lastEventId = lastEventId ? String(lastEventId) : '';
      return _this;
    }

    return MessageEvent;
  }(_eventPrototype2.default);

  exports.default = MessageEvent;
});