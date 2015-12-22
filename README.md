# Mock Socket

A javascript mocking library for [websockets](https://developer.mozilla.org/en-US/docs/WebSockets). This library aims to make testing websocket applications in the bowser or phantomjs as simple as possible.

[![Build Status](https://travis-ci.org/thoov/mock-socket.svg?branch=master)](https://travis-ci.org/thoov/mock-socket)
[![Code Climate](https://codeclimate.com/github/thoov/mock-socket/badges/gpa.svg)](https://codeclimate.com/github/thoov/mock-socket)
[![npm version](https://badge.fury.io/js/mock-socket.svg)](http://badge.fury.io/js/mock-socket)
[![bower version](https://img.shields.io/bower/v/mock-socket.svg)](https://img.shields.io/bower/v/mock-socket.svg)

## Installation

```shell
bower install mock-socket

or

npm install mock-socket
```


## Usage

To use within a node environment you can simply import or require the files directly. This
option is great for CI tests.

```js
var mockWebSocket = require('mock-socket/websocket');
var mockServer = require('mock-socket/server');

// var socketIO = require('mock-socket/socket-io');
```

To use within a browser environment you can include the bundled script file directly onto your
page and reference the global objects.

```html
<script src="./node_modules/mock-socket/mock-socket.min.js"></script>
<script>
  // window.MockServer
  // window.MockWebSocket
  // window.MockSocketIO
</script>
```

## Example
```js
function Chat() {
  var chatSocket = new WebSocket('ws://localhost:8080');
  this.messages = [];

  chatSocket.onmessage = event => {
    this.messages.push(event.data);
  };
}

test('basic test', function(){
  assert.expect(1);
  var done = assert.async();

  var mockServer = new MockServer('ws://localhost:8080');
  mockServer.on('connection', function(server) {
    mockServer.send('test message 1');
    mockServer.send('test message 2');
  });

  window.WebSocket = MockWebSocket;
  var chatApp = new Chat(); // Now when Chat tries to do new WebSocket it will create a MockWebSocket object

  setTimeout(function() {
    assert.equal(chatApp.messages.length, 2, '2 test messages where sent from the mock server');
    done();
  }, 100);
});
```

## Working with the source code

// TODO

## Feedback / Issues

If you have any feedback, encounter any bugs, or just have a question, please feel free to create a [github issue](https://github.com/thoov/mock-socket/issues/new) or send me a tweet at [@thoov](https://twitter.com/thoov).
