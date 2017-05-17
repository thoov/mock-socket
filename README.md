<p align="center">
  <img width=600 src="http://imgur.com/Xt9X83M.png">
</p>

<p align="center">
Javascript mocking library for <a href="https://developer.mozilla.org/en-US/docs/WebSockets">websockets</a> and <a href="http://socket.io/">socket.io</a>
</p>

<p align="center">
  <a href="https://travis-ci.org/thoov/mock-socket">
    <img src="https://travis-ci.org/thoov/mock-socket.svg?branch=master" alt="Build Status">
  </a>
  <a href="https://codeclimate.com/github/thoov/mock-socket/coverage">
    <img src="https://codeclimate.com/github/thoov/mock-socket/badges/coverage.svg" alt="Code Coverage">
  </a>
  <a href="https://codeclimate.com/github/thoov/mock-socket">
    <img src="https://codeclimate.com/github/thoov/mock-socket/badges/gpa.svg" alt="Code GPA">
  </a>
  <a href="http://badge.fury.io/js/mock-socket">
    <img src="https://badge.fury.io/js/mock-socket.svg" alt="NPM Version">
  </a>
</p>

## Installation

```shell
yarn add mock-socket --dev
```

## Usage

To use within a node environment you can simply import or require the files directly. This
option is great for phantomjs or CI environments.

```js
import { WebSocket, Server, SocketIO } from 'mock-socket';

// OR

const mockServer = require('mock-socket').Server;
const socketIO = require('mock-socket').SocketIO;
const mockWebSocket = require('mock-socket').WebSocket;
```

## Native WebSocket Example

```js
// chat.js
function Chat() {
  const chatSocket = new WebSocket('ws://localhost:8080');
  this.messages = [];

  chatSocket.onmessage = (event) => {
    this.messages.push(event.data);
  };
}
```

```js
// chat-test.js
import { Server } from 'mock-socket';

describe('Chat Unit Test', () => {
  it('basic test', (done) => {
    const mockServer = new Server('ws://localhost:8080');
    mockServer.on('connection', server => {
      mockServer.send('test message 1');
      mockServer.send('test message 2');
    });

    // Now when Chat tries to do new WebSocket() it
    // will create a MockWebSocket object \
    var chatApp = new Chat();

    setTimeout(() => {
      const messageLen = chatApp.messages.length;
      assert.equal(messageLen, 2, '2 messages where sent from the s server');

      mockServer.stop(done);
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
import { SocketIO, Server } from 'mock-socket';

describe('Chat Unit Test', () => {
  it('basic test', (done) => {
    const mockServer = new Server('http://localhost:8080');
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
    window.io = SocketIO;

    // Now when Chat tries to do io() or io.connect()
    // it will use MockSocketIO object
    var chatApp = new Chat();

    setTimeout(() => {
      const messageLen = chatApp.messages.length;
      assert.equal(messageLen, 2, '2 messages where sent from the server');
      mockServer.stop(done);
    }, 100);
  });
});
```

## Working with the source code

### Local builds
The easiest way to work on the project is to clone the repo down via:

```shell
git clone git@github.com:thoov/mock-socket.git
cd mock-socket
yarn
```
Then to create a local build via:

```shell
yarn build
```

Then create a local npm link via:

```shell
yarn link
```

At this point you can create other projects / apps locally and reference this local build via:

```shell
yarn link mock-socket
```

from within your other projects folder. Make sure that after any changes you run `yarn build`!

### Tests
This project uses mocha as its test framework. Tests are located in /test and have 1 of 3 file name prefixes (functional-, issue-#, or unit-).

```shell
yarn test
```

### Linting

This project uses eslint and a rules set from [airbnb's javascript style guides](https://github.com/airbnb/javascript). To run linting:

```shell
yarn lint
```

### Formatting

This project uses prettier with --single-quote and --print-width 120. To run the formatting:

```shell
yarn format
```


### Code Coverage

Code coverage reports are created in /coverage after all of the tests have successfully passed. To run the coverage:

```shell
yarn test:coverage
```

## Feedback / Issues

If you have any feedback, encounter any bugs, or just have a question, please feel free to create a [github issue](https://github.com/thoov/mock-socket/issues/new) or send me a tweet at [@thoov](https://twitter.com/thoov).
