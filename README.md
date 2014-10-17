# Mock Socks

A javascript mocking library for WebSockets. This library aims to make testing websocket applications as simple and
painless as possible. Inspired by [fakehr](https://github.com/trek/fakehr).

**Note** This is currently in beta and is still a work in progress

## Installation

`npm install mock-socks --save-dev`

## Background

MockSocks is comprised of 2 main parts. A mock "server" object and a mock "WebSockets" object. In this section
I will explain both of these parts.

**Mock Sockets Server**
This library adds a global object called `MockSocksServer` which you can use to create a fake socket server instance. Here
is where you would "mock" your server side application logic. Below is an example of this in action:

```js
var exampleServer = new MockSocksServer();
exampleServer.on('connection', function(server) {

    server.on('message', function(data) {
        server.send('hello');
    });

});
```

**Note:** This should look very familiar if you are using a node framework such as [ws](https://github.com/einaros/ws).

The second main part is another global variable called `MockSocks`. This is a drop in replacement for the standard WebSockets
global.

```js

window.WebSockets = MockSocks;

...

// Anything referencing WebSockets will now use the MockSocks object and
// will communicate with the MockSocksServer.

```

## Examples

Putting both of these parts together we can do something like this in our tests (Qunit):

```js
var exampleServer;
var originalSocketsReference;

module('Simple Test', {
    setup: function() {
        originalSocketsReference = window.WebSockets;
        window.WebSockets = MockSocks;

        exampleServer = new MockSocksServer();
        exampleServer.on('connection', function(server) {
            server.on('message', function(data) {
                server.send('hello');
            });
        });
    },

    teardown: function() {
        window.WebSockets = originalSocketsReference;
    }
});



asyncTest('basic test', function(){
    var exampleSocket = new WebSockets('ws://www.example.com/socketserver');

    exampleSocket.onopen(function() {
        equal(true, true, 'onopen fires as expected');
    });

    exampleSocket.onmessage(function(data) {
        equal(true, true, 'onmessage fires as expected');
        start();
    });

    exampleSocket.send('world');
});
```

## Building from source

* `git clone git@github.com:thoov/mock-socks.git`
* `cd mock-socks`
* `npm install`
* `gulp`

## Running tests

* `git clone git@github.com:thoov/mock-socks.git`
* `cd mock-socks`
* `npm install`
* `npm test`

## Feedback or issues

If you have any feedback, encounter any bugs, or just have a question, please feel free to create a [github issue](https://github.com/thoov/mock-socks/issues/new) or send me a tweet at [@thoov](https://twitter.com/thoov).

## FAQ

* **License**: Mock Socks falls under the [MIT license](https://github.com/thoov/mock-socks/blob/master/LICENSE.txt)
