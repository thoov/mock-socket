# Mock Socket

A javascript mocking library for [websockets](https://developer.mozilla.org/en-US/docs/WebSockets). This library aims to make testing websocket applications in the bowser or phantomjs as simple as possible.

[![Build Status](https://travis-ci.org/thoov/mock-socket.svg?branch=master)](https://travis-ci.org/thoov/mock-socket)
[![Code Climate](https://codeclimate.com/github/thoov/mock-socket/badges/gpa.svg)](https://codeclimate.com/github/thoov/mock-socket)
[![npm version](https://badge.fury.io/js/mock-socket.svg)](http://badge.fury.io/js/mock-socket)

## Installation

```shell
bower install mock-socket
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

## Building from source

```shell
git clone git@github.com:thoov/mock-socket.git
cd mock-socket
npm i
npm run build
```

## Running tests

### 1) Via PhantomJS 2.0+

Simply run:

```shell
npm test
```

**NOTE:** that this only works in PhantomJS 2.0+.

### 2) Via the browser

```shell
  npm run browser
```

Then visit: [http://localhost:7357/](http://localhost:7357/) in your browser.

### 3) Manual tests

The point of the manual tests are to compare a MockWebSocket object vs the native WebSocket object.
Running the below command brings up a blank webpage that has both a MockWebSocket object and a
Native WebSocket object define with debuggers in place so you can quickly start debugging any inconsistencies.

```shell
  npm start
```

Then visit: [http://localhost:4200](http://localhost:4200) in your browser.

## Feedback / Issues

If you have any feedback, encounter any bugs, or just have a question, please feel free to create a [github issue](https://github.com/thoov/mock-socket/issues/new) or send me a tweet at [@thoov](https://twitter.com/thoov).
