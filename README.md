# Mock Socket

A javascript mocking library for [websockets](https://developer.mozilla.org/en-US/docs/WebSockets). This library aims to make testing websocket applications in the bowser or phantomjs as simple as possible.

[![Build Status](https://travis-ci.org/thoov/mock-socket.svg?branch=master)](https://travis-ci.org/thoov/mock-socket)
[![Code Climate](https://codeclimate.com/github/thoov/mock-socket/badges/gpa.svg)](https://codeclimate.com/github/thoov/mock-socket)

## Installation

```shell
bower install mock-socket --save-dev # or npm i mock-socket --save-dev
```

Then include the dist file into your application:
```html
<script src="bower_components/mock-socket/dist/mock-socket.min.js"></script>
```

## Example
```js
/*
* Here is a very simple app
*/
function Chat() {
  var chatSocket = new WebSocket('ws://localhost:8080');
  this.messages = [];

  chatSocket.onmessage = event => {
    this.messages.push(event.data);
  };
}

/*
* Below here is a simple test for the above app
*/

window.WebSocket = MockWebSocket;

test('basic test', function(){
  assert.expect(2);
  var done = assert.async();

  // NOTE: you must create a new MockServer before you create a new MockSocket object.
  var mockServer = new MockServer('ws://localhost:8080');
  mockServer.on('connection', function(server) {
    mockServer.send('test message 1');
    mockServer.send('test message 2');
  });

  // Note that instead of creating a native websocket object this will instead create
  // a MockWebSocket object because we did: window.WebSocket = MockWebSocket; in the setup function
  var chatApp = new Chat();

  setTimeout(function() {
    assert.equal(chatApp.messages.length, 2, '2 test messages where sent from the mock server');
    done();
  }, 100);
});
```

### Building from source

```shell
git clone git@github.com:thoov/mock-socket.git
cd mock-socket
npm i
npm i -g broccoli-cli
npm run serve # this will auto build the project when you change the files
```

### Running test

```shell
npm test
```

Or you can open the tests/index.html file in a browser to view the tests as well.

**NOTE:** If you make any changes to the src files you will need to run `npm run build` to generate the new
dist files

### Feedback / Issues

If you have any feedback, encounter any bugs, or just have a question, please feel free to create a [github issue](https://github.com/thoov/mock-socket/issues/new) or send me a tweet at [@thoov](https://twitter.com/thoov).

### FAQ

* **LICENSE**: This library falls under the [MIT license](https://github.com/thoov/mock-socket/blob/master/LICENSE.txt)
