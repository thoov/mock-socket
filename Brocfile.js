/* eslint-disable no-var */
var babel = require('broccoli-babel-transpiler');
var mergeTrees = require('broccoli-merge-trees');
var Funnel = require('broccoli-funnel');

/*
  Node Module

  supports:
   - require('mock-socket').WebSocket
   - require('mock-socket/dist/websocket');
   - require('mock-socket/dist/server');
   - require('mock-socket/dist/socket-io');
*/

var transpiledAMDTree = babel('src', {
  stage: 0,
  moduleIds: true,
  modules: 'amd'
});

var AMDTree = new Funnel(transpiledAMDTree, {
  destDir: 'amd'
});

var transpiledCommonJSTree = babel('src');

module.exports = mergeTrees([transpiledCommonJSTree, AMDTree]);
