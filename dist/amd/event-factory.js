define('event-factory', ['exports', './helpers/event', './helpers/message-event', './helpers/close-event'], function (exports, _helpersEvent, _helpersMessageEvent, _helpersCloseEvent) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Event = _interopRequireDefault(_helpersEvent);

  var _MessageEvent = _interopRequireDefault(_helpersMessageEvent);

  var _CloseEvent = _interopRequireDefault(_helpersCloseEvent);

  /*
  * Creates an Event object and extends it to allow full modification of
  * its properties.
  *
  * @param {object} config - within config you will need to pass type and optionally target
  */
  function createEvent(config) {
    var type = config.type;
    var target = config.target;

    var eventObject = new _Event['default'](type);

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
    var type = config.type;
    var origin = config.origin;
    var data = config.data;
    var target = config.target;

    var messageEvent = new _MessageEvent['default'](type, {
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
    var code = config.code;
    var reason = config.reason;
    var type = config.type;
    var target = config.target;
    var wasClean = config.wasClean;

    if (!wasClean) {
      wasClean = code === 1000;
    }

    var closeEvent = new _CloseEvent['default'](type, {
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