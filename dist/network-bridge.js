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
    global.networkBridge = mod.exports;
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

  var NetworkBridge = function () {
    function NetworkBridge() {
      _classCallCheck(this, NetworkBridge);

      this.urlMap = {};
    }

    /*
    * Attaches a websocket object to the urlMap hash so that it can find the server
    * it is connected to and the server in turn can find it.
    *
    * @param {object} websocket - websocket object to add to the urlMap hash
    * @param {string} url
    */


    _createClass(NetworkBridge, [{
      key: 'attachWebSocket',
      value: function attachWebSocket(websocket, url) {
        var connectionLookup = this.urlMap[url];

        if (connectionLookup && connectionLookup.server && connectionLookup.websockets.indexOf(websocket) === -1) {
          connectionLookup.websockets.push(websocket);
          return connectionLookup.server;
        }
      }
    }, {
      key: 'addMembershipToRoom',
      value: function addMembershipToRoom(websocket, room) {
        var connectionLookup = this.urlMap[websocket.url];

        if (connectionLookup && connectionLookup.server && connectionLookup.websockets.indexOf(websocket) !== -1) {
          if (!connectionLookup.roomMemberships[room]) {
            connectionLookup.roomMemberships[room] = [];
          }

          connectionLookup.roomMemberships[room].push(websocket);
        }
      }
    }, {
      key: 'attachServer',
      value: function attachServer(server, url) {
        var connectionLookup = this.urlMap[url];

        if (!connectionLookup) {
          this.urlMap[url] = {
            server: server,
            websockets: [],
            roomMemberships: {}
          };

          return server;
        }
      }
    }, {
      key: 'serverLookup',
      value: function serverLookup(url) {
        var connectionLookup = this.urlMap[url];

        if (connectionLookup) {
          return connectionLookup.server;
        }
      }
    }, {
      key: 'websocketsLookup',
      value: function websocketsLookup(url, room, broadcaster) {
        var websockets = void 0;
        var connectionLookup = this.urlMap[url];

        websockets = connectionLookup ? connectionLookup.websockets : [];

        if (room) {
          var members = connectionLookup.roomMemberships[room];
          websockets = members || [];
        }

        return broadcaster ? websockets.filter(function (websocket) {
          return websocket !== broadcaster;
        }) : websockets;
      }
    }, {
      key: 'removeServer',
      value: function removeServer(url) {
        delete this.urlMap[url];
      }
    }, {
      key: 'removeWebSocket',
      value: function removeWebSocket(websocket, url) {
        var connectionLookup = this.urlMap[url];

        if (connectionLookup) {
          connectionLookup.websockets = (0, _arrayHelpers.reject)(connectionLookup.websockets, function (socket) {
            return socket === websocket;
          });
        }
      }
    }, {
      key: 'removeMembershipFromRoom',
      value: function removeMembershipFromRoom(websocket, room) {
        var connectionLookup = this.urlMap[websocket.url];
        var memberships = connectionLookup.roomMemberships[room];

        if (connectionLookup && memberships !== null) {
          connectionLookup.roomMemberships[room] = (0, _arrayHelpers.reject)(memberships, function (socket) {
            return socket === websocket;
          });
        }
      }
    }]);

    return NetworkBridge;
  }();

  exports.default = new NetworkBridge();
});