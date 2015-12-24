/* eslint-disable no-var, object-shorthand */
var funnel = require('broccoli-funnel');
var uglify = require('broccoli-uglify-js');
var babel = require('broccoli-babel-transpiler');
var mergeTrees = require('broccoli-merge-trees');
var browserify = require('broccoli-fast-browserify');

/*
  Node Module

  supports:
   - require('mock-socket').WebSocket
   - require('mock-socket/dist/websocket');
   - require('mock-socket/dist/server');
   - require('mock-socket/dist/socket-io');
*/

var transpiledNodeModuleTree = babel('src');

/*
  Browser Module

  supports:
   - <script src="./node_modules/mock-socket/dist/mock-socket.min.js"></script>
   - window.MockServer
   - window.MockWebSocket
   - window.MockSocketIO
*/
var transpiledBrowserTree = babel('src');

var browserifiedSourceTree = browserify(transpiledBrowserTree, {
  browserify: { debug: true },
  bundles: { 'mock-socket.js': { entryPoints: ['**/main.js'] } },
});

var minifiedBrowserTree = uglify(funnel(browserifiedSourceTree, {
  include: ['mock-socket.js'],
  getDestinationPath: function destinationPath() {
    return 'mock-socket.min.js';
  },
}));

/*
  Test Module

  supports:
     - <script src="./node_modules/mock-socket/dist/tests.js"></script>
     - window.MockServer
     - window.MockWebSocket
     - window.MockSocketIO
*/
var transpiledTestTree = babel(mergeTrees([
  funnel('src', { destDir: '/src' }),
  funnel('test', { destDir: '/test' }),
]));

var browserifedTestTree = browserify(transpiledTestTree, {
  bundles: { 'tests.js': { entryPoints: ['**/test-loader.js'] } },
});

module.exports = mergeTrees([
  transpiledNodeModuleTree,
  browserifiedSourceTree,
  minifiedBrowserTree,
  browserifedTestTree,
]);
