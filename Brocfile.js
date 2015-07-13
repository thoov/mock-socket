var funnel           = require('broccoli-funnel');
var uglifyJavaScript = require('broccoli-uglify-js');
var mergeTrees       = require('broccoli-merge-trees');
var fastBrowserify   = require('broccoli-fast-browserify');
var esTranspiler     = require('broccoli-babel-transpiler');

/*
* Convert all of the src files into es5 and then browserify them to be
* used within the browser.
*/
var srcVendorPackage = mergeTrees([
  // Load all of the src files
  funnel('src', { destDir: '/src'}),
  funnel('node_modules/URIjs/src', { include: ['URI.min.js', 'punycode.js', 'IPv6.js', 'SecondLevelDomains.js', 'URI.js'], destDir: '/'})
]);
var es5SrcTree = esTranspiler(srcVendorPackage, {
  resolveModuleSource: function(source, filepath) {
    switch(source) {
      case 'urijs':
        var arrayOfNestedDirs = filepath.split('/');

        if(arrayOfNestedDirs.length === 1) { return './URI.min.js'; }

        // for each nested dir we place a ../ infront of qunit.js
        return arrayOfNestedDirs.map(function() { return '../'; }).slice(0, -1).join('') + 'URI.min.js';

      default:
        return source;
    }
  }
});
var browserifiedSrcTree = fastBrowserify(es5SrcTree, {
  bundles: {
    'mock-socket.js': {
      entryPoints: ['**/main.js']
    }
  }
});

/*
* Take the browserified file and minify / uglify it.
*/
var uglyTree = funnel(uglifyJavaScript(browserifiedSrcTree), {
  destDir: '/',
  getDestinationPath: function() {
    return 'mock-socket.min.js';
  }
});

/*
* TestPackage is a collection of all the needed files for the tests to run. This includes
* the source files, the test files, and the test loader.
*/
var testPackage = mergeTrees([
  // Load all of the src files
  funnel('src', { destDir: '/src'}),

  // Load all of the test files (ie: all files ending with -test.js)
  funnel('tests', { include: ['*-test.js', 'test-loader.js'], destDir: '/'}),
  funnel('tests/bug-reports', { include: ['*-test.js'], destDir: '/bug-reports'})
]);

/*
* Convert all test files to es5 and allow lookups for 3rd party files
*/
var es5TestTree = esTranspiler(testPackage, {
  resolveModuleSource: function(source, filepath) {
    switch(source) {
      case 'qunit':
        var arrayOfNestedDirs = filepath.split('/');

        if(arrayOfNestedDirs.length === 1) { return './qunit.js'; }

        // for each nested dir we place a ../ infront of qunit.js
        return arrayOfNestedDirs.map(function() { return '../'; }).slice(0, -1).join('') + 'qunit.js';

      default:
        return source;
    }
  }
});

/*
* Collection of all files including test files in es5 and vendor files
*/
var es5TestFullTree = mergeTrees([
  es5TestTree,

  // Load all vendor files needed
  funnel('node_modules/qunitjs/qunit', { include: ['qunit.js'], destDir: '/'})
]);

/*
* Browserify the tests so that they can be run via testem's index.html file. The test-loader's
* job is to include the src files at the top then to include the test modules.
*/
var browserifiedTestTree = fastBrowserify(es5TestFullTree, {
  bundles: {
    'tests.js': {
      entryPoints: ['test-loader.js']
    }
  }
});

module.exports = mergeTrees([browserifiedSrcTree, uglyTree, browserifiedTestTree]);
