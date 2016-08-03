'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpersArrayHelpers = require('./helpers/array-helpers');

/*
* The network bridge is a way for the mock websocket object to 'communicate' with
* all available servers. This is a singleton object so it is important that you
* clean up urlMap whenever you are finished.
*/

var NetworkBridge = (function () {
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

    /*
    * Attaches a websocket to a room
    */
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

    /*
    * Attaches a server object to the urlMap hash so that it can find a websockets
    * which are connected to it and so that websockets can in turn can find it.
    *
    * @param {object} server - server object to add to the urlMap hash
    * @param {string} url
    */
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

    /*
    * Finds the server which is 'running' on the given url.
    *
    * @param {string} url - the url to use to find which server is running on it
    */
  }, {
    key: 'serverLookup',
    value: function serverLookup(url) {
      var connectionLookup = this.urlMap[url];

      if (connectionLookup) {
        return connectionLookup.server;
      }
    }

    /*
    * Finds all websockets which is 'listening' on the given url.
    *
    * @param {string} url - the url to use to find all websockets which are associated with it
    * @param {string} room - if a room is provided, will only return sockets in this room
    * @param {class} broadcaster - socket that is broadcasting and is to be excluded from the lookup
    */
  }, {
    key: 'websocketsLookup',
    value: function websocketsLookup(url, room, broadcaster) {
      var websockets = undefined;
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

    /*
    * Removes the entry associated with the url.
    *
    * @param {string} url
    */
  }, {
    key: 'removeServer',
    value: function removeServer(url) {
      delete this.urlMap[url];
    }

    /*
    * Removes the individual websocket from the map of associated websockets.
    *
    * @param {object} websocket - websocket object to remove from the url map
    * @param {string} url
    */
  }, {
    key: 'removeWebSocket',
    value: function removeWebSocket(websocket, url) {
      var connectionLookup = this.urlMap[url];

      if (connectionLookup) {
        connectionLookup.websockets = (0, _helpersArrayHelpers.reject)(connectionLookup.websockets, function (socket) {
          return socket === websocket;
        });
      }
    }

    /*
    * Removes a websocket from a room
    */
  }, {
    key: 'removeMembershipFromRoom',
    value: function removeMembershipFromRoom(websocket, room) {
      var connectionLookup = this.urlMap[websocket.url];
      var memberships = connectionLookup.roomMemberships[room];

      if (connectionLookup && memberships !== null) {
        connectionLookup.roomMemberships[room] = (0, _helpersArrayHelpers.reject)(memberships, function (socket) {
          return socket === websocket;
        });
      }
    }
  }]);

  return NetworkBridge;
})();

exports['default'] = new NetworkBridge();
// Note: this is a singleton
module.exports = exports['default'];