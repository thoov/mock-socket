import fs from 'fs';
import test from 'ava';
import path from 'path';
import jsdom from 'jsdom';

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

test.skip('the dist package can be loaded via a AMD loader like requireJS', (t) => {
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
        t.true(false, 'error initializing jsdom');
      }

      // console.log(window.require.s.contexts._.defined);
      t.is(window.document.getElementById('amd-loader').innerHTML, successfullyLoaded);
    }
  });
});

test.cb('the dist package correctly sets up the globals', (t) => {
  const mockSocket = fs.readFileSync(
    path.resolve(__dirname, '../../dist/mock-socket.js'), 'utf-8'
  );

  jsdom.env({
    src: [mockSocket],
    html: `
      <div></div>
    `,
    done: (err, window) => {
      if (err) {
        t.true(false, 'error initializing jsdom');
        t.end();
      }

      if (!window.Mock || !window.Mock.Server) {
        t.true(false, 'mock server was not found as a global');
      }

      if (!window.Mock || !window.Mock.WebSocket) {
        t.true(false, 'mock websocket was not found as a global');
      }

      if (!window.Mock || !window.Mock.SocketIO) {
        t.true(false, 'mock socketio was not found as a global');
      }

      t.end();
    }
  });
});
