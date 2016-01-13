'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _eventPrototype = require('./event-prototype');

var _eventPrototype2 = _interopRequireDefault(_eventPrototype);

var MessageEvent = (function (_EventPrototype) {
  _inherits(MessageEvent, _EventPrototype);

  function MessageEvent(type) {
    var eventInitConfig = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, MessageEvent);

    _get(Object.getPrototypeOf(MessageEvent.prototype), 'constructor', this).call(this);

    if (!type) {
      throw new TypeError('Failed to construct \'MessageEvent\': 1 argument required, but only 0 present.');
    }

    if (typeof eventInitConfig !== 'object') {
      throw new TypeError('Failed to construct \'MessageEvent\': parameter 2 (\'eventInitDict\') is not an object');
    }

    var bubbles = eventInitConfig.bubbles;
    var cancelable = eventInitConfig.cancelable;
    var data = eventInitConfig.data;
    var origin = eventInitConfig.origin;
    var lastEventId = eventInitConfig.lastEventId;
    var ports = eventInitConfig.ports;

    Object.assign(this, {
      type: String(type),
      timeStamp: Date.now(),
      target: null,
      srcElement: null,
      returnValue: true,
      isTrusted: false,
      eventPhase: 0,
      defaultPrevented: false,
      currentTarget: null,
      cancelable: cancelable ? Boolean(cancelable) : false,
      canncelBubble: false,
      bubbles: bubbles ? Boolean(bubbles) : false,
      origin: origin ? String(origin) : '',
      ports: typeof ports === 'undefined' ? null : ports,
      data: typeof data === 'undefined' ? null : data,
      lastEventId: lastEventId ? String(lastEventId) : ''
    });
  }

  return MessageEvent;
})(_eventPrototype2['default']);

exports['default'] = MessageEvent;
module.exports = exports['default'];