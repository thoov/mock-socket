(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './server', './socket-io', './websocket'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./server'), require('./socket-io'), require('./websocket'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.server, global.socketIo, global.websocket);
    global.main = mod.exports;
  }
})(this, function (exports, _server, _socketIo, _websocket) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.SocketIO = exports.WebSocket = exports.Server = undefined;

  var _server2 = _interopRequireDefault(_server);

  var _socketIo2 = _interopRequireDefault(_socketIo);

  var _websocket2 = _interopRequireDefault(_websocket);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  const Server = exports.Server = _server2.default;
  const WebSocket = exports.WebSocket = _websocket2.default;
  const SocketIO = exports.SocketIO = _socketIo2.default;
});