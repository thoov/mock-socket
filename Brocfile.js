var funnel            = require('broccoli-funnel');
var uglifyJavaScript  = require('broccoli-uglify-js');
var mergeTrees        = require('broccoli-merge-trees');
var moduleLookupHash  = require('./helpers/module-lookup');
var fastBrowserify    = require('broccoli-fast-browserify');
var babelTransform    = require('broccoli-babel-transpiler');
var pathNormalization = require('./helpers/module-path-normalization');

var thirdPartyLibaries = mergeTrees([
  funnel('node_modules/URIjs/src', {
    include: [
      'punycode.js',
      'IPv6.js',
      'SecondLevelDomains.js',
      'URI.js'
    ],
    destDir: '/'}),

  funnel('node_modules/qunitjs/qunit', { include: ['qunit.js'], destDir: '/'})
]);

var testFiles = mergeTrees([
  // Load all of the test files (ie: all files ending with -test.js)
  funnel('tests', { include: ['*-test.js', 'test-loader.js'], destDir: '/'}),
  funnel('tests/bug-reports', { include: ['*-test.js'], destDir: '/bug-reports'})
]);

var completeTree = mergeTrees([
  thirdPartyLibaries,
  funnel('src', { destDir: '/src'}),
  testFiles
]);

var es5Tree = babelTransform(completeTree, {
  blacklist: ['useStrict'],
  resolveModuleSource: function(source, filepath) {
    if(moduleLookupHash[source]) {
      return pathNormalization(filepath) + moduleLookupHash[source].filename;
    }

    return source;
  }
});

var browserifiedTree = fastBrowserify(es5Tree, {
  bundles: {
    'mock-socket.js': { entryPoints: ['**/main.js'] },
    'tests.js': { entryPoints: ['test-loader.js'] }
  }
});

var minifiedTree = uglifyJavaScript(funnel(browserifiedTree, {
  include: ['mock-socket.js'],
  getDestinationPath: function() {
    return 'mock-socket.min.js';
  }
}));

module.exports = mergeTrees([browserifiedTree, minifiedTree]);
