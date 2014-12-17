# Mock Socket

A javascript mocking library for WebSockets. This library aims to make testing websocket applications as simple and
painless as possible. Inspired by [fakehr](https://github.com/trek/fakehr).

**Note:** This is currently in beta and is still a work in progress

[![Build Status](https://travis-ci.org/thoov/mock-socket.svg?branch=master)](https://travis-ci.org/thoov/mock-socket)

## Installation

```shell
bower install mock-socket --save-dev
```

Then include the dist file into your application:
```shell
bower_components/mock-socket/dist/mock-socket.min.js
```

**Note:** The package is also on npm.

## Simple Example

Here is an example of how to start using mock-sockets inside of your test suite. Below is
a qunit test but this could easily be incorporated into most suites:

```js
// Set the global WebSocket object to our MockSocket object. This allows us to do new WebSocket and
// create a MockSocket object insteaf of a native WebSocket object.
window.WebSocket = MockSocket;

// NOTE: you must create a new MockServer before you create a new WebSocket object. It is a good idea to place this
// logic either at the top of your test or in a setup function.
var mockServer = new MockServer();
mockServer.on('connection', function(server) {
    server.on('message', function(data) {
        server.send('hello');
    });
});

module('Simple Test');

asyncTest('basic test', function(){
    // This is creating a MockSocket object and not a WebSocket object
    var mockSocket = new WebSocket('ws://www.example.com/socketserver');
    expect(2);

    mockSocket.onopen = function(e) {
        equal(true, true, 'onopen fires as expected');
    };

    mockSocket.onmessage = function(data) {
        equal(true, true, 'onmessage fires as expected');
        start();
    };

    mockSocket.send('world');
});
```

**Note:** It is good practice to reset the global WebSocket object back to its original object after your tests have finished.

## Background

MockSocket is comprised of 2 main parts. A mock "server" object and a mock "WebSockets" object. In this section
I will explain both of these parts.

**Mock Sockets Server:**
This library adds a global object called `MockServer` which you can use to create a fake socket server instance. Here
is where you would "mock" your server side application logic. Below is an example of this in action:

```js
var mockServer = new MockServer('ws://localhost:8080');
mockServer.on('connection', function(server) {

    server.on('message', function(data) {
        server.send('hello');
    });

});
```

**Note:** This should look very familiar if you are using a node framework such as [ws](https://github.com/einaros/ws).

**Mock Sockets:**
The second main part is another global variable called `MockSocket`. This is a drop in replacement for the standard [WebSockets
global](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket).

```js
window.WebSockets = MockSocket;

// Anything referencing WebSockets will now use the MockSocket object and
// will communicate with the WebSocketServer.
var mockSocket = new WebSocket('ws://localhost:8080');

mockSocket.onopen = function(e) {
    this.send('some data'); // this will trigger the mock server's on message callback
};
mockSocket.onmessage = function(e) {
    var data = e.data; // the message is stored in the event's data property
};
mockSocket.onclose = function(e) {};
mockSocket.onerror = function(e) {};
```

## Building from source

* `git clone git@github.com:thoov/mock-socket.git`
* `cd mock-socket`
* `npm install`
* `gulp`

**Note:** If you make any changes to the src files you will need to run gulp to generate the new
dist files

## Running tests

* `git clone git@github.com:thoov/mock-socket.git`
* `cd mock-socket`
* `npm install`
* `npm t`

**Note:** If you make any changes to the src files you will need to run gulp to generate the new
dist files

## Feedback or issues

If you have any feedback, encounter any bugs, or just have a question, please feel free to create a [github issue](https://github.com/thoov/mock-socket/issues/new) or send me a tweet at [@thoov](https://twitter.com/thoov).

## FAQ

* **License**: Mock Socks falls under the [MIT license](https://github.com/thoov/mock-socket/blob/master/LICENSE.txt)
