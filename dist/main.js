'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _server = require('./server');

var _server2 = _interopRequireDefault(_server);

var _socketIo = require('./socket-io');

var _socketIo2 = _interopRequireDefault(_socketIo);

var _websocket = require('./websocket');

var _websocket2 = _interopRequireDefault(_websocket);

if (typeof window !== 'undefined') {
  window.MockServer = _server2['default'];
  window.MockWebSocket = _websocket2['default'];
  window.MockSocketIO = _socketIo2['default'];
}

var Server = _server2['default'];
exports.Server = Server;
var WebSocket = _websocket2['default'];
exports.WebSocket = WebSocket;
var SocketIO = _socketIo2['default'];
exports.SocketIO = SocketIO;