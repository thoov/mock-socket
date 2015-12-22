# Mock Socket

Javascript mocking library for [websockets](https://developer.mozilla.org/en-US/docs/WebSockets) and [socket.io](http://socket.io/)

[![Build Status](https://travis-ci.org/thoov/mock-socket.svg?branch=master)](https://travis-ci.org/thoov/mock-socket)
<a href="https://codeclimate.com/github/thoov/mock-socket/coverage"><img src="https://codeclimate.com/github/thoov/mock-socket/badges/coverage.svg" /></a>
[![Code Climate](https://codeclimate.com/github/thoov/mock-socket/badges/gpa.svg)](https://codeclimate.com/github/thoov/mock-socket)
[![npm version](https://badge.fury.io/js/mock-socket.svg)](http://badge.fury.io/js/mock-socket)

## Installation

```shell
npm install mock-socket
```

## Usage

To use within a node environment you can simply import or require the files directly. This
option is great for phatomjs or CI environments.

```js
var mockWebSocket = require('mock-socket/dist/websocket');
var mockServer = require('mock-socket/dist/server');

// var socketIO = require('mock-socket/dist/socket-io');
```

To use within a browser environment you can include the bundled script file directly onto your
page and reference the global objects from there.

```html
<script src="./node_modules/mock-socket/dist/mock-socket.min.js"></script>
<script>
// window.MockServer
// window.MockWebSocket
// window.MockSocketIO
</script>
```

## Native WebSocket Example
```js
// chat.js
function Chat() {
  const chatSocket = new WebSocket('ws://localhost:8080');
  this.messages = [];

  chatSocket.onmessage = event => {
    this.messages.push(event.data);
  };
}
```

```js
// chat-test.js
import MockServer from 'mock-socket/server';
import MockWebSocket from 'mock-socket/websocket';

describe('Chat Unit Test', function() {
  it('basic test', done => {
    const mockServer = new MockServer('ws://localhost:8080');
    mockServer.on('connection', server => {
      mockServer.send('test message 1');
      mockServer.send('test message 2');
    });

    /*
      This step is very important! It tells our chat app to use the mocked
      websocket object instead of the native one. The great thing
      about this is that our actual code did not need to change and
      thus is agnostic to how we test it.
    */
    window.WebSocket = MockWebSocket;

    // Now when Chat tries to do new WebSocket() it
    // will create a MockWebSocket object
    var chatApp = new Chat();

    setTimeout(() => {
      const messageLen = chatApp.messages.length;
      assert.equal(messageLen, 2, '2 messages where sent from the s server');
      done();
    }, 100);
  });
});
```

## Socket.IO Example

```js
// chat.js
function Chat() {
  const chatSocket = new io('http://localhost:8080');
  this.messages = [];

  socket.on('chat-message', data => {
    this.messages.push(data);
  };
}
```

```js
// chat-test.js
import MockServer from 'mock-socket/server';
import MockIO from 'mock-socket/socket-io';

describe('Chat Unit Test', function() {
  it('basic test', done => {
    const mockServer = new MockServer('http://localhost:8080');
    mockServer.on('connection', server => {
      mockServer.emit('chat-message', 'test message 1');
      mockServer.emit('chat-message', 'test message 2');
    });

    /*
      This step is very important! It tells our chat app to use the mocked
      websocket object instead of the native one. The great thing
      about this is that our actual code did not need to change and
      thus is agnostic to how we test it.
    */
    window.io = MockIO;

    // Now when Chat tries to do io() or io.connect()
    // it will use MockSocketIO object
    var chatApp = new Chat();

    setTimeout(() => {
      const messageLen = chatApp.messages.length;
      assert.equal(messageLen, 2, '2 messages where sent from the server');
      done();
    }, 100);
  });
});
```

## Working with the source code

### Local builds
The easiest way to work on the project is to clone the repo down via:

```shell
git clone git@github.com:thoov/mock-socket.git; cd mock-socket; npm i
```
Then to create a local build via:

```shell
npm run build
```

Then create a local npm link via:

```shell
npm link
```

At this point you can create other projects / apps locally and reference this local build via:

```shell
npm link mock-socket
```

from within your other projects folder. Make sure that after any changes you run `npm run build`!

### Tests
This project uses mocha as its test framework. Tests are located in /test and have 1 of 3 file name prefixes (functional-, issue-#, or unit-). If you create a new test make sure that you add it to /test/helpers/test-loader.js.

```shell
npm test
```

### Linting

This project uses eslint and a rules set from [airbnb's javascript style guides](https://github.com/airbnb/javascript). To run linting:

```shell
npm run lint
```

### Code Coverage

Code coverage reports are created in /coverage after all of the tests have successfully passed.

## Feedback / Issues

If you have any feedback, encounter any bugs, or just have a question, please feel free to create a [github issue](https://github.com/thoov/mock-socket/issues/new) or send me a tweet at [@thoov](https://twitter.com/thoov).
