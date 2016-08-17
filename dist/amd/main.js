define('main', ['exports', './server', './socket-io', './websocket'], function (exports, _server, _socketIo, _websocket) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _MockServer = _interopRequireDefault(_server);

  var _MockSocketIO = _interopRequireDefault(_socketIo);

  var _MockWebSocket = _interopRequireDefault(_websocket);

  var Server = _MockServer['default'];
  exports.Server = Server;
  var WebSocket = _MockWebSocket['default'];
  exports.WebSocket = WebSocket;
  var SocketIO = _MockSocketIO['default'];
  exports.SocketIO = SocketIO;
});