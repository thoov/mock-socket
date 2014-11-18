# Mock Socks

A javascript mocking library for WebSockets. This library aims to make testing websocket applications as simple and
painless as possible. Inspired by [fakehr](https://github.com/trek/fakehr).

## Installation

`npm install mock-socks --save-dev`

## Simple example of using it in your app

MockSocks is comprised of 2 main parts. A mock "server" and a mock "WebSockets" object. In this section
I will explain both of these parts.

**Mock Sockets Server**
This library adds a global object called `MockSocksServer` which you can use to create a fake socket server instance.
Below is an example of this in action:

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

// Anything referencing WebSockets will now use the MockSocks object and will communicate with the MockSocksServer.

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

If you have any feedback, encounter any bugs, or just have a question, please feel free to create a [github issue](https://github.com/thoov/mock-socks/issues/new) or send me a tweet at @thoov.

## FAQ

* **License**: Mock Socks falls under the [MIT license](https://github.com/thoov/mock-socks/blob/master/LICENSE.txt)
