/* eslint-disable no-var */
var babel = require('broccoli-babel-transpiler');
var mergeTrees = require('broccoli-merge-trees');

/*
  Node Module

  supports:
   - require('mock-socket').WebSocket
   - require('mock-socket/dist/websocket');
   - require('mock-socket/dist/server');
   - require('mock-socket/dist/socket-io');
*/

var transpiledNodeModuleTree = babel('src');

module.exports = mergeTrees([transpiledNodeModuleTree]);
