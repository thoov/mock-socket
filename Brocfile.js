var funnel           = require('broccoli-funnel');
var uglifyJavaScript = require('broccoli-uglify-js');
var mergeTrees       = require('broccoli-merge-trees');
var fastBrowserify   = require('broccoli-fast-browserify');
var esTranspiler     = require('broccoli-babel-transpiler');

var es5SrcTree = esTranspiler('src');
var browserifiedTree = fastBrowserify(es5SrcTree, {
  bundles: {
    'mock-sockets.js': {
      entryPoints: ['**/main.js']
    }
  }
});

var uglyTree = funnel(uglifyJavaScript(browserifiedTree), {
  destDir: '/',
  getDestinationPath: function() {
    return 'mock-sockets.min.js';
  }
});

/*
* First is to convert all tests from es2015 to es5.
* Second is to then browserify the main.js file which includes all of the tests
*/
var allTests = mergeTrees([
  // Load all vendor files needed
  funnel('node_modules/qunitjs/qunit', { include: ['qunit.js'], destDir: '/'}),

  // Load all of the src files
  funnel('src', { destDir: '/src'}),

  // Load all of the test files (ie: all files ending with -test.js)
  funnel('tests', { include: ['*-test.js', 'test-loader.js'], destDir: '/'}),
  funnel('tests/bug-reports', { include: ['*-test.js'], destDir: '/bug-reports'})
]);

var es5TestTree = esTranspiler(allTests, {
  blacklist: ['useStrict'],
  resolveModuleSource: function(source, file) {
    switch(source) {
      case 'qunit':
        var parts = file.split('/');

        if(parts.length === 1) {
          return './qunit.js';
        }

        // TODO: support more than one level
        return '../qunit.js';

      default:
        return source;
    }
  }
});

var browserifiedTestTree = fastBrowserify(es5TestTree, {
  bundles: {
    'test.js': {
      entryPoints: ['test-loader.js']
    }
  }
});

module.exports = mergeTrees([browserifiedTree, uglyTree, browserifiedTestTree]);
