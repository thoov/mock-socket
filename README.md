# Mock Socket

A javascript mocking library for [websockets](https://developer.mozilla.org/en-US/docs/WebSockets). This library aims to make testing websocket applications in the bowser, in phantomjs, or even in nodejs as simple as possible.


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

## Background

This library is comprised of 2 main parts. A mock "server" object called **MockServer** and a mock "WebSockets" object
called **MockSocket**. It is with these 2 mock objects that we are able to test the actual business logic of our code.

### MockServer

MockServer is a global object which you can use to create a fake websocket server instance. Here
is where you would "mock" your server side application logic. Below is an example of this in action:

```js
var mockServer = new MockServer('ws://localhost:8080');
mockServer.on('connection', function(server) {

    server.on('message', function(data) {
        server.send('hello');
    });
});
```

**NOTE:** This should look very familiar if you are using a node framework such as [ws](https://github.com/einaros/ws).

### MockSocket

MockSocket is a drop in replacement for the standard [WebSockets global](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
found in all browsers. The goal is to be able to do the following and not notice anything different:

```js
window.WebSockets = MockSocket;
```

Notice that if our application uses WebSocket it will instead start to use the mock object.
This is what allows us to test how our application handles events from the socket instead of stubbing
out the code that interacts with the socket.

```js
// Anything referencing WebSockets will now use the MockSocket object and
// will communicate with the MockSocket server.
window.WebSockets = MockSocket;
var mockSocket = new WebSocket('ws://localhost:8080');

mockSocket.onopen = function(e) {
    // this will trigger the mock server's on message callback
    this.send('some data');
};
mockSocket.onmessage = function(e) {
    var data = e.data; // the message is stored in the event's data property
};
mockSocket.onclose = function(e) {};
mockSocket.onerror = function(e) {};
```

## Examples

### Browser / PhantomJS

Here is an example of how to start using mock-sockets inside of your test suite running in the browser or in PhantomJS. Below is
a qunit test but this could easily be incorporated into most suites:

```js
// Set the global WebSocket object to our MockSocket object. This allows us to
// do: new WebSocket and create a MockSocket object instead of a native WebSocket object.
window.WebSocket = MockSocket;

module('Simple Test',
  setup: function() {
    // NOTE: you must create a new MockServer before you create
    // a new MockSocket object. It is a good idea to place this
    // logic either at the top of your test or in a setup function.
    var mockServer = new MockServer('ws://localhost:8080');
    mockServer.on('connection', function(server) {
      server.on('message', function(data) {
        server.send('hello');
      });
    });
  }
);

asyncTest('basic test', function(){
    // This is creating a MockSocket object and not a WebSocket object
    var mockSocket = new WebSocket('ws://localhost:8080');
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

**NOTE:** It is good practice to reset the global WebSocket object back to its original object after your tests have finished.

### NodeJS

```js
require('./path/to/mocksocket/src/main');

// Here the objects have been set to the global
// object and can be referenced by: MockServer and MockSocket
```

### Ember-CLI wrapper
[@yratanov](https://github.com/yratanov) has been gracious to create a mock-sockets wrapper for websocket applications running in [ember-cli](https://github.com/yratanov/ember-cli-mock-socket).

## Building from source / Running tests

```
git clone git@github.com:thoov/mock-socket.git
cd mock-socket
npm i
npm i -g gulp
gulp
npm t
```

**NOTE:** If you make any changes to the src files you will need to run gulp to generate the new
dist files

### Feedback / Issues

If you have any feedback, encounter any bugs, or just have a question, please feel free to create a [github issue](https://github.com/thoov/mock-socket/issues/new) or send me a tweet at [@thoov](https://twitter.com/thoov).

### FAQ

* **LICENSE**: This library falls under the [MIT license](https://github.com/thoov/mock-socket/blob/master/LICENSE.txt)

### Third Party Libraries
* [js-url](https://github.com/websanova/js-url)
