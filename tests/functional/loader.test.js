import fs from 'fs';
import path from 'path';
import jsdom from 'jsdom';
import assert from 'assert';

const successfullyLoaded = 'loaded-amd-succesfully';
const failedToLoad = 'loaded-amd-failed';

function amdLoader() {
  return `
    requirejs(["dist/main"], function(mockSocket) {
      // TODO if things are loaded correctly write some value to the dom

      console.log('here');

      document.getElementById("amd-loader").innerHTML = '${failedToLoad}';

      if (mockSocket) {
        document.getElementById("amd-loader").innerHTML = '${successfullyLoaded}';
      }
    });
  `;
}

describe('Loader - AMD & Globals', () => {
  it.skip('the dist package can be loaded via a AMD loader like requireJS', (done) => {
    const requireJS = fs.readFileSync(
      path.resolve(
        __dirname,
        '../../node_modules/requirejs/require.js'
      ),
      'utf-8'
    );

    const mockSocket = fs.readFileSync(
      path.resolve(
        __dirname,
        '../../dist/main.js'
      ),
      'utf-8'
    );

    jsdom.env({
      html: `
        <div id="amd-loader"></div>
      `,
      src: [
        requireJS,
        mockSocket,
        amdLoader()
      ],
      done: (err, window) => {
        if (err) {
          assert.ok(false, 'error initializing jsdom');
        }

        // console.log(window.require.s.contexts._.defined);
        assert.equal(window.document.getElementById('amd-loader').innerHTML, successfullyLoaded);
      }
    });
  });

  it.skip('the dist package and be loaded via a AMD loader like requireJS', (done) => {
    const requireJS = fs.readFileSync(
      path.resolve(
        __dirname,
        '../../node_modules/requirejs/require.js'
      ),
      'utf-8'
    );

    const mockSocket = fs.readFileSync(
      path.resolve(
        __dirname,
        '../../dist/main.js'
      ),
      'utf-8'
    );

    jsdom.env({
      src: [mockSocket],
      done: (err, window) => {
        if (err) {
          assert.ok(false, 'error initializing jsdom');
        }

        if (!window.Mock || !window.Mock.MockServer) {
          assert.ok(false, 'mock server was not found as a global');
        }
      }
    });
  });
});
