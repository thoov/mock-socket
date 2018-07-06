<p align="center">
  <img width=600 src="http://imgur.com/Xt9X83M.png">
</p>

<p align="center">
Javascript mocking library for <a href="https://developer.mozilla.org/en-US/docs/WebSockets">websockets</a> and <a href="http://socket.io/">socket.io</a>
</p>

<p align="center">
  <a href="https://travis-ci.org/thoov/mock-socket">
    <img src="https://img.shields.io/travis/thoov/mock-socket.svg?style=for-the-badge" alt="Build Status">
  </a>
  <a href="https://github.com/thoov/mock-socket/blob/master/LICENSE.txt">
    <img src="https://img.shields.io/github/license/thoov/mock-socket.svg?style=for-the-badge" alt="Code Coverage">
  </a>
  <a href="https://www.npmjs.com/package/mock-socket">
    <img src="https://img.shields.io/npm/v/mock-socket.svg?style=for-the-badge" alt="NPM Version">
  </a>
</p>

## Contents

- [Installation](#installation)
- [Basic Usage](#usage)
- [Advanced Usage](#advanced-usage)
- [Typescript Support](#typescript-support)
- [Socket.IO](#socket-io)
- [Contributing](#contributing)
- [Feedback](#feedback)

## Installation

```shell
npm install mock-socket
```

To use within a node environment you can simply import or require the files directly. This
option is great for phantomjs or CI environments.

```js
import { WebSocket, Server } from 'mock-socket';
```

## Usage

```js
import test from 'ava';
import { Server } from 'mock-socket';

class ChatApp {
  constructor(url) {
    this.messages = [];
    this.connection = new WebSocket(url);
    
    this.connection.onmessage = (event) => {
      this.messages.push(event.data);
    };
    
    this.connection.onclose = (event) => {
      this.messages = [];
    };
  }
  
  sendMessage(message) {
    this.connection.send(message);
  }
}

test.cb('that chat app can be mocked', t => {
  const fakeURL = 'ws://localhost:8080';
  const mockServer = new Server(fakeURL);
  
  mockServer.on('connection', socket => {
    socket.on('message', data => {
      t.is(data, 'test message from app', 'we have intercepted the message and can assert on it');
      socket.send('test message from mock server');
    });
  });
  
  const app = new ChatApp(fakeURL);
  app.sendMessage('test message 1'); // NOTE: this line creates a micro task
  
  // NOTE: this timeout is for creating another micro task
  setTimeout(() => {  
	  t.is(app.messages.length, 1);
    t.is(app.messages[0], 'test message from mock server', 'we have subbed our websocket backend');
    
    // This will send a `close` event
    mockServer.stop(() => {
      t.is(app.messages.length, 0);
      t.done();
    });
  }, 0);
});
```

## Advanced Usage

### Stubbing the "global"

```js
import { WebSocket, Server } from 'mock-socket';

/*
 * By default the global WebSocket object is stubbed out. However, 
 * if you need to stub something else out you can like so:
 */
 
window.WebSocket = WebSocket; // Here we stub out the window object
```

### Server Methods

```js
const mockServer = new Server('ws://localhost:8080');
  
mockServer.on('connection', socket => {
  socket.on('message', () => {});
  socket.on('close', () => {});
  
  socket.send('message');
  socket.close();
});

mockServer.clients() // array of all connected clients
mockServer.emit('room', 'message');
mockServer.stop(optionalCallback);
```
## Typescript Support

A [declaration file](https://github.com/thoov/mock-socket/blob/master/index.d.ts) is included by default. If you notice any issues with the types please create an issue or a PR!

## Socket IO

[Socket.IO](https://socket.io/) has **limited support**. Below is a similar example to the one above but modified to show off socket.io support.

```js
import test from 'ava';
import { SocketIO, Server } from 'mock-socket';

class ChatApp {
  constructor(url) {
    this.messages = [];
    this.connection = new io(url);
    
    this.connection.on('chat-message', data => {
      this.messages.push(event.data);
    };
  }
  
  sendMessage(message) {
    this.connection.emit('chat-message', message);
  }
}

test.cb('that socket.io works', t => {
  const fakeURL = 'ws://localhost:8080';
  const mockServer = new Server(fakeURL);
  
  window.io = SocketIO;
  
  mockServer.on('connection', socket => {
    socket.on('chat-message', data => {
      t.is(data, 'test message from app', 'we have intercepted the message and can assert on it');
      socket.emit('chat-message', 'test message from mock server');
    });
  });
  
  const app = new ChatApp(fakeURL);
  app.sendMessage('test message from app');
  
  setTimeout(() => {
    t.is(app.messages.length, 1);
    t.is(app.messages[0], 'test message from mock server', 'we have subbed our websocket backend');
    
    mockServer.stop();
  }, 100);
});
```

## Contributing

The easiest way to work on the project is to clone the repo down via:

```shell
git clone git@github.com:thoov/mock-socket.git
cd mock-socket
yarn install
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
This project uses [ava.js](https://github.com/avajs/ava) as its test framework. Tests are located in /tests. To run tests:

```shell
yarn test
```

### Linting

This project uses eslint and a rules set from [airbnb's javascript style guides](https://github.com/airbnb/javascript). To run linting:

```shell
yarn lint
```

### Formatting

This project uses [prettier](https://github.com/prettier/prettier). To run the formatting:

```shell
yarn format
```

### Code Coverage

Code coverage reports are created in /coverage after all of the tests have successfully passed. To run the coverage:

```shell
yarn test:coverage
```

## Feedback

If you have any feedback, encounter any bugs, or just have a question, please feel free to create a [github issue](https://github.com/thoov/mock-socket/issues/new) or send me a tweet at [@thoov](https://twitter.com/thoov).
