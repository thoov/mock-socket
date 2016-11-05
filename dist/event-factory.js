(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './helpers/event', './helpers/message-event', './helpers/close-event'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./helpers/event'), require('./helpers/message-event'), require('./helpers/close-event'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.event, global.messageEvent, global.closeEvent);
    global.eventFactory = mod.exports;
  }
})(this, function (exports, _event, _messageEvent, _closeEvent) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.createCloseEvent = exports.createMessageEvent = exports.createEvent = undefined;

  var _event2 = _interopRequireDefault(_event);

  var _messageEvent2 = _interopRequireDefault(_messageEvent);

  var _closeEvent2 = _interopRequireDefault(_closeEvent);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  /*
  * Creates an Event object and extends it to allow full modification of
  * its properties.
  *
  * @param {object} config - within config you will need to pass type and optionally target
  */
  function createEvent(config) {
    var type = config.type,
        target = config.target;

    var eventObject = new _event2.default(type);

    if (target) {
      eventObject.target = target;
      eventObject.srcElement = target;
      eventObject.currentTarget = target;
    }

    return eventObject;
  }

  /*
  * Creates a MessageEvent object and extends it to allow full modification of
  * its properties.
  *
  * @param {object} config - within config: type, origin, data and optionally target
  */
  function createMessageEvent(config) {
    var type = config.type,
        origin = config.origin,
        data = config.data,
        target = config.target;

    var messageEvent = new _messageEvent2.default(type, {
      data: data,
      origin: origin
    });

    if (target) {
      messageEvent.target = target;
      messageEvent.srcElement = target;
      messageEvent.currentTarget = target;
    }

    return messageEvent;
  }

  /*
  * Creates a CloseEvent object and extends it to allow full modification of
  * its properties.
  *
  * @param {object} config - within config: type and optionally target, code, and reason
  */
  function createCloseEvent(config) {
    var code = config.code,
        reason = config.reason,
        type = config.type,
        target = config.target;
    var wasClean = config.wasClean;


    if (!wasClean) {
      wasClean = code === 1000;
    }

    var closeEvent = new _closeEvent2.default(type, {
      code: code,
      reason: reason,
      wasClean: wasClean
    });

    if (target) {
      closeEvent.target = target;
      closeEvent.srcElement = target;
      closeEvent.currentTarget = target;
    }

    return closeEvent;
  }

  exports.createEvent = createEvent;
  exports.createMessageEvent = createMessageEvent;
  exports.createCloseEvent = createCloseEvent;
});